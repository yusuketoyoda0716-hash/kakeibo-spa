import { useLocalStorage } from "../../../shared/hooks/useLocalStorage";

const STORAGE_KEY = "kakeibo:transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEY, []);

  const addTransaction = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const addTransactions = (txs) => {
    setTransactions((prev) => [...txs, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id, patch) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t))
    );
  };

  return {
    transactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    updateTransaction,
  };
}