import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "註冊會員", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthCard
      title="註冊會員"
      description="一個帳戶管理晒屋企幾個小朋友嘅課程、出席同積分"
      footer={
        <>
          已經有帳戶？
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            登入
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
