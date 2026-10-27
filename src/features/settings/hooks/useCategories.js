import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

export function useCategories() {
  const { repo } = useAuth();
  const [categories, setCategories] = useState([]);

  // カテゴリ一覧を取得（初回ログイン時はデフォルトカテゴリが自動登録される）
  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    repo
      .listCategories()
      .then((names) => { if (!cancelled) setCategories(names); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [repo]);

  // カテゴリを追加する
  const addCategory = async (name) => {
    const n = String(name || "").trim();
    if (!n) return;
    if (categories.includes(n)) return; // 重複は追加しない

    try {
      await repo.addCategory(n);
      setCategories((prev) => [...prev, n]);
    } catch (e) { console.error(e); }
  };

  // カテゴリを削除する
  const removeCategory = async (name) => {
    try {
      await repo.removeCategory(name);
      setCategories((prev) => prev.filter((c) => c !== name));
    } catch (e) { console.error(e); }
  };

  return { categories, addCategory, removeCategory };
}
