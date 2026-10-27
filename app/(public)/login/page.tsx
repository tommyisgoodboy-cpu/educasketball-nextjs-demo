import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, FormAlert } from "@/components/auth/AuthCard";
import { safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "會員登入", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);

  return (
    <AuthCard
      title="會員登入"
      description="用電郵或電話登入，睇上課時間表、出席紀錄同積分"
      footer={
        <>
          未有帳戶？
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            免費註冊
          </Link>
        </>
      }
    >
      {target !== "/account" && target.startsWith("/account") && <FormAlert tone="info">請先登入會員帳戶。</FormAlert>}
      <LoginForm next={target} />
      <p className="text-center text-xs text-ink-subtle">忘記密碼？請 WhatsApp 我哋，職員會幫你重設。</p>
    </AuthCard>
  );
}
