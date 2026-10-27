import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Repeat } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useTransactions } from "../transactions/TransactionsContext";
import { useRecurring } from "../settings/hooks/useRecurring";
import { thisMonth, today, toMonth } from "../../lib/dates";
import { yen, monthLabel } from "../../shared/format";
import CategoryIcon from "../../shared/CategoryIcon";
import LedgerRow from "../transactions/LedgerRow";

const CHART = "#008a74";
const MAX_BARS = 6;

// 縦軸の目盛り：1万以上は「◯万」と短く表示
const compactYen = (v) => (v >= 10000 ? `${v / 10000}万` : yen(v));

function SpendTooltip({ active, payload, month }) {
  if (!active || !payload?.length) return null;
  const { day, total } = payload[0].payload;
  return (
    <div className="chartTip">
      <div className="muted">{Number(month.slice(5))}/{day}までの支出</div>
      <strong>¥{yen(total)}</strong>
    </div>
  );
}

export default function DashboardPage() {
  const { transactions, addTransactions } = useTransactions();
  const { recurring } = useRecurring();
  const month = thisMonth();
  const [applyMsg, setApplyMsg] = useState("");

  const monthTx = useMemo(
    () => transactions.filter((t) => toMonth(t.date) === month),
    [transactions, month]
  );

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of monthTx) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [monthTx]);

  // 今日までの支出の累計（日ごと）
  const spendSeries = useMemo(() => {
    const lastDay = Number(today().slice(8));
    const perDay = Array(lastDay + 1).fill(0);
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      const d = Number(t.date.slice(8));
      if (d <= lastDay) perDay[d] += t.amount;
    }
    const series = [];
    for (let d = 1; d <= lastDay; d++) {
      const prev = series.length ? series[series.length - 1].total : 0;
      series.push({ day: d, total: prev + perDay[d] });
    }
    return series;
  }, [monthTx]);

  // カテゴリ別の支出（多い順。7位以下は「その他」にまとめる）
  const byCategory = useMemo(() => {
    const map = new Map();
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
    const rows = [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (rows.length <= MAX_BARS) return rows;
    const head = rows.slice(0, MAX_BARS - 1);
    const rest = rows.slice(MAX_BARS - 1).reduce((s, r) => s + r.value, 0);
    return [...head, { name: "その他", value: rest, isOther: true }];
  }, [monthTx]);

  const maxCategory = byCategory[0]?.value || 1;
  const recent = monthTx.slice(0, 5);

  const applyRecurring = () => {
    if (recurring.length === 0) {
      setApplyMsg("定期取引が未登録です。設定から登録できます。");
      return;
    }
    const applied = new Set(
      transactions.filter((t) => t.recurringId && t.appliedMonth === month).map((t) => t.recurringId)
    );
    const toAdd = recurring
      .filter((r) => !applied.has(r.id))
      .map((r) => ({
        date: `${month}-01`,
        type: r.type,
        category: r.category,
        amount: r.amount,
        note: r.note || "",
        recurringId: r.id,
        appliedMonth: month,
      }));

    if (toAdd.length === 0) {
      setApplyMsg("今月分は記録済みです");
      return;
    }
    addTransactions(toAdd);
    setApplyMsg(`${toAdd.length}件を1日付で記録しました`);
  };

  const lastDay = spendSeries.length;
  const xTicks = [1, 8, 15, 22, 29].filter((d) => d <= lastDay);

  return (
    <>
      <div className="pageHead">
        <h1>{monthLabel(month)}</h1>
      </div>

      <div className="sheet">
        {/* 残高 */}
        <div className="balance">
          <div>
            <div className="balance__label">今月の残高（収入 − 支出）</div>
            <div className={`balance__amount${summary.balance < 0 ? " is-negative" : ""}`}>
              {summary.balance < 0 ? "−" : ""}¥{yen(Math.abs(summary.balance))}
            </div>
            <div className="balance__flow num">
              <div><span>収入</span>¥{yen(summary.income)}</div>
              <div><span>支出</span>¥{yen(summary.expense)}</div>
            </div>
          </div>

          <div className="balance__actions">
            <button type="button" className="btn btn--small" onClick={applyRecurring}>
              <Repeat size={15} aria-hidden="true" />
              今月の定期取引を記録
            </button>
            <span className="muted small" role="status">{applyMsg}</span>
          </div>
        </div>

        {/* 支出の推移とカテゴリ別 */}
        <div className="dashGrid">
          <section aria-labelledby="spend-trend">
            <h2 id="spend-trend">支出の累計</h2>
            {summary.expense === 0 ? (
              <p className="muted">今月の支出はまだありません</p>
            ) : (
              <div className="chartBox">
                <ResponsiveContainer>
                  <AreaChart data={spendSeries} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#dde9e5" vertical={false} />
                    <XAxis
                      dataKey="day"
                      ticks={xTicks}
                      tickFormatter={(d) => `${d}日`}
                      padding={{ left: 10, right: 4 }}
                      tickLine={false}
                      axisLine={{ stroke: "#b3cbc3" }}
                      tick={{ fill: "#566966", fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={compactYen}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tick={{ fill: "#566966", fontSize: 12 }}
                    />
                    <Tooltip
                      content={<SpendTooltip month={month} />}
                      cursor={{ stroke: "#b3cbc3", strokeWidth: 1 }}
                    />
                    <Area
                      type="stepAfter"
                      dataKey="total"
                      stroke={CHART}
                      strokeWidth={2}
                      fill={CHART}
                      fillOpacity={0.1}
                      activeDot={{ r: 4, fill: CHART, stroke: "#fafcfb", strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section aria-labelledby="spend-by-cat">
            <h2 id="spend-by-cat">カテゴリ別の支出</h2>
            {byCategory.length === 0 ? (
              <p className="muted">今月の支出はまだありません</p>
            ) : (
              <ul className="bars">
                {byCategory.map((c) => (
                  <li key={c.name} className="bars__item">
                    <span className="bars__name">
                      <CategoryIcon name={c.isOther ? "" : c.name} size={15} />
                      {c.name}
                    </span>
                    <span className="bars__value">
                      ¥{yen(c.value)}
                      <small>{Math.round((c.value / summary.expense) * 100)}%</small>
                    </span>
                    <div className="bars__track" aria-hidden="true">
                      <div className="bars__fill" style={{ width: `${(c.value / maxCategory) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* 最近の記録 */}
      <div className="sheet">
        <div className="sheet__head">
          <h2>最近の記録</h2>
        </div>
        {recent.length === 0 ? (
          <div className="ledger__empty">
            今月の記録はまだありません
            <div>
              <Link to="/add" className="btn btn--primary">記録する</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="ledger ledger--compact" role="table" aria-label="最近の記録">
              <div className="ledger__row ledger__row--head" role="row">
                <span role="columnheader">日付</span>
                <span role="columnheader">摘要</span>
                <span role="columnheader" className="ledger__amt">支出</span>
                <span role="columnheader" className="ledger__amt">収入</span>
              </div>
              {recent.map((t) => (
                <LedgerRow key={t.id} tx={t} />
              ))}
            </div>
            <div className="dashFoot">
              <Link to="/transactions" className="btn btn--quiet btn--small">通帳をすべて見る</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
