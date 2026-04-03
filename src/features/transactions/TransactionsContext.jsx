import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";

const TransactionsContext = createContext(null);

export function TransactionsProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error(error); return; }
        setTransactions(data ?? []);
      });
  }, [user]);

  const toRow = (tx) => ({
    id: tx.id ?? crypto.randomUUID(),
    user_id: user.id,
    date: tx.date,
    type: tx.type,
    category: tx.category,
    amount: tx.amount,
    note: tx.memo ?? tx.note ?? "",
  });

  const addTransaction = async (tx) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([toRow(tx)])
      .select()
      .single();

    if (error) { console.error(error); return; }
    setTransactions((prev) => [data, ...prev]);
  };

  const addTransactions = async (txs) => {
    const rows = txs.map(toRow);
    const { data, error } = await supabase
      .from("transactions")
      .insert(rows)
      .select();

    if (error) { console.error(error); return; }
    setTransactions((prev) => [...(data ?? []), ...prev]);
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) { console.error(error); return; }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = async (id, patch) => {
    const clean = {
      date: patch.date,
      type: patch.type,
      category: patch.category,
      amount: patch.amount,
      note: patch.memo ?? patch.note ?? "",
    };
    const { data, error } = await supabase
      .from("transactions")
      .update(clean)
      .eq("id", id)
      .select()
      .single();

    if (error) { console.error(error); return; }
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, addTransactions, deleteTransaction, updateTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionsContext);
}
