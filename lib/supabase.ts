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
  const meta = user.user_metadata || {};
  const identityData = user.identities?.[0]?.identity_data || {};

  // Extract name strictly from Google Auth profile metadata (never from email)
  const googleName =
    meta.full_name ||
    meta.name ||
    identityData.full_name ||
    identityData.name ||
    (meta.given_name
      ? `${meta.given_name} ${meta.family_name || ""}`.trim()
      : null) ||
    (identityData.given_name
      ? `${identityData.given_name} ${identityData.family_name || ""}`.trim()
      : null) ||
    "Student";

  return {
    id: user.id,
    email: user.email,
    name: googleName,
    avatarUrl:
      meta.avatar_url ||
      meta.picture ||
      identityData.avatar_url ||
      identityData.picture,
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

export interface CloudStudentProfile {
  progress: Record<string, LessonProgress>;
  name?: string | null;
  optIn?: boolean | null;
}

/**
 * Fetch progress from Supabase user_progress table
 */
export async function fetchCloudProgress(
  userId: string
): Promise<Record<string, LessonProgress> | null> {
  const profile = await fetchCloudStudentProfile(userId);
  return profile?.progress || null;
}

/**
 * Fetch full student profile (progress, display name, and opt-in preference) from Supabase
 */
export async function fetchCloudStudentProfile(
  userId: string
): Promise<CloudStudentProfile | null> {
  const client = getSupabaseClient();
  if (!client || !userId) return null;

  try {
    const { data, error } = await client
      .from("user_progress")
      .select("progress, name, opt_in")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[supabase] fetchCloudStudentProfile error:", error.message);
      return null;
    }

    if (!data) return null;

    const rawMeta = data.progress?._meta;
    const optIn =
      data.opt_in !== undefined && data.opt_in !== null
        ? Boolean(data.opt_in)
        : rawMeta?.optIn !== undefined && rawMeta?.optIn !== null
        ? Boolean(rawMeta.optIn)
        : true;

    return {
      progress: (data.progress as Record<string, LessonProgress>) || {},
      name: data.name || rawMeta?.name || null,
      optIn,
    };
  } catch (err) {
    console.warn("[supabase] fetchCloudStudentProfile exception:", err);
    return null;
  }
}

/**
 * Deterministic RFC4122 v4 UUID from an email or identifier string.
 * Ensures compatibility whether user_progress.user_id is typed as UUID or TEXT.
 */
export function emailToUUID(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  let hash1 = 0x811c9dc5;
  let hash2 = 0x597f;
  let hash3 = 0x1a2b;
  let hash4 = 0x3c4d;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    hash1 = (hash1 ^ ch) * 16777619;
    hash2 = (hash2 ^ (ch << 3)) * 31;
    hash3 = (hash3 ^ (ch << 5)) * 17;
    hash4 = (hash4 ^ (ch << 7)) * 13;
  }

  const p1 = (Math.abs(hash1) >>> 0).toString(16).padStart(8, "0");
  const p2 = (Math.abs(hash2) % 65536).toString(16).padStart(4, "0");
  const p3 = "4" + (Math.abs(hash3) % 4096).toString(16).padStart(3, "0");
  const p4 = "8" + (Math.abs(hash4) % 4096).toString(16).padStart(3, "0");
  const p5 = (
    (Math.abs(hash1 ^ hash4) >>> 0).toString(16).padStart(8, "0") +
    (Math.abs(hash2 ^ hash3) % 65536).toString(16).padStart(4, "0")
  );

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

/**
 * Fetch all students' progress for the cohort leaderboard from Supabase
 */
export interface CloudProgressRecord {
  user_id: string;
  email: string | null;
  name?: string | null;
  opt_in?: boolean | null;
  progress: Record<string, any>;
  updated_at: string;
}

export async function fetchCloudLeaderboard(): Promise<CloudProgressRecord[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from("user_progress")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn("[supabase] fetchCloudLeaderboard error:", error.message);
      return [];
    }

    return (data as CloudProgressRecord[]) || [];
  } catch (err) {
    console.warn("[supabase] fetchCloudLeaderboard exception:", err);
    return [];
  }
}

export async function saveCloudProgress(
  userId: string,
  progress: Record<string, LessonProgress>,
  email?: string,
  name?: string,
  optIn: boolean = true
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !userId) return false;

  try {
    const studentName = name || "Student";
    const payloadWithMeta = {
      ...progress,
      _meta: {
        optIn,
        name: studentName,
        email: email || null,
        updatedAt: new Date().toISOString(),
      },
    };

    // First attempt: upsert including optional name & opt_in columns
    const { error: fullError } = await client.from("user_progress").upsert(
      {
        user_id: userId,
        email: email || null,
        name: studentName,
        opt_in: optIn,
        progress: payloadWithMeta,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (!fullError) return true;

    // If column name/opt_in does not exist in schema cache (PGRST204), fallback to core columns
    if (fullError.code === "PGRST204" || fullError.message?.includes("column")) {
      const { error: fallbackError } = await client.from("user_progress").upsert(
        {
          user_id: userId,
          email: email || null,
          progress: payloadWithMeta,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (fallbackError) {
        console.warn("[supabase] saveCloudProgress fallback error:", fallbackError.message);
        return false;
      }
      return true;
    }

    console.warn("[supabase] saveCloudProgress error:", fullError.message);
    return false;
  } catch (err) {
    console.warn("[supabase] saveCloudProgress exception:", err);
    return false;
  }
}
