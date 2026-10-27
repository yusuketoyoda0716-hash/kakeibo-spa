import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

// 取引データはダッシュボード・一覧・追加の3画面で共有するので Context にまとめる
// → 追加した取引がすぐ他の画面にも反映される
const TransactionsContext = createContext(null);

const byDateDesc = (a, b) => b.date.localeCompare(a.date);

export function TransactionsProvider({ children }) {
  const { repo } = useAuth();
  const [transactions, setTransactions] = useState([]);

  // 保存先（repo）が変わるたびに読み込み直す
  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    repo
      .listTransactions()
      .then((rows) => { if (!cancelled) setTransactions(rows); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [repo]);

  const normalize = (tx) => ({
    date: tx.date,
    type: tx.type,
    category: tx.category,
    amount: tx.amount,
    note: tx.memo ?? tx.note ?? "",
    recurringId: tx.recurringId ?? null,
    appliedMonth: tx.appliedMonth ?? null,
  });

  const addTransactions = async (txs) => {
    try {
      const saved = await repo.addTransactions(txs.map(normalize));
      const ids = new Set(saved.map((t) => t.id));
      setTransactions((prev) =>
        [...saved, ...prev.filter((t) => !ids.has(t.id))].sort(byDateDesc)
      );
    } catch (e) { console.error(e); }
  };

  const addTransaction = (tx) => addTransactions([tx]);

  const deleteTransaction = async (id) => {
    try {
      await repo.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (e) { console.error(e); }
  };

  const updateTransaction = async (id, patch) => {
    const clean = {
      date: patch.date,
      type: patch.type,
      category: patch.category,
      amount: patch.amount,
      note: patch.memo ?? patch.note ?? "",
    };
    try {
      await repo.updateTransaction(id, clean);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...clean } : t)).sort(byDateDesc)
      );
    } catch (e) { console.error(e); }
  };

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, addTransactions, deleteTransaction, updateTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransactions() {
  return useContext(TransactionsContext);
}
