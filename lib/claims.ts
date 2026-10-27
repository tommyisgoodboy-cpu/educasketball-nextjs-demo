import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// 訪客報名後喺 httpOnly cookie 記低認領碼；同一部機登入 / 註冊時自動認領。
const COOKIE = "eb_claims";
const MAX_TOKENS = 10;
const UUID_RE = /^[0-9a-f-]{36}$/i;

async function readTokens() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string" && UUID_RE.test(t)) : [];
  } catch {
    return [];
  }
}

export async function rememberClaimToken(token: string) {
  const tokens = [...(await readTokens()), token].slice(-MAX_TOKENS);
  (await cookies()).set(COOKIE, JSON.stringify(tokens), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** 認領 cookie 入面所有報名，回傳認領咗幾多個；完咗清 cookie */
export async function claimPendingEnrollments(supabase: SupabaseClient<Database>) {
  const tokens = await readTokens();
  if (tokens.length === 0) return 0;
  const { data, error } = await supabase.rpc("claim_enrollments", { p_tokens: tokens });
  if (error) {
    console.error("claim_enrollments failed", error);
    return 0;
  }
  (await cookies()).delete(COOKIE);
  return data ?? 0;
}
