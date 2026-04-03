import { useAuth } from "./AuthContext";

export default function LoginPage() {
  // AuthContext から Googleログイン関数を取得
  const { signInWithGoogle } = useAuth();

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="loginTitle">家計簿</h1>
        <p className="muted">ログインしてデータを保存しましょう</p>
        <button className="loginGoogleBtn" onClick={signInWithGoogle}>
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
