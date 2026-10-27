/** 公開示範站：鎖住會被濫用嘅動作（改網站設定、改角色、上載檔案）。示範資料每晚自動還原。 */
export const DEMO_LOCK = process.env.NEXT_PUBLIC_DEMO_LOCK === "1";
export const DEMO_LOCK_MESSAGE = "示範站唔開放呢個動作（防止濫用）；正式版會開放。示範資料每晚自動還原。";

/** WhatsApp 查詢預填訊息：預填訊息，等對方知道客人睇過示範 */
export const DEMO_WA_PREFIX = "你好，我正在睇 Educasketball 報名及會員示範";
export const DEMO_WA_MESSAGE = `${DEMO_WA_PREFIX}，想了解更多。`;
