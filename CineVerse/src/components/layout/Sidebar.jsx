import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const customerNav = [
  { icon: "🏠", label: "Dashboard", path: "/customer/dashboard" },
  { icon: "🎬", label: "Movies", path: "/customer/movies" },
  { icon: "🎟️", label: "My Bookings", path: "/customer/history" },
  { icon: "👤", label: "Profile", path: "/customer/profile" },
  { icon: "⚙️", label: "Settings", path: "/customer/settings" },
];

const ownerNav = [
  { icon: "📊", label: "Dashboard", path: "/owner/dashboard" },
  { icon: "🎬", label: "Manage Movies", path: "/owner/movies" },
  { icon: "🕐", label: "Manage Shows", path: "/owner/shows" },
  { icon: "📋", label: "View Bookings", path: "/owner/bookings" },
  { icon: "🖥️", label: "Screens", path: "/owner/screens" },
  { icon: "💺", label: "Seat Layout", path: "/owner/layout" },
];

const adminNav = [
  { icon: "📊", label: "Dashboard", path: "/admin/dashboard" },
  { icon: "👥", label: "Users", path: "/admin/users" },
  { icon: "🎭", label: "Theatres", path: "/admin/theatres" },
  { icon: "✅", label: "Requests", path: "/admin/requests" },
  { icon: "📈", label: "Reports", path: "/admin/reports" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === "owner" ? ownerNav :
    user?.role === "admin" ? adminNav :
    customerNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">▶</div>
        <span className="logo-text">Cine<span>Verse</span></span>
      </div>

      <div className="sidebar-role">
        <div className="sidebar-avatar">{user?.avatar}</div>
        <div>
          <p className="sidebar-name">{user?.name}</p>
          <p className="sidebar-role-badge">{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
