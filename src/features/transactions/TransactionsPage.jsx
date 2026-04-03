import { useMemo, useState } from "react";
import { useTransactions } from "./TransactionsContext";
import { useCategories } from "../settings/hooks/useCategories";

function toMonth(dateStr) {
  return String(dateStr || "").slice(0, 7);
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function TransactionsPage() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactions();
  const { categories, addCategory } = useCategories();

  const [month, setMonth] = useState(thisMonth());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    date: "",
    type: "expense",
    categoryMode: "select",
    categorySelected: "",
    categoryCustom: "",
    amount: "",
    note: "",
  });

  const filtered = useMemo(() => {
    return transactions.filter((t) => toMonth(t.date) === month);
  }, [transactions, month]);

  const summary = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  }, [filtered]);

  const startEdit = (t) => {
    setEditingId(t.id);

    const inList = categories.includes(t.category);

    setDraft({
      date: t.date,
      type: t.type,
      categoryMode: inList ? "select" : "custom",
      categorySelected: inList ? t.category : categories[0] ?? "食費",
      categoryCustom: inList ? "" : t.category,
      amount: String(t.amount),
      note: t.note ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const amountNum = Number(draft.amount);

    const category =
      draft.categoryMode === "select" ? draft.categorySelected : draft.categoryCustom;

    const c = String(category || "").trim();

    if (!draft.date) return;
    if (!c) return;
    if (!Number.isFinite(amountNum) || amountNum <= 0) return;

    if (draft.categoryMode === "custom") {
      addCategory(c);
    }

    updateTransaction(id, {
      date: draft.date,
      type: draft.type,
      category: c,
      amount: amountNum,
      note: draft.note.trim(),
    });

    setEditingId(null);
  };

  return (
    <div>
      <h1>取引一覧</h1>

      {/* 月フィルター */}
      <div className="monthFilter">
        <label>
          <span className="muted">表示月</span>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
      </div>

      {/* サマリー */}
      <div className="summaryCards">
        <Card title="収入" value={`${summary.income.toLocaleString()}円`} />
        <Card title="支出" value={`${summary.expense.toLocaleString()}円`} />
        <Card title="収支" value={`${summary.balance.toLocaleString()}円`} />
      </div>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <p className="muted">この月の取引はありません（「追加」から登録できます）</p>
      ) : (
        <ul className="txnList">
          {filtered.map((t) => {
            const isEditing = editingId === t.id;

            return (
              <li key={t.id} className="panelCard">
                {!isEditing ? (
                  <div className="txnRow">
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {t.type === "expense" ? "支出" : "収入"} / {t.category}
                      </div>
                      <div className="panelSub">
                        {t.date} {t.note ? `・${t.note}` : ""}
                      </div>
                    </div>

                    <div className="txnRow__right">
                      <div style={{ fontWeight: 900 }}>{t.amount.toLocaleString()}円</div>

                      <div className="txnRow__buttons">
                        <button className="btnSuccess btnSmall" onClick={() => startEdit(t)}>
                          編集
                        </button>

                        <button className="btnDanger btnSmall" onClick={() => setDeleteTarget(t)}>
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="txnEditForm">
                    <div className="txnEditFields">
                      <label>
                        日付
                        <input
                          type="date"
                          value={draft.date}
                          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                        />
                      </label>

                      <label>
                        種別
                        <select
                          value={draft.type}
                          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
                        >
                          <option value="expense">支出</option>
                          <option value="income">収入</option>
                        </select>
                      </label>

                      <label>
                        金額
                        <input
                          inputMode="numeric"
                          value={draft.amount}
                          onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                          placeholder="例：1200"
                        />
                      </label>
                    </div>

                    <fieldset className="txnCatFieldset">
                      <legend style={{ padding: "0 6px" }}>カテゴリ</legend>

                      <div className="txnCatModes">
                        <label className="txnCatMode">
                          <input
                            type="radio"
                            name={`catmode-${t.id}`}
                            checked={draft.categoryMode === "select"}
                            onChange={() => setDraft({ ...draft, categoryMode: "select" })}
                          />
                          選択
                        </label>

                        <label className="txnCatMode">
                          <input
                            type="radio"
                            name={`catmode-${t.id}`}
                            checked={draft.categoryMode === "custom"}
                            onChange={() => setDraft({ ...draft, categoryMode: "custom" })}
                          />
                          新規入力
                        </label>
                      </div>

                      {draft.categoryMode === "select" ? (
                        <select
                          value={draft.categorySelected}
                          onChange={(e) => setDraft({ ...draft, categorySelected: e.target.value })}
                          disabled={categories.length === 0}
                        >
                          {categories.length === 0 ? (
                            <option value="">カテゴリがありません（設定で追加してください）</option>
                          ) : (
                            categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <input
                          value={draft.categoryCustom}
                          onChange={(e) => setDraft({ ...draft, categoryCustom: e.target.value })}
                          placeholder="例：交際費"
                        />
                      )}
                    </fieldset>

                    <label>
                      メモ（任意）
                      <input
                        value={draft.note}
                        onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                      />
                    </label>

                    <div className="txnEditActions">
                      <button className="btnSuccess" onClick={() => saveEdit(t.id)}>
                        保存
                      </button>

                      <button onClick={cancelEdit}>キャンセル</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* 削除モーダル */}
      {deleteTarget && (
        <div className="modalOverlay" onClick={() => setDeleteTarget(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>取引を削除しますか？</h3>

            <p className="muted">
              {deleteTarget.category} / {deleteTarget.amount.toLocaleString()}円
            </p>

            <div className="modalActions">
              <button onClick={() => setDeleteTarget(null)}>キャンセル</button>

              <button
                className="btnDanger"
                onClick={() => {
                  deleteTransaction(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="panelCard">
      <div className="panelSub">{title}</div>
      <div style={{ fontWeight: 900, fontSize: 18 }}>{value}</div>
    </div>
  );
}
