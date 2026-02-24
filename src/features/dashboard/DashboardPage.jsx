import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
} from "recharts";
import { useTransactions } from "../transactions/hooks/useTransactions";
import { useRecurring } from "../settings/hooks/useRecurring";

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
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
  const { transactions, addTransactions } = useTransactions();
  const { recurring } = useRecurring();
  const month = thisMonth();

  const [applyMsg, setApplyMsg] = useState("");

  // 今月の取引だけ抽出
  const filtered = useMemo(() => {
    return transactions.filter((t) => toMonth(t.date) === month);
  }, [transactions, month]);

  // サマリー計算
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

  // 支出カテゴリ集計
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

  // 定期取引を今月に反映
  const applyRecurringForThisMonth = () => {
    const monthKey = month;

    const appliedIds = new Set(
      transactions
        .filter((t) => t.source === "recurring" && t.appliedMonth === monthKey)
        .map((t) => t.recurringId)
    );

    const toAdd = recurring
      .filter((r) => !appliedIds.has(r.id))
      .map((r) => ({
        id: crypto.randomUUID(),
        date: `${monthKey}-01`,
        type: r.type,
        category: r.category,
        amount: r.amount,
        note: r.note || "",
        createdAt: Date.now(),
        source: "recurring",
        recurringId: r.id,
        appliedMonth: monthKey,
      }));

    if (toAdd.length === 0) {
      setApplyMsg("今月はすでに反映済みです");
      return;
    }

    addTransactions(toAdd);
    setApplyMsg(`今月に ${toAdd.length} 件反映しました`);
  };

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

      {/* 定期取引反映ボタン */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button onClick={applyRecurringForThisMonth}>
          今月の定期取引を反映
        </button>
        <span style={{ opacity: 0.75, fontSize: 13 }}>{applyMsg}</span>
      </div>

      {/* 円グラフ & ランキング */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 16,
        }}
      >
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
                        key={entry.name}
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
                <li
                  key={c.name}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>{c.name}</span>
                  <strong>{c.value.toLocaleString()}円</strong>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
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