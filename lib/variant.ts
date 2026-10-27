/** 「M / 深藍」；client 同 server 都可以用 */
export function variantLabel(v: { size: string | null; color: string | null }) {
  return [v.size, v.color].filter(Boolean).join(" / ");
}
