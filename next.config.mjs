import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// 基本安全 headers（全站適用）
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" }, // preload / includeSubDomains 交由主站統一決定
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 指明用呢個 project 做 tracing root，避免上層資料夾有另一個 lockfile 時認錯
  outputFileTracingRoot: projectRoot,
  poweredByHeader: false,
  // 預設喺網站根目錄運行；要掛喺子路徑（例如 /demo/edu）就設 NEXT_PUBLIC_BASE_PATH。
  // 純 <a href="/..."> 唔會自動加 basePath，所以程式碼會讀同一個變數手動加。
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    // 設 NEXT_PUBLIC_DEMO_LOCK=1：公開示範站鎖住危險動作（改設定 / 改角色 / 上載檔案）
    NEXT_PUBLIC_DEMO_LOCK: process.env.NEXT_PUBLIC_DEMO_LOCK ?? "",
  },
  // 經反向代理轉入時，Server Action 嘅 Origin 同 host 唔同，要明確允許（逗號分隔）
  experimental: { serverActions: { allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean) } },
  images: {
    // Supabase Storage（本地 + 雲端）
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
