"use client";

import { setEnrollmentStatus } from "@/app/(admin)/admin/enrollments/actions";
import type { EnrollmentStatus } from "@/lib/supabase/types";
import { ConfirmButton } from "./ConfirmButton";

/** 按目前狀態顯示可以做嘅動作；候補轉正時如果已經滿額會先警告 */
export function EnrollmentActions({ id, status, studentName, isFull }: { id: string; status: EnrollmentStatus; studentName: string; isFull: boolean }) {
  const fullWarning = isFull ? `呢班已經滿額，確認之後會超出名額。\n` : "";
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "pending" && (
        <ConfirmButton variant="primary" action={() => setEnrollmentStatus(id, "confirmed")}>
          確認
        </ConfirmButton>
      )}
      {status === "waitlist" && (
        <ConfirmButton
          variant="primary"
          confirmText={`${fullWarning}確定將 ${studentName} 由候補轉正（已確認）？`}
          action={() => setEnrollmentStatus(id, "confirmed")}
        >
          候補轉正
        </ConfirmButton>
      )}
      {status !== "cancelled" ? (
        <ConfirmButton variant="ghost" confirmText={`確定取消 ${studentName} 嘅報名？`} action={() => setEnrollmentStatus(id, "cancelled")}>
          取消
        </ConfirmButton>
      ) : (
        <ConfirmButton variant="ghost" confirmText={`恢復 ${studentName} 嘅報名做「待確認」？`} action={() => setEnrollmentStatus(id, "pending")}>
          恢復
        </ConfirmButton>
      )}
    </div>
  );
}
