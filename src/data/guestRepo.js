import { DEFAULT_CATEGORIES, recurringTxId } from "./defaults";
import { thisMonth, shiftMonth } from "../lib/dates";

// ゲストモード用のリポジトリ
// Firestore と同じ形の API を持ち、データはメモリ上だけに置く（リロードでサンプルに戻る）

function sampleData() {
  const m = thisMonth();
  const prev = shiftMonth(m, 1);
  let n = 0;
  const tx = (month, day, type, category, amount, note = "") => ({
    id: `sample-${++n}`,
    date: `${month}-${String(day).padStart(2, "0")}`,
    type, category, amount, note,
    recurringId: null, appliedMonth: null,
  });

  // 今月はまだ定期取引を反映していない状態にしておく
  // （ダッシュボードの「今月の定期取引を反映」を試せるように）
  const transactions = [
    tx(m, 1, "expense", "光熱費", 9800, "電気・ガス"),
    tx(m, 3, "expense", "食費", 6420, "スーパー まとめ買い"),
    tx(m, 5, "expense", "交通", 3000, "ICカードチャージ"),
    tx(m, 7, "expense", "娯楽", 4800, "映画・カフェ"),
    tx(m, 8, "expense", "日用品", 2350, "ドラッグストア"),
    tx(m, 10, "expense", "食費", 3860, "外食"),
    tx(m, 12, "expense", "美容", 5500, "美容院"),
    tx(m, 14, "expense", "医療", 1800, "通院"),
    tx(m, 15, "income", "その他", 12000, "フリマ売上"),
    tx(prev, 1, "expense", "家賃", 72000, "毎月1日"),
    tx(prev, 1, "expense", "通信", 4980, "スマホ"),
    tx(prev, 1, "income", "給与", 285000, ""),
    tx(prev, 6, "expense", "食費", 7200, "スーパー"),
    tx(prev, 18, "expense", "光熱費", 8900, "電気・ガス"),
    tx(prev, 22, "expense", "娯楽", 6500, "ライブ"),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const recurring = [
    { id: "sample-r1", type: "expense", category: "家賃", amount: 72000, note: "毎月1日" },
    { id: "sample-r2", type: "expense", category: "通信", amount: 4980, note: "スマホ" },
    { id: "sample-r3", type: "income", category: "給与", amount: 285000, note: "" },
  ];

  return { transactions, categories: [...DEFAULT_CATEGORIES, "給与"], recurring };
}

export function createGuestRepo() {
  const data = sampleData();
  const clone = (v) => structuredClone(v);

  return {
    async listTransactions() {
      return clone(data.transactions);
    },
    async addTransactions(txs) {
      const saved = txs.map((tx) => ({
        recurringId: null,
        appliedMonth: null,
        ...tx,
        id: tx.recurringId ? recurringTxId(tx.recurringId, tx.appliedMonth) : crypto.randomUUID(),
      }));
      const ids = new Set(saved.map((t) => t.id));
      data.transactions = [...saved, ...data.transactions.filter((t) => !ids.has(t.id))];
      return clone(saved);
    },
    async updateTransaction(id, patch) {
      data.transactions = data.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
    },
    async deleteTransaction(id) {
      data.transactions = data.transactions.filter((t) => t.id !== id);
    },

    async listCategories() {
      return clone(data.categories);
    },
    async addCategory(name) {
      data.categories = [...data.categories, name];
    },
    async removeCategory(name) {
      data.categories = data.categories.filter((c) => c !== name);
    },

    async listRecurring() {
      return clone(data.recurring);
    },
    async addRecurring(item) {
      const saved = { id: crypto.randomUUID(), ...item };
      data.recurring = [saved, ...data.recurring];
      return clone(saved);
    },
    async deleteRecurring(id) {
      data.recurring = data.recurring.filter((r) => r.id !== id);
    },
  };
}
