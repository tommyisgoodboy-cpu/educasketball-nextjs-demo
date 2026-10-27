"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { markPaid } from "@/lib/payment";

/** 示範：模擬付款成功（唔經 Stripe），之後去付款後畫面 */
export async function simulatePayment(enrollmentId: string) {
  const result = await markPaid(enrollmentId, "simulated", `DEMO-SIM-${Date.now()}`);
  if (!result.ok) redirect(`/enroll/paid?e=${encodeURIComponent(enrollmentId)}&via=simulated&error=1`);
  revalidatePath("/", "layout");
  redirect(`/enroll/paid?e=${encodeURIComponent(enrollmentId)}&via=simulated`);
}
