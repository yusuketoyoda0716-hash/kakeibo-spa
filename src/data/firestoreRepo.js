import {
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, writeBatch, serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_CATEGORIES, recurringTxId } from "./defaults";

// Firestore のデータ構成（ユーザーごとにサブコレクションで分ける）
//   users/{uid}/transactions/{id}
//   users/{uid}/categories/{id}
//   users/{uid}/recurring/{id}
// セキュリティルールで「自分の uid 配下だけ読み書きできる」ようにしている（firestore.rules）

const toTx = (d) => {
  const t = d.data();
  return {
    id: d.id,
    date: t.date,
    type: t.type,
    category: t.category,
    amount: t.amount,
    note: t.note ?? "",
    recurringId: t.recurringId ?? null,
    appliedMonth: t.appliedMonth ?? null,
  };
};

export function createFirestoreRepo(uid) {
  const col = (name) => collection(db, "users", uid, name);

  return {
    // ── 取引 ─────────────────────────────
    async listTransactions() {
      const snap = await getDocs(query(col("transactions"), orderBy("date", "desc")));
      return snap.docs.map(toTx);
    },

    // 1件でも複数でもまとめて保存する（定期取引の一括反映で使う）
    async addTransactions(txs) {
      const batch = writeBatch(db);
      const saved = txs.map((tx) => {
        const id = tx.recurringId
          ? recurringTxId(tx.recurringId, tx.appliedMonth)
          : crypto.randomUUID();
        const row = {
          date: tx.date,
          type: tx.type,
          category: tx.category,
          amount: tx.amount,
          note: tx.note ?? "",
          ...(tx.recurringId
            ? { recurringId: tx.recurringId, appliedMonth: tx.appliedMonth }
            : {}),
        };
        batch.set(doc(col("transactions"), id), { ...row, createdAt: serverTimestamp() });
        return { id, recurringId: null, appliedMonth: null, ...row };
      });
      await batch.commit();
      return saved;
    },

    async updateTransaction(id, patch) {
      await updateDoc(doc(col("transactions"), id), { ...patch, updatedAt: serverTimestamp() });
    },

    async deleteTransaction(id) {
      await deleteDoc(doc(col("transactions"), id));
    },

    // ── カテゴリ ─────────────────────────
    async listCategories() {
      const snap = await getDocs(query(col("categories"), orderBy("order")));
      if (!snap.empty) return snap.docs.map((d) => d.data().name);

      // 初回ログイン時：デフォルトカテゴリを登録する
      const batch = writeBatch(db);
      DEFAULT_CATEGORIES.forEach((name, i) => {
        batch.set(doc(col("categories")), { name, order: i });
      });
      await batch.commit();
      return [...DEFAULT_CATEGORIES];
    },

    async addCategory(name) {
      await setDoc(doc(col("categories")), { name, order: Date.now() });
    },

    async removeCategory(name) {
      const snap = await getDocs(query(col("categories"), where("name", "==", name)));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    },

    // ── 定期取引テンプレ ─────────────────
    async listRecurring() {
      const snap = await getDocs(query(col("recurring"), orderBy("createdAt", "desc")));
      return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: undefined }));
    },

    async addRecurring(item) {
      const id = crypto.randomUUID();
      await setDoc(doc(col("recurring"), id), { ...item, createdAt: serverTimestamp() });
      return { id, ...item };
    },

    async deleteRecurring(id) {
      await deleteDoc(doc(col("recurring"), id));
    },
  };
}
