import { useLocalStorage } from "../../../shared/hooks/useLocalStorage";

const STORAGE_KEY = "kakeibo:transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEY, []);

  const addTransaction = (tx) => {
    setTransactions([tx, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const updateTransaction = (id, patch) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id
          ? { ...t, ...patch, updatedAt: Date.now() }
          : t
      )
    );
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  };
}
