import LoginPage from "../features/auth/LoginPage";
import { useAuth } from "../features/auth/AuthContext";

// ログインしていないユーザーをログインページに弾くコンポーネント
// 未ログイン → LoginPage を表示
// ログイン中 → 子コンポーネント（ページ本体）を表示
export default function RequireAuth({ children }) {
  const { repo, loading } = useAuth();

  // 認証状態の確認中は何も表示しない（チラつき防止）
  if (loading) return null;

  // 未ログイン（Googleログインもゲストモードもしていない）ならログインページへ
  if (!repo) return <LoginPage />;

  return children;
}
