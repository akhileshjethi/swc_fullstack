// Layout for dashboard pages with sidebar + main content area
import Sidebar from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="with-sidebar">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
