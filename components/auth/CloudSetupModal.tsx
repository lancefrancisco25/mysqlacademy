"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Database,
  Key,
  ShieldCheck,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CloudSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- 1. Create the user_progress table
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- 3. Policy: Students can view only their own progress
drop policy if exists "Users can read own progress" on public.user_progress;
create policy "Users can read own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

-- 4. Policy: Students can insert their own progress
drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

-- 5. Policy: Students can update their own progress
drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress"
  on public.user_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

export function CloudSetupModal({ isOpen, onClose }: CloudSetupModalProps) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const envText = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Set Up Google Login & Cloud Progress Sync
              </h2>
              <p className="text-xs text-muted-foreground">
                4 quick steps to save student progress across all devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                1
              </span>
              <h3 className="font-semibold text-foreground">
                Create a Free Supabase Project
              </h3>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              Head to{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-500 hover:underline inline-flex items-center gap-1 font-medium"
              >
                supabase.com <ExternalLink className="h-3 w-3" />
              </a>{" "}
              and create a new project (it is 100% free and takes ~1 minute).
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                2
              </span>
              <h3 className="font-semibold text-foreground">
                Enable Google Auth Provider
              </h3>
            </div>
            <div className="text-xs text-muted-foreground pl-8 space-y-2">
              <p>
                In your Supabase project dashboard, go to{" "}
                <span className="font-mono text-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                  Authentication &gt; Providers &gt; Google
                </span>
                .
              </p>
              <p>
                Switch it to <strong className="text-foreground">Enabled</strong>, then paste your{" "}
                <strong className="text-foreground">Client ID</strong> and{" "}
                <strong className="text-foreground">Client Secret</strong> from the Google Cloud Console (APIs &amp; Services &gt; Credentials). Add your Supabase Callback URL to Google&apos;s authorized redirect URIs.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                  3
                </span>
                <h3 className="font-semibold text-foreground">
                  Create the Cloud Progress Table
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySql}
                className="h-7 text-xs gap-1.5"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              Open the{" "}
              <strong className="text-foreground">SQL Editor</strong> tab in your Supabase dashboard and run this query (or run{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                supabase-schema.sql
              </code>
              ):
            </p>
            <div className="pl-8">
              <pre className="text-[11px] font-mono bg-zinc-950 text-zinc-300 p-3 rounded-xl border border-zinc-800 overflow-x-auto max-h-36">
                {SQL_SCHEMA}
              </pre>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                  4
                </span>
                <h3 className="font-semibold text-foreground">
                  Add Environment Variables to `.env.local`
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEnv}
                className="h-7 text-xs gap-1.5"
              >
                {copiedEnv ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Keys</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              Copy your Project URL and Publishable (anon) API key from{" "}
              <span className="font-mono text-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                Project Settings &gt; API
              </span>{" "}
              into a local file named{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                .env.local
              </code>{" "}
              (and into Vercel Project Settings for cloud deployment):
            </p>
            <div className="pl-8">
              <pre className="text-xs font-mono bg-zinc-950 text-emerald-400 p-3 rounded-xl border border-zinc-800">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...your_anon_key
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Row Level Security ensures students only see their own data.</span>
          </div>
          <Button onClick={onClose} size="sm">
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
