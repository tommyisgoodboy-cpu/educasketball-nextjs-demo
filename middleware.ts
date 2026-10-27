import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

// 1. 每個 request refresh Supabase session cookie
// 2. /account、/admin 要登入；已登入嘅人去 /login、/register 就轉去會員區
//    （/admin 嘅角色檢查喺 lib/admin.ts，每頁同每個 action 都會再查）
const PROTECTED = ["/account", "/admin", "/checkout"];
const GUEST_ONLY = ["/login", "/register"];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // 唔好喺 createServerClient 同 getUser 之間加其他邏輯
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && matches(pathname, PROTECTED)) {
    return redirectKeepingCookies(request, response, "/login", { next: pathname + search });
  }
  if (user && matches(pathname, GUEST_ONLY)) {
    return redirectKeepingCookies(request, response, "/account");
  }

  return response;
}

// redirect 時要帶返 refresh 咗嘅 session cookie，否則用戶會被登出
function redirectKeepingCookies(request: NextRequest, from: NextResponse, path: string, params: Record<string, string> = {}) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = new URLSearchParams(params).toString();
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
