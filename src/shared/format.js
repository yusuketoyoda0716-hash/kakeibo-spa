// 金額・日付の表示用ヘルパー

/** 1234 → "1,234" */
export function yen(n) {
  return new Intl.NumberFormat("ja-JP").format(Math.round(n || 0));
}

/** "2026-10" → "2026年10月" */
export function monthLabel(month) {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

/** "2026-10-27" → "10/27" */
export function shortDate(dateStr) {
  const [, m, d] = String(dateStr).split("-");
  return `${Number(m)}/${Number(d)}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-10-27" → "火" */
export function weekday(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}
