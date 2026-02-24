import { useState } from "react";
import { useCategories } from "./hooks/useCategories";
import { useRecurring } from "./hooks/useRecurring";

export default function SettingsPage() {
  // カテゴリ
  const { categories, addCategory, removeCategory } = useCategories();
  const [name, setName] = useState("");

  const onAdd = () => {
    addCategory(name);
    setName("");
  };

  // 定期取引（テンプレ）
  const { recurring, addRecurring, deleteRecurring } = useRecurring();
  const [rType, setRType] = useState("expense");
  const [rCategory, setRCategory] = useState("家賃");
  const [rAmount, setRAmount] = useState("");
  const [rNote, setRNote] = useState("");

  const onAddRecurring = () => {
    const n = Number(rAmount);
    if (!rCategory.trim() || !Number.isFinite(n) || n <= 0) return;

    addRecurring({
      type: rType,
      category: rCategory.trim(),
      amount: n,
      note: rNote.trim(),
    });

    setRAmount("");
    setRNote("");
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>設定</h1>

      {/* カテゴリ管理 */}
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
              <li
                key={c}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
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

      {/* 定期取引（テンプレ） */}
      <section
        style={{
          marginTop: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 12,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>定期取引（テンプレ）</h2>

        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <label>
            種別
            <select value={rType} onChange={(e) => setRType(e.target.value)}>
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
          </label>

          <label>
            カテゴリ
            <input
              value={rCategory}
              onChange={(e) => setRCategory(e.target.value)}
            />
          </label>

          <label>
            金額
            <input
              inputMode="numeric"
              value={rAmount}
              onChange={(e) => setRAmount(e.target.value)}
              placeholder="例：80000"
            />
          </label>

          <label>
            メモ（任意）
            <input value={rNote} onChange={(e) => setRNote(e.target.value)} />
          </label>

          <button onClick={onAddRecurring}>テンプレ追加</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {recurring.length === 0 ? (
            <p>定期取引テンプレはまだありません</p>
          ) : (
            <ul style={{ paddingLeft: 18, margin: 0, display: "grid", gap: 8 }}>
              {recurring.map((r) => (
                <li
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span>
                    {r.type === "expense" ? "支出" : "収入"} / {r.category} /{" "}
                    {r.amount.toLocaleString()}円
                    {r.note ? `（${r.note}）` : ""}
                  </span>
                  <button onClick={() => deleteRecurring(r.id)}>削除</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}