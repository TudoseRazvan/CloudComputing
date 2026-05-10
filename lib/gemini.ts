import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export type GenerateEmailInput = {
  prompt: string;
  tone: "formal" | "friendly" | "concise" | "persuasive" | "apologetic";
  language: "en" | "ro";
  recipientHint?: string;
  senderName?: string;
};

export type GeneratedEmail = {
  subject: string;
  body: string;
};

const TONE_DESCRIPTIONS: Record<GenerateEmailInput["tone"], string> = {
  formal: "professional and respectful, suitable for business correspondence",
  friendly: "warm, casual, and approachable",
  concise: "very brief and to-the-point, no filler",
  persuasive: "compelling and confident, designed to motivate the recipient",
  apologetic: "sincere and empathetic, taking responsibility",
};

const LANG_NAMES: Record<GenerateEmailInput["language"], string> = {
  en: "English",
  ro: "Romanian (Română)",
};

function buildPrompt(input: GenerateEmailInput): string {
  const tone = TONE_DESCRIPTIONS[input.tone] ?? "professional";
  const lang = LANG_NAMES[input.language] ?? "English";
  const recipient = input.recipientHint
    ? `The email is addressed to: ${input.recipientHint}.`
    : "";
  const sender = input.senderName ? `Sign the email as: ${input.senderName}.` : "";

  return [
    `You are an assistant that drafts emails. Write a complete email in ${lang}.`,
    `Tone: ${tone}.`,
    recipient,
    sender,
    `User's request: """${input.prompt}"""`,
    ``,
    `Hard constraints (must obey):`,
    `- Subject: max 80 characters, no emojis.`,
    `- Body: max 150 words. Greeting + 1-2 short paragraphs + sign-off. Use real newlines.`,
    `- Do not include any text outside the structured output.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function repairTruncatedJson(text: string): string {
  let s = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (s.endsWith("}")) return s;

  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') inString = !inString;
  }
  if (inString) s += '"';
  s += "}";
  return s;
}

function extractJson(text: string): GeneratedEmail {
  const candidate = repairTruncatedJson(text);
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(
      `Model did not return JSON. Raw (first 200 chars): "${text.slice(0, 200)}"`,
    );
  }
  const slice = candidate.slice(start, end + 1);
  let parsed: unknown;
  try {
    parsed = JSON.parse(slice);
  } catch (e) {
    throw new Error(
      `JSON parse failed: ${(e as Error).message}. Raw (first 200 chars): "${text.slice(0, 200)}"`,
    );
  }
  const obj = parsed as { subject?: unknown; body?: unknown };
  if (typeof obj.subject !== "string" || typeof obj.body !== "string") {
    throw new Error("Model JSON missing `subject` or `body` strings");
  }
  return { subject: obj.subject.trim(), body: obj.body.trim() };
}

export async function generateEmail(input: GenerateEmailInput): Promise<GeneratedEmail> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          subject: { type: SchemaType.STRING },
          body: { type: SchemaType.STRING },
        },
        required: ["subject", "body"],
      },
    },
  });

  const result = await model.generateContent(buildPrompt(input));
  const response = result.response;

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini returned no candidates");
  }
  const finish = candidate.finishReason;
  if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") {
    throw new Error(`Gemini stopped with reason: ${finish}`);
  }

  let text = "";
  try {
    text = response.text();
  } catch {
    text = candidate.content?.parts?.map((p) => ("text" in p ? p.text : "")).join("") ?? "";
  }
  if (!text || !text.trim()) {
    throw new Error(`Gemini returned empty response (finishReason=${finish ?? "unknown"})`);
  }
  return extractJson(text);
}
