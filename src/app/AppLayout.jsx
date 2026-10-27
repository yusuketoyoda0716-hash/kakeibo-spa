import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, PlusCircle, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { TransactionsProvider } from "../features/transactions/TransactionsContext";
import "./layout.css";

const navItems = [
  { to: "/dashboard", label: "ホーム", icon: LayoutDashboard },
  { to: "/transactions", label: "通帳", icon: BookOpen },
  { to: "/add", label: "記録する", icon: PlusCircle },
  { to: "/settings", label: "設定", icon: Settings },
];

export default function AppLayout() {
  const { user, isGuest, signOut } = useAuth();

  return (
    <div className="shell">
      {/* PC：通帳の表紙のようなサイドバー */}
      <aside className="side">
        <div className="side__brand">家計簿</div>
        <div className="side__rule" />

        <nav className="side__nav" aria-label="メニュー">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className="side__link">
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="side__foot">
          <span>{isGuest ? "ゲストモード" : user?.email}</span>
          <button type="button" className="btn btn--small" onClick={signOut}>
            <LogOut size={16} aria-hidden="true" />
            {isGuest ? "ゲストモードを終了" : "ログアウト"}
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="main__inner">
          {isGuest && (
            <div className="guestNote" role="status">
              <span>ゲストモードで表示しています。サンプルデータのため、変更は保存されません。</span>
              <button type="button" className="btn btn--quiet btn--small" onClick={signOut}>
                ログイン画面へ
              </button>
            </div>
          )}

          <TransactionsProvider>
            <Outlet />
          </TransactionsProvider>
        </div>
      </main>

      {/* スマホ：下のタブ（768px以下のときだけ表示） */}
      <nav className="tabbar" aria-label="メニュー">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className="tabbar__link">
              <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
