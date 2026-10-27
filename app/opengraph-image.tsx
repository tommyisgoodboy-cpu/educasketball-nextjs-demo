import { ImageResponse } from "next/og";

export const alt = "Educasketball";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 分享到 WhatsApp / Facebook 時嘅預覽圖（英文字避免要載中文字型）
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #0C2242, #173E77)", color: "white" }}>
        <div style={{ fontSize: 88, fontWeight: 800, display: "flex" }}>
          Educa<span style={{ color: "#7FCBFA" }}>sketball</span>
        </div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#D6E4F5" }}>Basketball training with clear levels & progress</div>
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          {["L1 Starter", "L2 Foundation", "L3 Intermediate", "L4 Elite"].map((l) => (
            <div key={l} style={{ padding: "12px 24px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontSize: 28 }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
