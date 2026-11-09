import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import type { LessonProgress, StudentUser } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== "https://your-project-id.supabase.co" &&
      !supabaseUrl.includes("placeholder") &&
      !supabaseAnonKey.includes("PASTE_") &&
      !supabaseAnonKey.includes("placeholder")
  );
};

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance && supabaseUrl && supabaseAnonKey) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
}

export function mapSupabaseUser(user: User): StudentUser {
  return {
    id: user.id,
    email: user.email,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student",
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: new Error(
        "Supabase is not configured yet. Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      ),
    };
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  return { error: error ? new Error(error.message) : null };
}

export async function signOutStudent(): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };

  const { error } = await client.auth.signOut();
  return { error: error ? new Error(error.message) : null };
}

export async function getCurrentStudent(): Promise<StudentUser | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    if (!session?.user) return null;
    return mapSupabaseUser(session.user);
  } catch (err) {
    console.warn("[supabase] getSession error:", err);
    return null;
  }
}

/**
 * Fetch progress from Supabase user_progress table
 */
export async function fetchCloudProgress(
  userId: string
): Promise<Record<string, LessonProgress> | null> {
  const client = getSupabaseClient();
  if (!client || !userId) return null;

  try {
    const { data, error } = await client
      .from("user_progress")
      .select("progress")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[supabase] fetchCloudProgress error:", error.message);
      return null;
    }

    if (data?.progress && typeof data.progress === "object") {
      return data.progress as Record<string, LessonProgress>;
    }
    return {};
  } catch (err) {
    console.warn("[supabase] fetchCloudProgress exception:", err);
    return null;
  }
}

/**
 * Save / Upsert progress to Supabase user_progress table
 */
export async function saveCloudProgress(
  userId: string,
  progress: Record<string, LessonProgress>,
  email?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !userId) return false;

  try {
    const { error } = await client.from("user_progress").upsert(
      {
        user_id: userId,
        email: email || null,
        progress,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.warn("[supabase] saveCloudProgress error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[supabase] saveCloudProgress exception:", err);
    return false;
  }
}
