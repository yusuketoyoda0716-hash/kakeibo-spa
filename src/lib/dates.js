// 日付はすべて「端末のローカル時刻」で扱う
// （toISOString() は UTC になるため、日本時間の 0〜9 時に前日扱いになってしまう）

const pad = (n) => String(n).padStart(2, "0");

/** 今日の日付（例：2026-10-27） */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 今月（例：2026-10） */
export function thisMonth() {
  return today().slice(0, 7);
}

/** 日付文字列から月を取り出す（例：2026-10-27 → 2026-10） */
export function toMonth(dateStr) {
  return String(dateStr || "").slice(0, 7);
}

/** 指定した月の n か月前（例：2026-01, 1 → 2025-12） */
export function shiftMonth(month, n) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 - n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
