import { useLocalStorage } from "../../../shared/hooks/useLocalStorage";

const STORAGE_KEY = "kakeibo:recurring";

export function useRecurring() {
  const [recurring, setRecurring] = useLocalStorage(STORAGE_KEY, []);

  const addRecurring = (item) => {
    setRecurring([{ ...item, id: crypto.randomUUID(), createdAt: Date.now() }, ...recurring]);
  };

  const deleteRecurring = (id) => {
    setRecurring(recurring.filter((r) => r.id !== id));
  };

  return { recurring, addRecurring, deleteRecurring };
}