"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      router.replace("/learn");
      return;
    }

    // Capture OAuth session from URL hash or exchange code
    client.auth.getSession().then(() => {
      router.replace("/learn");
    });
  }, [router]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      <p className="text-sm font-medium text-muted-foreground">
        Completing sign in and synchronizing your progress...
      </p>
    </div>
  );
}
