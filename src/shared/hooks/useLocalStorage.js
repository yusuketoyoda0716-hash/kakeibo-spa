import { useEffect, useRef, useState } from "react";

/**
 * localStorage が使えない環境（Safariプライベート等）でもアプリが落ちない
 * - 読み取り失敗 → initialValue を使う
 * - 書き込み失敗 → state は更新する（ただし永続化はできない）
 */
export function useLocalStorage(key, initialValue) {
  const keyRef = useRef(key);
  keyRef.current = key;

  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[useLocalStorage] read failed:", e);
      return initialValue;
    }
  });

  // key が変わった時に読み直す（念のため）
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) {
        setValue(initialValue);
        return;
      }
      setValue(JSON.parse(raw));
    } catch (e) {
      console.warn("[useLocalStorage] re-read failed:", e);
      setValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // state が変わったら localStorage へ保存
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch (e) {
      // Safariプライベート/容量不足など
      console.warn("[useLocalStorage] write failed:", e);
    }
  }, [value]);

  // setValue をラップ：関数更新も通す
  const set = (next) => {
    setValue((prev) => (typeof next === "function" ? next(prev) : next));
  };

  return [value, set];
}