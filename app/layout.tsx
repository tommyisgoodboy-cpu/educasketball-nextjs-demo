import type { Metadata, Viewport } from "next";
import { Noto_Sans_HK } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const notoSansHK = Noto_Sans_HK({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(new URL(SITE_URL).origin), // SITE_URL 可能已含 basePath，只用 origin 避免重複
  robots: { index: false, follow: false }, // 示範站：唔俾搜尋引擎收錄
  applicationName: "Educasketball",
  openGraph: {
    type: "website",
    locale: "zh_HK",
    siteName: "Educasketball 籃球訓練班",
  },
  title: {
    default: "Educasketball 籃球訓練班",
    template: "%s｜Educasketball",
  },
  description: "以教育為本嘅籃球訓練班：幼兒、小學、中學及成人課程，清晰等級制度同技術評核。",
};

export const viewport: Viewport = {
  themeColor: "#173E77",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK" className={notoSansHK.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
