import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/AuthContext";

export function useRecurring() {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState([]);

  // DB から定期取引テンプレ一覧を取得
  useEffect(() => {
    if (!user) {
      setRecurring([]);
      return;
    }

    supabase
      .from("recurring")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) { console.error(error); return; }
        setRecurring(data ?? []);
      });
  }, [user]);

  // 定期取引テンプレを追加する
  const addRecurring = async (item) => {
    const row = {
      ...item,
      id: crypto.randomUUID(), // ユニークIDを生成
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("recurring")
      .insert([row])
      .select()
      .single();

    if (error) { console.error(error); return; }

    setRecurring([data, ...recurring]);
  };

  // 定期取引テンプレを削除する
  const deleteRecurring = async (id) => {
    const { error } = await supabase
      .from("recurring")
      .delete()
      .eq("id", id);

    if (error) { console.error(error); return; }

    setRecurring(recurring.filter((r) => r.id !== id));
  };

  return { recurring, addRecurring, deleteRecurring };
}
