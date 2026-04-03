import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/AuthContext";

export function useTransactions() {
  const { user } = useAuth(); // 現在ログイン中のユーザーを取得
  const [transactions, setTransactions] = useState([]);

  // ────────────────────────────────────────
  // DB からデータを取得する
  // user が変わるたびに再取得（ログイン・ログアウト時）
  // ────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    // supabase.from('transactions') → transactions テーブルを操作
    // .select('*')                  → 全カラムを取得
    // .eq('user_id', user.id)       → 自分のデータだけ絞り込む
    // .order('date', { ascending: false }) → 日付の新しい順に並べる
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

  // ────────────────────────────────────────
  // 取引を1件追加する
  // supabase.from(...).insert([...]) でDBに1行追加
  // ────────────────────────────────────────
  const addTransaction = async (tx) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...tx, user_id: user.id }]) // user_id を付けて保存
      .select()                               // 追加した行を返してもらう
      .single();                              // 1件だけなので single() で取り出す

    if (error) { console.error(error); return; }

    // 画面にすぐ反映（DBから再取得しなくていいよう state を更新）
    setTransactions((prev) => [data, ...prev]);
  };

  // ────────────────────────────────────────
  // 複数の取引を一括追加する（定期取引の反映で使う）
  // .insert([...]) に配列を渡すと複数行を一括挿入できる
  // ────────────────────────────────────────
  const addTransactions = async (txs) => {
    const rows = txs.map((tx) => ({ ...tx, user_id: user.id }));

    const { data, error } = await supabase
      .from("transactions")
      .insert(rows)
      .select();

    if (error) { console.error(error); return; }

    setTransactions((prev) => [...(data ?? []), ...prev]);
  };

  // ────────────────────────────────────────
  // 取引を削除する
  // .delete().eq('id', id) → id が一致する行を削除
  // ────────────────────────────────────────
  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) { console.error(error); return; }

    // 画面からも削除
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // ────────────────────────────────────────
  // 取引を更新する
  // .update({...}).eq('id', id) → id が一致する行を上書き
  // ────────────────────────────────────────
  const updateTransaction = async (id, patch) => {
    const { data, error } = await supabase
      .from("transactions")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) { console.error(error); return; }

    // 画面も更新
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? data : t))
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
