import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { AuthProvider } from "./features/auth/AuthContext";
// フォントはアプリに同梱する（外部サービスに依存しない）
import "@fontsource/biz-udpgothic/400.css";
import "@fontsource/biz-udpgothic/700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* AuthProvider でアプリ全体を囲むことで
        どこからでも useAuth() でログイン状態を参照できる */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
