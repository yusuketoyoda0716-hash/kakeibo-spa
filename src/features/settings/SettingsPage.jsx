import { useState } from "react";
import { Trash2, Repeat } from "lucide-react";
import { useCategories } from "./hooks/useCategories";
import { useRecurring } from "./hooks/useRecurring";
import { useAuth } from "../auth/AuthContext";
import CategoryIcon from "../../shared/CategoryIcon";
import { yen } from "../../shared/format";

export default function SettingsPage() {
  const { user, isGuest, signOut } = useAuth();
  const { categories, addCategory, removeCategory } = useCategories();
  const { recurring, addRecurring, deleteRecurring } = useRecurring();

  const [name, setName] = useState("");

  const [rType, setRType] = useState("expense");
  const [rCategory, setRCategory] = useState("家賃");
  const [rAmount, setRAmount] = useState("");
  const [rNote, setRNote] = useState("");
  const [rError, setRError] = useState("");

  const onAddCategory = (e) => {
    e.preventDefault();
    addCategory(name);
    setName("");
  };

  const onAddRecurring = (e) => {
    e.preventDefault();
    const amount = Number(rAmount);
    if (!rCategory.trim()) return setRError("カテゴリを入力してください");
    if (!Number.isFinite(amount) || amount <= 0) return setRError("金額は1円以上で入力してください");
    setRError("");
    addRecurring({ type: rType, category: rCategory.trim(), amount: Math.round(amount), note: rNote.trim() });
    setRAmount("");
    setRNote("");
  };

  return (
    <>
      <div className="pageHead">
        <h1>設定</h1>
      </div>

      {/* 定期取引 */}
      <section className="sheet" aria-labelledby="recurring-title">
        <div className="sheet__head">
          <h2 id="recurring-title">定期取引</h2>
          <span className="muted small">ホームのボタンで毎月1日付で記録できます</span>
        </div>

        <form className="recurringForm" onSubmit={onAddRecurring}>
          <label className="field">
            <span className="field__label">種別</span>
            <select className="select" value={rType} onChange={(e) => setRType(e.target.value)}>
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">カテゴリ</span>
            <input className="input" value={rCategory} onChange={(e) => setRCategory(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">金額（円）</span>
            <input className="input num" inputMode="numeric" value={rAmount} onChange={(e) => setRAmount(e.target.value)} placeholder="80000" />
          </label>
          <label className="field">
            <span className="field__label">メモ（任意）</span>
            <input className="input" value={rNote} onChange={(e) => setRNote(e.target.value)} />
          </label>
          <button type="submit" className="btn btn--primary">追加する</button>
        </form>
        {rError && <p className="sheet__note" role="alert" style={{ color: "var(--danger)" }}>{rError}</p>}

        {recurring.length === 0 ? (
          <p className="sheet__note">家賃や給与など、毎月決まった取引を登録しておくと便利です</p>
        ) : (
          <ul className="list">
            {recurring.map((r) => (
              <li key={r.id} className="list__item">
                <span className="list__main">
                  <Repeat size={16} aria-hidden="true" />
                  <span>
                    {r.category}
                    {r.note && <span className="muted small" style={{ marginLeft: 10 }}>{r.note}</span>}
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`num${r.type === "income" ? " ledger__amt--in" : ""}`}>
                    {r.type === "income" ? "+" : "−"}{yen(r.amount)}
                  </span>
                  <button type="button" className="iconBtn iconBtn--danger" onClick={() => deleteRecurring(r.id)} aria-label={`定期取引「${r.category}」を削除`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* カテゴリ */}
      <section className="sheet" aria-labelledby="category-title">
        <div className="sheet__head">
          <h2 id="category-title">カテゴリ</h2>
          <span className="muted small">{categories.length}件</span>
        </div>

        <form className="inlineForm" onSubmit={onAddCategory}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="新しいカテゴリ名（例：交際費）" aria-label="新しいカテゴリ名" />
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>追加する</button>
        </form>

        <ul className="list">
          {categories.map((c) => (
            <li key={c} className="list__item">
              <span className="list__main">
                <CategoryIcon name={c} size={16} />
                {c}
              </span>
              <button type="button" className="iconBtn iconBtn--danger" onClick={() => removeCategory(c)} aria-label={`カテゴリ「${c}」を削除`}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* アカウント */}
      <section className="sheet" aria-labelledby="account-title">
        <div className="sheet__head">
          <h2 id="account-title">アカウント</h2>
        </div>
        <div className="list__item">
          <span className="muted">{isGuest ? "ゲストモード（データは保存されません）" : user?.email}</span>
          <button type="button" className="btn btn--small" onClick={signOut}>
            {isGuest ? "ゲストモードを終了" : "ログアウト"}
          </button>
        </div>
      </section>
    </>
  );
}
