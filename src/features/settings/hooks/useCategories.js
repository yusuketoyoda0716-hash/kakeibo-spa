import { useLocalStorage } from "../../../shared/hooks/useLocalStorage";

const STORAGE_KEY = "kakeibo:categories";

const DEFAULT_CATEGORIES = [
  "食費",
  "日用品",
  "交通",
  "家賃",
  "光熱費",
  "通信",
  "娯楽",
  "医療",
  "美容",
  "その他",
];

export function useCategories() {
  const [categories, setCategories] = useLocalStorage(
    STORAGE_KEY,
    DEFAULT_CATEGORIES
  );

  const addCategory = (name) => {
    const n = String(name || "").trim();
    if (!n) return;
    if (categories.includes(n)) return;
    setCategories([...categories, n]);
  };

  const removeCategory = (name) => {
    setCategories(categories.filter((c) => c !== name));
  };

  return { categories, addCategory, removeCategory };
}
