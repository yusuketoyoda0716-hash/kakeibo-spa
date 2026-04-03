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

  const addTransaction = async (tx) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...tx, user_id: user.id }])
      .select()
      .single();

    if (error) { console.error(error); return; }
    setTransactions((prev) => [data, ...prev]);
  };

  const addTransactions = async (txs) => {
    const rows = txs.map((tx) => ({ ...tx, user_id: user.id }));
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
    const { data, error } = await supabase
      .from("transactions")
      .update({ ...patch, updated_at: new Date().toISOString() })
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
