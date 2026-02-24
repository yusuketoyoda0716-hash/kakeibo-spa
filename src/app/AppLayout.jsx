import { NavLink, Outlet } from "react-router-dom";
import { Home, List, PlusCircle, Settings } from "lucide-react";
import "./layout.css";

const navItems = [
  { to: "/dashboard", label: "ホーム", icon: Home },
  { to: "/transactions", label: "取引", icon: List },
  { to: "/add", label: "追加", icon: PlusCircle },
  { to: "/settings", label: "設定", icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="layout">
      {/* PC: 左サイド */}
      <aside className="sidebar">
        <div className="brand">家計簿</div>

        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  "navItem" + (isActive ? " active" : "")
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* 右メイン */}
      <main className="main">
        <Outlet />
      </main>

      {/* スマホ: 下タブ */}
      <nav className="bottomNav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "bottomItem" + (isActive ? " active" : "")
              }
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
