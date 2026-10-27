"use server";

import { revalidatePath } from "next/cache";
import { rememberClaimToken } from "@/lib/claims";
import { HK_PHONE_ERROR, normalizeHKPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/lib/supabase/types";

export type EnrollFields = {
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_name: string;
  birth_year: string;
  years_playing: string;
  notes: string;
};

export type EnrollState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors: Partial<Record<keyof EnrollFields, string>>; values: EnrollFields }
  | { status: "success"; enrollmentStatus: EnrollmentStatus; studentName: string; enrollmentId?: string; stripeReady?: boolean };

const RPC_ERRORS: Record<string, string> = {
  EB001: "呢個班已經停止報名，請揀第二個班次。",
  EB002: "呢位學員已經報咗呢個班，唔使重複報名。",
};

function read(formData: FormData): EnrollFields {
  const get = (k: keyof EnrollFields) => String(formData.get(k) ?? "").trim();
  return {
    parent_name: get("parent_name"),
    parent_phone: get("parent_phone"),
    parent_email: get("parent_email"),
    student_name: get("student_name"),
    birth_year: get("birth_year"),
    years_playing: get("years_playing") || "0",
    notes: get("notes"),
  };
}

function validate(v: EnrollFields) {
  const errors: Partial<Record<keyof EnrollFields, string>> = {};
  const year = new Date().getFullYear();
  const birthYear = Number(v.birth_year);

  if (!v.parent_name) errors.parent_name = "請填寫家長姓名";
  if (!normalizeHKPhone(v.parent_phone)) errors.parent_phone = HK_PHONE_ERROR;
  if (v.parent_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.parent_email)) errors.parent_email = "電郵格式唔正確";
  if (!v.student_name) errors.student_name = "請填寫學員姓名";
  if (!Number.isInteger(birthYear) || birthYear < year - 80 || birthYear > year - 3) {
    errors.birth_year = `請填寫 ${year - 80}–${year - 3} 之間嘅出生年份`;
  }
  if (v.notes.length > 1000) errors.notes = "備註唔可以多過 1000 字";
  return errors;
}

function rpcErrorMessage(error: { code?: string; message: string } | null) {
  if (error?.code && RPC_ERRORS[error.code]) return RPC_ERRORS[error.code];
  if (error?.code === "EB003") return error.message;
  if (error) console.error("enroll rpc failed", error);
  return "系統暫時未能處理報名，請稍後再試或 WhatsApp 我哋。";
}

export async function enroll(classId: string, _prev: EnrollState, formData: FormData): Promise<EnrollState> {
  const supabase = await createClient();

  // 會員揀咗已有學員：唔使再填學員資料
  const studentId = String(formData.get("student_id") ?? "");
  if (studentId && studentId !== "new") {
    const notes = String(formData.get("notes") ?? "").trim();
    const { data, error } = await supabase.rpc("enroll_member", {
      p_class_id: classId,
      p_student_id: studentId,
      p_notes: notes,
    });
    if (error || !data?.[0]) {
      return { status: "error", message: rpcErrorMessage(error), fieldErrors: {}, values: { ...read(formData) } };
    }
    revalidatePath("/", "layout");
    return {
      status: "success",
      enrollmentStatus: data[0].status,
      studentName: String(formData.get("student_label") ?? ""),
      enrollmentId: data[0].enrollment_id,
      stripeReady: Boolean(process.env.STRIPE_SECRET_KEY),
    };
  }

  const values = read(formData);
  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "請檢查以下資料", fieldErrors, values };
  }

  const { data, error } = await supabase.rpc("enroll_guest", {
    p_class_id: classId,
    p_parent_name: values.parent_name,
    p_parent_phone: normalizeHKPhone(values.parent_phone) ?? values.parent_phone,
    p_parent_email: values.parent_email,
    p_student_name: values.student_name,
    p_birth_year: Number(values.birth_year),
    p_years_playing: Number(values.years_playing),
    p_notes: values.notes,
  });

  if (error || !data?.[0]) {
    return { status: "error", message: rpcErrorMessage(error), fieldErrors: {}, values };
  }

  // 訪客：記低認領碼，之後喺同一部機開帳戶 / 登入就會自動連結
  if (data[0].claim_token) await rememberClaimToken(data[0].claim_token);

  // 更新剩餘名額（報名頁側欄、課程列表同詳情）
  revalidatePath("/", "layout");

  return {
    status: "success",
    enrollmentStatus: data[0].status,
    studentName: values.student_name,
    enrollmentId: data[0].enrollment_id,
    stripeReady: Boolean(process.env.STRIPE_SECRET_KEY),
  };
}
