/** 示範站相庫：示範站唔開放上載，新增商品時由呢度揀相（public/demo-shop） */
export const DEMO_SHOP_IMAGES = Array.from({ length: 26 }, (_, i) => `/demo-shop/p${String(i + 1).padStart(2, "0")}.webp`);

export function isDemoShopImage(u: string) {
  return /^\/demo-shop\/p\d\d\.webp$/.test(u);
}

/** next/image 唔會自動幫 public 檔案加 basePath；示範相庫路徑喺度補返 */
export function imgSrc(u: string) {
  return isDemoShopImage(u) ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${u}` : u;
}
