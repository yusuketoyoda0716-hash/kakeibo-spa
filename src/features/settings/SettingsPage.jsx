import { useState } from "react";
import { useCategories } from "./hooks/useCategories";

export default function SettingsPage() {
  const { categories, addCategory, removeCategory } = useCategories();
  const [name, setName] = useState("");

  const onAdd = () => {
    addCategory(name);
    setName("");
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>設定</h1>

      <section
        style={{
          marginTop: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 12,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>カテゴリ管理</h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="カテゴリ名（例：交際費）"
            style={{ flex: 1 }}
          />
          <button onClick={onAdd}>追加</button>
        </div>

        {categories.length === 0 ? (
          <p>カテゴリがありません</p>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0, display: "grid", gap: 8 }}>
            {categories.map((c) => (
              <li key={c} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{c}</span>
                <button onClick={() => removeCategory(c)}>削除</button>
              </li>
            ))}
          </ul>
        )}

        <p style={{ opacity: 0.7, marginTop: 12, fontSize: 13 }}>
          ※ 取引データとは別でブラウザに保存されます
        </p>
      </section>
    </div>
  );
}
