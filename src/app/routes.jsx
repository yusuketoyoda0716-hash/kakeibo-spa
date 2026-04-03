import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import TransactionsPage from "../features/transactions/TransactionsPage";
import AddPage from "../features/transactions/AddPage";
import SettingsPage from "../features/settings/SettingsPage";
import LoginPage from "../features/auth/LoginPage";
import { useAuth } from "../features/auth/AuthContext";

// ログインしていないユーザーをログインページに弾くコンポーネント
// 未ログイン → LoginPage を表示
// ログイン中 → 子コンポーネント（ページ本体）を表示
function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  // 認証状態の確認中は何も表示しない（チラつき防止）
  if (loading) return null;

  // 未ログインならログインページへ
  if (!user) return <LoginPage />;

  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      // AppLayout 全体を RequireAuth で囲む
      // → どのページにアクセスしてもログインが必要になる
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "add", element: <AddPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
