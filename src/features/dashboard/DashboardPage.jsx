import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTransactions } from "../transactions/hooks/useTransactions";

function thisMonth() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

function toMonth(dateStr) {
  return String(dateStr || "").slice(0, 7);
}

const COLORS = [
  "#4f8cff",
  "#34d399",
  "#f59e0b",
  "#f87171",
  "#a78bfa",
  "#22c55e",
  "#60a5fa",
  "#fb7185",
  "#eab308",
  "#38bdf8",
];

export default function DashboardPage() {
  const { transactions } = useTransactions();
  const month = thisMonth();

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

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map = new Map();
    for (const t of filtered) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const monthly = useMemo(() => {
    // 全取引を YYYY-MM ごとに集計
    const map = new Map();

    for (const t of transactions) {
      const m = String(t.date || "").slice(0, 7); // YYYY-MM
      if (!m) continue;

      if (!map.has(m)) map.set(m, { month: m, income: 0, expense: 0, balance: 0 });

      const row = map.get(m);
      if (t.type === "income") row.income += t.amount;
      if (t.type === "expense") row.expense += t.amount;
    }

    const rows = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
    for (const r of rows) r.balance = r.income - r.expense;

    // 直近12ヶ月だけに絞る（ポートフォリオ的に見やすい）
    return rows.slice(-12);
  }, [transactions]);


  return (
    <div style={{ maxWidth: 900 }}>
      <h1>ダッシュボード</h1>
      <p style={{ opacity: 0.8 }}>表示月：{month}</p>

      {/* サマリーカード */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        <Card title="収入" value={`${summary.income.toLocaleString()}円`} />
        <Card title="支出" value={`${summary.expense.toLocaleString()}円`} />
        <Card title="収支" value={`${summary.balance.toLocaleString()}円`} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 16,
        }}
      >
        {/* 円グラフ */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 12,
            background: "rgba(255,255,255,0.03)",
            minHeight: 280,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            支出カテゴリ内訳（今月）
          </div>

          {byCategory.length === 0 ? (
            <p style={{ opacity: 0.8 }}>今月の支出がありません</p>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name">
                    {byCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ランキング */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 12,
            background: "rgba(255,255,255,0.03)",
            minHeight: 280,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            支出カテゴリTop
          </div>

          {byCategory.length === 0 ? (
            <p style={{ opacity: 0.8 }}>データがありません</p>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
              {byCategory.slice(0, 8).map((c) => (
                <li key={c.name} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{c.name}</span>
                  <strong>{c.value.toLocaleString()}円</strong>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <p style={{ opacity: 0.7, marginTop: 14, fontSize: 13 }}>
        ※ グラフはポートフォリオ向けに「支出カテゴリ内訳」を可視化しています
      </p>

      <style>{`
        @media (max-width: 768px) {
          .grid2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 12,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ opacity: 0.8, fontSize: 13 }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{value}</div>
    </div>
  );
}
