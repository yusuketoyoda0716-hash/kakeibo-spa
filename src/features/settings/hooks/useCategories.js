import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/AuthContext";

// ユーザーがカテゴリを1つも登録していない場合のデフォルト値
const DEFAULT_CATEGORIES = [
  "食費", "日用品", "交通", "家賃", "光熱費",
  "通信", "娯楽", "医療", "美容", "その他",
];

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  // DB からカテゴリ一覧を取得
  useEffect(() => {
    if (!user) {
      setCategories([]);
      return;
    }

    supabase
      .from("categories")
      .select("name")          // name カラムだけ取得
      .eq("user_id", user.id)
      .order("id")             // 登録順に並べる
      .then(({ data, error }) => {
        if (error) { console.error(error); return; }

        if (!data || data.length === 0) {
          // 初回ログイン時：デフォルトカテゴリを DB に保存する
          const rows = DEFAULT_CATEGORIES.map((name) => ({
            name,
            user_id: user.id,
          }));
          supabase.from("categories").insert(rows).then(() => {
            setCategories(DEFAULT_CATEGORIES);
          });
        } else {
          setCategories(data.map((row) => row.name));
        }
      });
  }, [user]);

  // カテゴリを追加する
  const addCategory = async (name) => {
    const n = String(name || "").trim();
    if (!n) return;
    if (categories.includes(n)) return; // 重複は追加しない

    const { error } = await supabase
      .from("categories")
      .insert([{ name: n, user_id: user.id }]);

    if (error) { console.error(error); return; }

    setCategories([...categories, n]);
  };

  // カテゴリを削除する
  // .delete().eq('user_id', ...).eq('name', ...) で対象行を特定して削除
  const removeCategory = async (name) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", user.id)
      .eq("name", name);

    if (error) { console.error(error); return; }

    setCategories(categories.filter((c) => c !== name));
  };

  return { categories, addCategory, removeCategory };
}
