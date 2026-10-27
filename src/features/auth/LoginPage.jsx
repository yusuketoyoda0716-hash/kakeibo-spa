import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { signInWithGoogle, signInAsGuest, canUseGoogle } = useAuth();
  const [error, setError] = useState("");

  const onGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      // ポップアップを閉じただけのときはエラーを出さない
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") return;
      console.error(e);
      setError("ログインできませんでした。時間をおいてもう一度お試しください。");
    }
  };

  return (
    <div className="login">
      {/* 通帳の表紙 */}
      <div className="cover">
        <h1 className="cover__title">家計簿</h1>
        <div className="cover__rule" />
        <p className="cover__lead">収入と支出を記録して、毎月の残高を確かめられます。</p>

        <div className="cover__actions">
          <button
            type="button"
            className="btn btn--onCover"
            onClick={onGoogle}
            disabled={!canUseGoogle}
          >
            Googleでログイン
          </button>
          {!canUseGoogle && (
            <p className="cover__note">Firebase が未設定のため、ゲストモードのみ使えます</p>
          )}
          {error && <p className="cover__error" role="alert">{error}</p>}

          <button type="button" className="btn btn--giltOutline" onClick={signInAsGuest}>
            ゲストで試す
          </button>
          <p className="cover__note">サンプルデータで全機能を試せます（保存はされません）</p>
        </div>
      </div>
    </div>
  );
}
