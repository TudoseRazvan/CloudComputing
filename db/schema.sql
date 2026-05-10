-- MailMind — Supabase schema

create table if not exists public.sent_emails (
  id          uuid primary key default gen_random_uuid(),
  user_email  text not null,
  recipient   text not null,
  subject     text not null,
  body        text not null,
  resend_id   text,
  sent_at     timestamptz not null default now()
);

create index if not exists idx_sent_emails_user_email_sent_at
  on public.sent_emails (user_email, sent_at desc);

-- Server uses the service-role key (bypasses RLS). RLS is enabled but no
-- policy is defined, which means clients with the anon key cannot read or
-- write — only our API routes can.
alter table public.sent_emails enable row level security;
