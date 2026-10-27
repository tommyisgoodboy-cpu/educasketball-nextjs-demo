import type { MetadataRoute } from "next";

// 示範站：唔俾搜尋引擎收錄
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
