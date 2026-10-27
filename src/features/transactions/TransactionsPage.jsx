import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransactions } from "./TransactionsContext";
import { useCategories } from "../settings/hooks/useCategories";
import { thisMonth, toMonth, shiftMonth } from "../../lib/dates";
import { yen, monthLabel } from "../../shared/format";
import LedgerRow from "./LedgerRow";

const NEW_CATEGORY = "__new__";

export default function TransactionsPage() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const { categories, addCategory } = useCategories();

  const [month, setMonth] = useState(thisMonth());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editError, setEditError] = useState("");

  // 通帳と同じく古い順に並べ、月初からの残高を計算する
  const rows = useMemo(() => {
    const list = transactions.filter((t) => toMonth(t.date) === month).reverse();
    list.sort((a, b) => a.date.localeCompare(b.date));
    const result = [];
    for (const t of list) {
      const prev = result.length ? result[result.length - 1].balance : 0;
      result.push({ tx: t, balance: prev + (t.type === "income" ? t.amount : -t.amount) });
    }
    return result;
  }, [transactions, month]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const { tx } of rows) {
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;
    }
    return { income, expense, balance: income - expense };
  }, [rows]);

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditError("");
    setDraft({
      date: t.date,
      type: t.type,
      category: categories.includes(t.category) ? t.category : NEW_CATEGORY,
      newCategory: categories.includes(t.category) ? "" : t.category,
      amount: String(t.amount),
      note: t.note ?? "",
    });
  };

  const saveEdit = () => {
    const amount = Number(draft.amount);
    const category = (draft.category === NEW_CATEGORY ? draft.newCategory : draft.category).trim();
    if (!draft.date) return setEditError("日付を入力してください");
    if (!category) return setEditError("カテゴリを選ぶか入力してください");
    if (!Number.isFinite(amount) || amount <= 0) return setEditError("金額は1円以上で入力してください");

    if (draft.category === NEW_CATEGORY) addCategory(category);
    updateTransaction(editingId, {
      date: draft.date,
      type: draft.type,
      category,
      amount: Math.round(amount),
      note: draft.note.trim(),
    });
    setEditingId(null);
  };

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  return (
    <>
      <div className="pageHead">
        <h1>通帳</h1>
        <div className="monthNav">
          <button type="button" className="iconBtn" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="前の月">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <span className="monthNav__label" aria-live="polite">{monthLabel(month)}</span>
          <button type="button" className="iconBtn" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="次の月">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="sheet">
        {rows.length === 0 ? (
          <div className="ledger__empty">
            {monthLabel(month)}の記録はありません
            <div>
              <Link to="/add" className="btn btn--primary">記録する</Link>
            </div>
          </div>
        ) : (
          <div className="ledger" role="table" aria-label={`${monthLabel(month)}の通帳`}>
            <div className="ledger__row ledger__row--head" role="row">
              <span role="columnheader">日付</span>
              <span role="columnheader">摘要</span>
              <span role="columnheader" className="ledger__amt">支出</span>
              <span role="columnheader" className="ledger__amt">収入</span>
              <span role="columnheader" className="ledger__bal">残高</span>
              <span role="columnheader" />
            </div>

            {rows.map(({ tx, balance }) =>
              editingId === tx.id ? (
                <div key={tx.id} className="ledger__row ledger__row--editing" role="row">
                  <div className="ledger__editor" role="cell">
                    <label className="field">
                      <span className="field__label">日付</span>
                      <input type="date" className="input" value={draft.date} onChange={set("date")} />
                    </label>
                    <label className="field">
                      <span className="field__label">種別</span>
                      <select className="select" value={draft.type} onChange={set("type")}>
                        <option value="expense">支出</option>
                        <option value="income">収入</option>
                      </select>
                    </label>
                    <label className="field">
                      <span className="field__label">金額（円）</span>
                      <input className="input num" inputMode="numeric" value={draft.amount} onChange={set("amount")} />
                    </label>
                    <label className="field">
                      <span className="field__label">カテゴリ</span>
                      <select className="select" value={draft.category} onChange={set("category")}>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value={NEW_CATEGORY}>新しいカテゴリ…</option>
                      </select>
                    </label>
                    {draft.category === NEW_CATEGORY && (
                      <label className="field field--wide">
                        <span className="field__label">新しいカテゴリ名</span>
                        <input className="input" value={draft.newCategory} onChange={set("newCategory")} placeholder="例：交際費" />
                      </label>
                    )}
                    <label className="field field--wide">
                      <span className="field__label">メモ（任意）</span>
                      <input className="input" value={draft.note} onChange={set("note")} />
                    </label>
                    <div className="ledger__editorActions">
                      <button type="button" className="btn btn--dangerText" style={{ marginRight: "auto" }} onClick={() => setDeleteTarget(tx)}>
                        削除する
                      </button>
                      {editError && <span className="small" style={{ color: "var(--danger)" }} role="alert">{editError}</span>}
                      <button type="button" className="btn btn--quiet" onClick={() => setEditingId(null)}>キャンセル</button>
                      <button type="button" className="btn btn--primary" onClick={saveEdit}>保存する</button>
                    </div>
                  </div>
                </div>
              ) : (
                <LedgerRow
                  key={tx.id}
                  tx={tx}
                  balance={balance}
                  onEdit={() => startEdit(tx)}
                  onDelete={() => setDeleteTarget(tx)}
                />
              )
            )}

            <div className="ledger__row ledger__row--total" role="row">
              <span role="cell" />
              <span role="cell">月の合計</span>
              <span className="ledger__amt" role="cell">{yen(totals.expense)}</span>
              <span className="ledger__amt ledger__amt--in" role="cell">{yen(totals.income)}</span>
              <span className={`ledger__signed${totals.balance >= 0 ? " ledger__amt--in" : ""}`} aria-hidden="true">
                {totals.balance >= 0 ? "+" : "−"}
                {yen(Math.abs(totals.balance))}
              </span>
              <span className="ledger__bal" role="cell" style={{ color: "var(--ink)" }}>
                {totals.balance < 0 ? "−" : ""}
                {yen(Math.abs(totals.balance))}
              </span>
              <span role="cell" />
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal" onClick={() => setDeleteTarget(null)}>
          <div className="modal__card" role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="del-title">この記録を削除しますか？</h2>
            <p className="muted">
              <span className="num">{deleteTarget.date}</span>
              <span style={{ margin: "0 12px" }}>{deleteTarget.category}</span>
              <span className="num">¥{yen(deleteTarget.amount)}</span>
            </p>
            <div className="modal__actions">
              <button type="button" className="btn btn--quiet" onClick={() => setDeleteTarget(null)}>キャンセル</button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  deleteTransaction(deleteTarget.id);
                  if (editingId === deleteTarget.id) setEditingId(null);
                  setDeleteTarget(null);
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
