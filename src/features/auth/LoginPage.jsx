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
      setError("ログインに失敗しました。時間をおいてもう一度お試しください。");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="loginTitle">家計簿</h1>
        <p className="muted">ログインしてデータを保存しましょう</p>

        <button className="loginGoogleBtn" onClick={onGoogle} disabled={!canUseGoogle}>
          Googleでログイン
        </button>
        {!canUseGoogle && (
          <p className="panelSub">Firebase が未設定のため、ゲストモードのみ利用できます</p>
        )}
        {error && <p className="loginError">{error}</p>}

        <div className="loginDivider"><span>または</span></div>

        <button className="loginGuestBtn" onClick={signInAsGuest}>
          ゲストで試す
        </button>
        <p className="panelSub">サンプルデータで全機能を試せます（データは保存されません）</p>
      </div>
    </div>
  );
}
