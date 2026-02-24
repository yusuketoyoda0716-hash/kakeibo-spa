import { useMemo, useState } from "react";
import { useTransactions } from "./hooks/useTransactions";
import { useCategories } from "../settings/hooks/useCategories";

function today() {
    return new Date().toISOString().slice(0, 10);
}

export default function AddPage() {
    const { addTransaction } = useTransactions();
    const { categories, addCategory } = useCategories();

    const [date, setDate] = useState(today());
    const [type, setType] = useState("expense"); // expense / income
    const [categoryMode, setCategoryMode] = useState("select"); // select / custom

    const [categorySelected, setCategorySelected] = useState(categories[0] ?? "食費");
    const [categoryCustom, setCategoryCustom] = useState("");

    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    const category = useMemo(() => {
        return categoryMode === "select" ? categorySelected : categoryCustom;
    }, [categoryMode, categorySelected, categoryCustom]);

    const onSubmit = (e) => {
        e.preventDefault();
        const n = Number(amount);
        const c = String(category || "").trim();

        if (!date || !c || !Number.isFinite(n) || n <= 0) return;

        // customで入力したカテゴリは、希望なら自動でカテゴリ一覧に追加しておく
        if (categoryMode === "custom") {
            addCategory(c);
        }

        addTransaction({
            id: crypto.randomUUID(),
            date,
            type,
            category: c,
            amount: n,
            note: note.trim(),
            createdAt: Date.now(),
        });

        setAmount("");
        setNote("");
        setCategoryCustom("");
    };

    return (
        <div>
            <h1>追加</h1>

            <form className="form" onSubmit={onSubmit}>
                <div className="row">
                    <div className="field">
                        <div className="fieldLabel">日付</div>
                        <input
                            className="input"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <div className="fieldLabel">種別</div>
                        <select
                            className="select"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="expense">支出</option>
                            <option value="income">収入</option>
                        </select>
                    </div>
                </div>

                <div className="field">
                    <div className="fieldLabel">カテゴリ</div>


                    <div className="radioRow">
                        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                                type="radio"
                                name="categoryMode"
                                checked={categoryMode === "select"}
                                onChange={() => setCategoryMode("select")}
                            />
                            選択
                        </label>

                        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                                type="radio"
                                name="categoryMode"
                                checked={categoryMode === "custom"}
                                onChange={() => setCategoryMode("custom")}
                            />
                            新規入力
                        </label>
                    </div>

                    {categoryMode === "select" ? (
                        <select
                            className="select"
                            value={categorySelected}
                            onChange={(e) => setCategorySelected(e.target.value)}
                            disabled={categories.length === 0}
                        >
                            {categories.length === 0 ? (
                                <option value="">
                                    カテゴリがありません（設定で追加してください）
                                </option>
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
                            className="input"
                            value={categoryCustom}
                            onChange={(e) => setCategoryCustom(e.target.value)}
                            placeholder="例：交際費"
                        />
                    )}
                </div>

                <div className="row">
                    <div className="field">
                        <div className="fieldLabel">金額</div>
                        <input
                            className="input"
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="例：1200"
                        />
                    </div>

                    <div className="field">
                        <div className="fieldLabel">メモ（任意）</div>
                        <input
                            className="input"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="例：スーパー"
                        />
                    </div>
                </div>

                <button className="button" type="submit">
                    追加
                </button>

                <p className="helpText">
                    ※ 「新規入力」で追加したカテゴリは、自動でカテゴリ一覧にも保存します
                </p>
            </form>
        </div>
    );

}
