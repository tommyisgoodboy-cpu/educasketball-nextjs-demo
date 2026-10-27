// 香港電話：8 位數字、2–9 字頭；接受 +852 / 852 前綴、空格同連字號。
// 同資料庫 normalize_hk_phone() 規則一致（DB 會再檢查一次）。

export const HK_PHONE_ERROR = "請輸入有效嘅香港電話號碼（8 位數字）";

/** "+852 9123-4567" → "9123 4567"；唔係有效香港號碼回傳 null */
export function normalizeHKPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("852")) digits = digits.slice(3);
  return /^[2-9]\d{7}$/.test(digits) ? `${digits.slice(0, 4)} ${digits.slice(4)}` : null;
}

/** "+852 2345 6789" → "tel:+85223456789" */
export function telHref(display: string) {
  const digits = display.replace(/\D/g, "");
  return `tel:+${digits.startsWith("852") ? digits : `852${digits}`}`;
}
