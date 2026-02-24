import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import DashboardPage from "../features/dashboard/DashboardPage";
import TransactionsPage from "../features/transactions/TransactionsPage";
import AddPage from "../features/transactions/AddPage";
import SettingsPage from "../features/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "add", element: <AddPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
