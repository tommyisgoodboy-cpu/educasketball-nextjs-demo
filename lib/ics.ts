// 一鍵導入日曆：產生 iCalendar (.ics)。時間一律轉做 UTC（香港冇夏令時間，+8），Apple / Google / Outlook 都直接識。
export type IcsEvent = {
  uid: string;
  date: string; // YYYY-MM-DD（香港日期）
  start: string; // HH:MM[:SS]（香港時間）
  end: string;
  summary: string;
  location?: string | null;
  description?: string | null;
  cancelled?: boolean;
};

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** 每行最多 75 bytes，超出就折行（下一行開頭一個空格） */
function fold(line: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function utc(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, hh - 8, mm));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}T${p(t.getUTCHours())}${p(t.getUTCMinutes())}00Z`;
}

export function buildIcs(calendarName: string, events: IcsEvent[]) {
  const stamp = utc(new Date().toISOString().slice(0, 10), "08:00");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Educasketball//Schedule//ZH", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(calendarName)}`, "X-WR-TIMEZONE:Asia/Hong_Kong"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utc(e.date, e.start)}`,
      `DTEND:${utc(e.date, e.end)}`,
      `SUMMARY:${esc(e.cancelled ? `【停課】${e.summary}` : e.summary)}`,
    );
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push(`STATUS:${e.cancelled ? "CANCELLED" : "CONFIRMED"}`, "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:快將上堂", "TRIGGER:-PT1H", "END:VALARM", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** inline = true：瀏覽器直接交俾日曆 app（iPhone / Mac 會彈出「加入日曆」）；否則下載檔案 */
export function icsResponse(body: string, filename: string, inline = false) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
