import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import TransactionsPage from "../features/transactions/TransactionsPage";
import AddPage from "../features/transactions/AddPage";
import SettingsPage from "../features/settings/SettingsPage";
import RequireAuth from "./RequireAuth";

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
