import { useEffect, useMemo, useState } from "react";
import { useTransactions } from "./hooks/useTransactions";
import { useCategories } from "../settings/hooks/useCategories";
import { useLocalStorage } from "../../shared/hooks/useLocalStorage";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatJPY(n) {
  try {
    return new Intl.NumberFormat("ja-JP").format(n || 0);
  } catch {
    return String(n || 0);
  }
}

function catIcon(name) {
  const n = String(name || "");
  if (n.includes("食")) return "🍚";
  if (n.includes("日") || n.includes("消耗")) return "🧻";
  if (n.includes("交") || n.includes("電車") || n.includes("バス")) return "🚃";
  if (n.includes("家") || n.includes("住")) return "🏠";
  if (n.includes("光") || n.includes("水") || n.includes("ガス")) return "💡";
  if (n.includes("通") || n.includes("ネット")) return "📶";
  if (n.includes("娯") || n.includes("遊")) return "🎮";
  if (n.includes("医") || n.includes("薬")) return "🏥";
  if (n.includes("美") || n.includes("服")) return "🧴";
  return "🏷️";
}

function AmountPad({ value, onChange }) {
  const push = (ch) => {
    if (ch === "C") return onChange("");
    if (ch === "⌫") return onChange(value.slice(0, -1));
    if (!/^\d+$/.test(ch)) return;

    const next = (value + ch).replace(/^0+(?=\d)/, "0");
    onChange(next);
  };

  const keys = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    ["00", "0", "⌫"],
  ];

  return (
    <div className="pad">
      {keys.map((row, i) => (
        <div className="pad__row" key={i}>
          {row.map((k) => (
            <button
              key={k}
              type="button"
              className="pad__key"
              onClick={() => push(k)}
            >
              {k}
            </button>
          ))}
        </div>
      ))}
      <button type="button" className="pad__clear" onClick={() => push("C")}>
        クリア
      </button>
    </div>
  );
}

function CategorySheet({
  open,
  categories,
  recentCats,
  selected,
  onSelect,
  onClose,
}) {
  if (!open) return null;

  const recent = (recentCats || []).filter((c) => categories.includes(c));

  return (
    <div className="sheet" role="dialog" aria-modal="true">
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel">
        <div className="sheet__header">
          <div className="sheet__title">カテゴリ選択</div>
          <button className="sheet__close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sheet__list">
          {categories.length === 0 ? (
            <div className="sheet__empty">
              カテゴリがありません（設定で追加してください）
            </div>
          ) : (
            <>
              {recent.length > 0 && (
                <>
                  <div className="sheet__sectionTitle">最近</div>
                  <div className="sheet__grid">
                    {recent.map((c) => (
                      <button
                        key={"recent:" + c}
                        type="button"
                        className={`sheet__chip ${
                          c === selected ? "is-active" : ""
                        }`}
                        onClick={() => {
                          onSelect(c);
                          onClose();
                        }}
                      >
                        <span className="chip__icon">{catIcon(c)}</span>
                        <span className="chip__text">{c}</span>
                      </button>
                    ))}
                  </div>
                  <div className="sheet__divider" />
                </>
              )}

              <div className="sheet__sectionTitle">すべて</div>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`sheet__item ${c === selected ? "is-active" : ""}`}
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                >
                  <span className="item__icon">{catIcon(c)}</span>
                  <span className="item__text">{c}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddPage() {
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();

  const [type, setType] = useState("expense");

  const [amountStr, setAmountStr] = useState("");
  const amount = useMemo(() => Number(amountStr || 0), [amountStr]);

  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [category, setCategory] = useState(categories[0] ?? "食費");

  const [recentCats, setRecentCats] = useLocalStorage("kakeibo:recentCats", []);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!categories.includes(category)) setCategory(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const canSubmit = amount > 0 && !!date && !!String(category || "").trim();

  const onSubmit = () => {
    if (!canSubmit) return;

    addTransaction({
      id: crypto.randomUUID(),
      date,
      type,
      category: String(category).trim(),
      amount,
      note: note.trim(),
      createdAt: Date.now(),
    });

    // 最近カテゴリ更新
    setRecentCats((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      const next = [category, ...p.filter((c) => c !== category)];
      return next.slice(0, 8);
    });

    setAmountStr("");
    setNote("");
  };

  return (
    <div className="add2">
      <div className="add2__top">
        <button
          type="button"
          className={`add2__segBtn ${type === "expense" ? "is-on" : ""}`}
          onClick={() => setType("expense")}
        >
          支出
        </button>
        <button
          type="button"
          className={`add2__segBtn ${type === "income" ? "is-on" : ""}`}
          onClick={() => setType("income")}
        >
          収入
        </button>
      </div>

      <div className="add2__amount">
        <div className="add2__currency">¥</div>
        <div className="add2__value">{formatJPY(amount)}</div>
      </div>

      <AmountPad value={amountStr} onChange={setAmountStr} />

      <div className="add2__meta">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="メモ（任意）"
        />
      </div>

      <div className="add2__bottom">
        <button
          type="button"
          className="add2__catBtn"
          onClick={() => setSheetOpen(true)}
        >
          <span className="catBtn__icon">{catIcon(category)}</span>
          <span className="catBtn__text">{category}</span>
        </button>

        <button
          type="button"
          className="add2__okBtn"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          OK
        </button>
      </div>

      <CategorySheet
        open={sheetOpen}
        categories={categories}
        recentCats={recentCats}
        selected={category}
        onSelect={setCategory}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}