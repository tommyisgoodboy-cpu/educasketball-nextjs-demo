"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile, safeNext } from "@/lib/auth";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/constants";
import { DEMO_LOCK } from "@/lib/demo";
import { claimPendingEnrollments } from "@/lib/claims";
import { HK_PHONE_ERROR, normalizeHKPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }
  | { status: "check-email"; email: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!identifier || !password) {
    return { status: "error", message: "請輸入電郵或電話，同埋密碼", values: { identifier } };
  }

  const supabase = await createClient();
  // 電郵直接登入；香港電話（8 位）先喺伺服器搵返對應電郵，電郵唔會傳去瀏覽器
  let email = identifier.toLowerCase();
  if (!identifier.includes("@")) {
    const phone = normalizeHKPhone(identifier);
    if (!phone) return { status: "error", message: "請輸入有效電郵，或 8 位香港電話", values: { identifier } };
    // 密鑰只喺伺服器環境變數；冇設定 = 電話登入停用（唔可以俾 anon 直接查電郵）
    const key = process.env.PHONE_LOGIN_KEY;
    if (!key) return { status: "error", message: "暫時未開放電話登入，請用電郵登入。", values: { identifier } };
    const { data } = await supabase.rpc("email_for_phone", { p_phone: phone, p_key: key });
    if (!data) return { status: "error", message: "電話或密碼唔正確", values: { identifier } };
    email = data;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message =
      error.code === "email_not_confirmed" ? "請先撳電郵入面嘅確認連結，再登入。" : "電郵 / 電話或密碼唔正確";
    return { status: "error", message, values: { identifier } };
  }

  await claimPendingEnrollments(supabase);
  revalidatePath("/", "layout");

  // 冇指定目的地時，管理員同教練直接去後台
  if (next === "/account") {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "admin" || profile?.role === "coach") redirect("/admin");
  }
  redirect(next);
}

/**
 * 一鍵試玩（只限公開示範站）：用示範帳戶直接登入，唔使客人自己打電郵同密碼。
 * 示範資料每晚自動還原，危險動作（改設定 / 改角色 / 上載）已鎖住。
 */
export async function demoLogin(formData: FormData): Promise<void> {
  if (!DEMO_LOCK) redirect("/login");
  const role = String(formData.get("role") ?? "");
  const account = DEMO_ACCOUNTS.find((a) => a.role === role);
  if (!account) redirect("/login");

  const supabase = await createClient();
  // 家長：每位訪客一個獨立臨時帳戶 + 私人示範資料（多人同時試玩互不干擾）；失敗先退返共用帳戶。
  // 例外：已經以管理員 / 教練身分登入、再切去家長，用共用示範家長帳戶——咁先睇得到你喺後台 / 教練端加嘅
  // 徽章、備注、點名（臨時帳戶係全新私人資料，睇唔到）。
  let email: string = account.email;
  const before = await getProfile();
  const fromStaff = before?.role === "admin" || before?.role === "coach";
  if (role === "會員家長" && !fromStaff) {
    // 同一部瀏覽器再撳「家長」：重用上次嗰個臨時帳戶（cookie 記住），唔好每次新開一個——
    // 否則後台「最近報名」「學員」會堆晒一大堆同一個「小明」。帳戶唔存在（已被還原 / 清走）先開新嘅。
    const jar = await cookies();
    const prev = jar.get("edu_demo_parent")?.value;
    if (prev && /^demo-[0-9a-f]{8}@educasketball\.test$/.test(prev)) {
      const { error: reuse } = await supabase.auth.signInWithPassword({ email: prev, password: DEMO_PASSWORD });
      if (!reuse) {
        revalidatePath("/", "layout");
        redirect("/account");
      }
    }
    const { data: spawned } = await supabase.rpc("demo_spawn_member");
    if (spawned) {
      email = spawned;
      jar.set("edu_demo_parent", spawned, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 });
    }
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  if (error) redirect("/login");

  revalidatePath("/", "layout");
  redirect(role === "會員家長" ? "/account" : "/admin");
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  };
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!values.full_name) fieldErrors.full_name = "請填寫姓名";
  if (values.full_name.length > 100) fieldErrors.full_name = "姓名太長";
  if (!normalizeHKPhone(values.phone)) fieldErrors.phone = HK_PHONE_ERROR;
  if (!EMAIL_RE.test(values.email)) fieldErrors.email = "電郵格式唔正確";
  if (password.length < 8) fieldErrors.password = "密碼最少要 8 個字元";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "請檢查以下資料", fieldErrors, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: { data: { full_name: values.full_name, phone: normalizeHKPhone(values.phone) } },
  });

  if (error) {
    const message =
      error.code === "user_already_exists" ? "呢個電郵已經註冊咗，請直接登入。" :
      error.code === "weak_password" ? "密碼太簡單，請揀一個難估啲嘅密碼。" :
      "暫時未能註冊，請稍後再試。";
    if (!["user_already_exists", "weak_password"].includes(error.code ?? "")) console.error("signUp failed", error);
    return { status: "error", message, values };
  }

  // 雲端開咗電郵確認嘅話，signUp 唔會即時有 session
  if (!data.session) {
    return { status: "check-email", email: values.email };
  }

  await claimPendingEnrollments(supabase);
  revalidatePath("/", "layout");
  redirect("/account?welcome=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * 示範站：一鍵還原示範資料（會清走訪客自己註冊嘅帳戶同改動）。已登入先可以用，3 分鐘冷卻。
 * 還原後所有帳戶重建，所以自動用返同一個試玩帳戶登入。出錯 / 冷卻會回傳 error，由按鈕顯示。
 */
export async function resetDemo(): Promise<{ error: string } | void> {
  if (!DEMO_LOCK) redirect("/");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const email = auth.user.email;

  const { data, error } = await supabase.rpc("demo_reset_now");
  if (error) {
    console.error("demo_reset_now failed", error);
    return { error: "暫時未能還原，請稍後再試。" };
  }
  if (data === "cooldown") return { error: "剛剛已經還原過，請 3 分鐘後再試。" };
  if (data === "demo_only") return { error: "只有三個試玩帳戶（管理員 / 教練 / 家長）可以還原示範資料。" };
  if (data !== "ok") redirect("/login");

  await supabase.auth.signOut();
  const account = DEMO_ACCOUNTS.find((a) => a.email === email);
  if (account) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: account.email, password: DEMO_PASSWORD });
    revalidatePath("/", "layout");
    if (!signInError) redirect(account.role === "會員家長" ? "/account" : "/admin");
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
