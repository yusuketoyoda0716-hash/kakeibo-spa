import { useEffect, useState } from "react";
import { Delete, X } from "lucide-react";
import { useTransactions } from "./TransactionsContext";
import { useCategories } from "../settings/hooks/useCategories";
import { useLocalStorage } from "../../shared/hooks/useLocalStorage";
import { today } from "../../lib/dates";
import { yen } from "../../shared/format";
import CategoryIcon from "../../shared/CategoryIcon";

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "00", "0", "back"];
const MAX_DIGITS = 9; // 999,999,999円まで

function AmountPad({ value, onChange }) {
  const press = (key) => {
    if (key === "back") return onChange(value.slice(0, -1));
    const next = (value + key).replace(/^0+/, "");
    if (next.length > MAX_DIGITS) return;
    onChange(next);
  };

  return (
    <div className="pad">
      {KEYS.map((k) =>
        k === "back" ? (
          <button key={k} type="button" className="pad__key pad__key--sub" onClick={() => press(k)} aria-label="1文字消す">
            <Delete size={22} aria-hidden="true" />
          </button>
        ) : (
          <button key={k} type="button" className="pad__key" onClick={() => press(k)}>
            {k}
          </button>
        )
      )}
    </div>
  );
}

function CategorySheet({ categories, recent, selected, onSelect, onClose }) {
  const recentShown = recent.filter((c) => categories.includes(c));

  const chip = (c) => (
    <button
      key={c}
      type="button"
      className="catChip"
      aria-pressed={c === selected}
      onClick={() => {
        onSelect(c);
        onClose();
      }}
    >
      <CategoryIcon name={c} size={20} />
      {c}
    </button>
  );

  return (
    <div className="bottomSheet">
      <div className="bottomSheet__backdrop" onClick={onClose} />
      <div className="bottomSheet__panel" role="dialog" aria-modal="true" aria-labelledby="cat-title">
        <div className="bottomSheet__head">
          <h2 id="cat-title">カテゴリを選ぶ</h2>
          <button type="button" className="iconBtn" onClick={onClose} aria-label="閉じる">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="muted">カテゴリがありません。設定から追加できます。</p>
        ) : (
          <>
            {recentShown.length > 0 && (
              <>
                <h3 className="bottomSheet__section">最近使った</h3>
                <div className="catGrid">{recentShown.map(chip)}</div>
              </>
            )}
            <h3 className="bottomSheet__section">すべて</h3>
            <div className="catGrid">{categories.map(chip)}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AddPage() {
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();

  const [type, setType] = useState("expense");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("食費");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [done, setDone] = useState("");
  const [recentCats, setRecentCats] = useLocalStorage("kakeibo:recentCats", []);

  const amount = Number(amountStr || 0);

  // 選んでいたカテゴリが一覧から消えたら先頭のカテゴリにする
  useEffect(() => {
    if (categories.length === 0 || categories.includes(category)) return;
    setCategory(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const canSubmit = amount > 0 && Boolean(date) && Boolean(category.trim());

  const onSubmit = () => {
    if (!canSubmit) return;
    addTransaction({ date, type, category: category.trim(), amount, note: note.trim() });

    setRecentCats((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return [category, ...list.filter((c) => c !== category)].slice(0, 6);
    });

    setDone(`${category} ¥${yen(amount)}（${type === "income" ? "収入" : "支出"}）を記録しました`);
    setAmountStr("");
    setNote("");
  };

  return (
    <>
      <div className="pageHead">
        <h1>記録する</h1>
      </div>

      <div className="sheet slip">
        <div className="slip__body">
          <div className="segmented" role="group" aria-label="種別">
            <button type="button" aria-pressed={type === "expense"} onClick={() => setType("expense")}>
              支出
            </button>
            <button type="button" aria-pressed={type === "income"} onClick={() => setType("income")}>
              収入
            </button>
          </div>

          <div className="slip__amount" aria-live="polite">
            <span className="slip__yen">¥</span>
            <span className={`slip__value${amount ? "" : " is-empty"}`}>{yen(amount)}</span>
          </div>

          <AmountPad
            value={amountStr}
            onChange={(v) => {
              setAmountStr(v);
              setDone("");
            }}
          />

          <div className="slip__meta">
            <label className="field">
              <span className="field__label">日付</span>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">メモ（任意）</span>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例：ランチ" />
            </label>
          </div>

          <div className="slip__actions">
            <button type="button" className="catBtn" onClick={() => setSheetOpen(true)}>
              <CategoryIcon name={category} size={22} />
              <span>
                <small>カテゴリ</small>
                {category}
              </span>
            </button>
            <button type="button" className="btn btn--primary" disabled={!canSubmit} onClick={onSubmit}>
              記録する
            </button>
          </div>

          <p className="slip__done" role="status">{done}</p>
        </div>
      </div>

      {sheetOpen && (
        <CategorySheet
          categories={categories}
          recent={recentCats}
          selected={category}
          onSelect={setCategory}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
