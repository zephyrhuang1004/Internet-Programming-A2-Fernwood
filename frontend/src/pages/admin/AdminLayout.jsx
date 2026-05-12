import { NavLink, Route, Routes } from "react-router-dom";
import { I } from "../../components/Icons";

import DashboardTab from "./DashboardTab";
import ProductsTab from "./ProductsTab";
import UsersTab from "./UsersTab";
import OrdersTab from "./OrdersTab";
import ActivityTab from "./ActivityTab";
import AnalyticsTab from "./AnalyticsTab";

const TABS = [
  { to: ".",          end: true,  label: "Dashboard",      icon: <I.grid /> },
  { to: "analytics",  end: false, label: "Analytics",      icon: <I.chart /> },
  { to: "products",   end: false, label: "Products",       icon: <I.box /> },
  { to: "users",      end: false, label: "Users & carts",  icon: <I.people /> },
  { to: "orders",     end: false, label: "Orders",         icon: <I.bag /> },
  { to: "activity",   end: false, label: "Activity log",   icon: <I.activity /> },
];

export default function AdminLayout() {
  return (
    <div className="page">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="mono muted" style={{ marginBottom: 12 }}>ADMIN CONSOLE</div>
          <div className="stack" style={{ gap: 2 }}>
            {TABS.map((t) => (
              <NavLink
                key={t.label}
                to={t.to}
                end={t.end}
                className={({ isActive }) => `admin-tab ${isActive ? "on" : ""}`}
              >
                {t.icon}<span>{t.label}</span>
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="admin-main">
          <Routes>
            <Route index element={<DashboardTab />} />
            <Route path="analytics" element={<AnalyticsTab />} />
            <Route path="products" element={<ProductsTab />} />
            <Route path="users" element={<UsersTab />} />
            <Route path="orders" element={<OrdersTab />} />
            <Route path="activity" element={<ActivityTab />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
