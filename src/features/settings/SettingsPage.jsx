import { useState } from "react";
import { useCategories } from "./hooks/useCategories";
import { useRecurring } from "./hooks/useRecurring";

export default function SettingsPage() {
  const { categories, addCategory, removeCategory } = useCategories();
  const [name, setName] = useState("");

  const onAdd = () => {
    addCategory(name);
    setName("");
  };

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
    <div className="settings">
      <h1>設定</h1>

      {/* カテゴリ管理 */}
      <section className="panelCard settings__section">
        <h2 style={{ marginTop: 0 }}>カテゴリ管理</h2>

        <div className="settings__addRow">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="カテゴリ名（例：交際費）"
          />
          <button onClick={onAdd}>追加</button>
        </div>

        {categories.length === 0 ? (
          <p className="muted">カテゴリがありません</p>
        ) : (
          <ul className="settings__list">
            {categories.map((c) => (
              <li key={c} className="settings__listItem">
                <span>{c}</span>
                <button onClick={() => removeCategory(c)}>削除</button>
              </li>
            ))}
          </ul>
        )}

        <p className="panelSub" style={{ marginTop: 12 }}>
          ※ 取引データとは別でブラウザに保存されます
        </p>
      </section>

      {/* 定期取引（テンプレ） */}
      <section className="panelCard settings__section">
        <h2 style={{ marginTop: 0 }}>定期取引（テンプレ）</h2>

        <div className="settings__form">
          <label>
            種別
            <select value={rType} onChange={(e) => setRType(e.target.value)}>
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
          </label>

          <label>
            カテゴリ
            <input value={rCategory} onChange={(e) => setRCategory(e.target.value)} />
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

        <div className="settings__recurringList">
          {recurring.length === 0 ? (
            <p className="muted">定期取引テンプレはまだありません</p>
          ) : (
            <ul className="settings__list">
              {recurring.map((r) => (
                <li key={r.id} className="settings__listItem">
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
