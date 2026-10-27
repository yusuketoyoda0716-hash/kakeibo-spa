import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

export function useRecurring() {
  const { repo } = useAuth();
  const [recurring, setRecurring] = useState([]);

  // 定期取引テンプレ一覧を取得
  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    repo
      .listRecurring()
      .then((rows) => { if (!cancelled) setRecurring(rows); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [repo]);

  // 定期取引テンプレを追加する
  const addRecurring = async (item) => {
    try {
      const saved = await repo.addRecurring(item);
      setRecurring((prev) => [saved, ...prev]);
    } catch (e) { console.error(e); }
  };

  // 定期取引テンプレを削除する
  const deleteRecurring = async (id) => {
    try {
      await repo.deleteRecurring(id);
      setRecurring((prev) => prev.filter((r) => r.id !== id));
    } catch (e) { console.error(e); }
  };

  return { recurring, addRecurring, deleteRecurring };
}
