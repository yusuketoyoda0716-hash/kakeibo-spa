import { Pencil, Trash2 } from "lucide-react";
import CategoryIcon from "../../shared/CategoryIcon";
import { yen, shortDate, weekday } from "../../shared/format";

// 通帳の1行：日付｜摘要（カテゴリ・メモ）｜支出｜収入｜（残高）｜（操作）
export default function LedgerRow({ tx, balance, onEdit, onDelete }) {
  const isIncome = tx.type === "income";
  const hasOps = Boolean(onEdit || onDelete);

  // 行をクリック（スマホではタップ）しても編集を開ける
  const rowProps = onEdit
    ? {
        className: "ledger__row is-clickable",
        tabIndex: 0,
        onClick: onEdit,
        onKeyDown: (e) => {
          if (e.key === "Enter") onEdit();
        },
      }
    : { className: "ledger__row" };

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div role="row" {...rowProps}>
      <span className="ledger__date" role="cell">
        {shortDate(tx.date)}
        <small>{weekday(tx.date)}</small>
      </span>

      <span className="ledger__desc" role="cell">
        <span className="ledger__descIcon">
          <CategoryIcon name={tx.category} size={16} />
        </span>
        <span className="ledger__descText">
          <span className="ledger__cat">{tx.category}</span>
          {tx.note && <span className="ledger__memo">{tx.note}</span>}
        </span>
      </span>

      <span className="ledger__amt" role="cell">{isIncome ? "" : yen(tx.amount)}</span>
      <span className="ledger__amt ledger__amt--in" role="cell">{isIncome ? yen(tx.amount) : ""}</span>

      {/* スマホ用：金額を1つの欄に（＋/−付き） */}
      <span className={`ledger__signed${isIncome ? " ledger__amt--in" : ""}`} aria-hidden="true">
        {isIncome ? "+" : "−"}
        {yen(tx.amount)}
      </span>

      {balance !== undefined && (
        <span className="ledger__bal" role="cell">
          {balance < 0 ? "−" : ""}
          {yen(Math.abs(balance))}
        </span>
      )}

      {hasOps && (
        <span className="ledger__ops" role="cell">
          {onEdit && (
            <button type="button" className="iconBtn" onClick={stop(onEdit)} aria-label={`${tx.category}の記録を編集`}>
              <Pencil size={16} aria-hidden="true" />
            </button>
          )}
          {onDelete && (
            <button type="button" className="iconBtn iconBtn--danger" onClick={stop(onDelete)} aria-label={`${tx.category}の記録を削除`}>
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </span>
      )}
    </div>
  );
}
