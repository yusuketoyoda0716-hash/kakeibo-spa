// 初回ログイン時に自動で登録するカテゴリ
export const DEFAULT_CATEGORIES = [
  "食費", "日用品", "交通", "家賃", "光熱費",
  "通信", "娯楽", "医療", "美容", "その他",
];

// 定期取引から反映した取引のID
// 「テンプレID＋月」で決まるので、同じ月に何度反映しても1件にしかならない
export function recurringTxId(recurringId, month) {
  return `rec_${recurringId}_${month}`;
}
