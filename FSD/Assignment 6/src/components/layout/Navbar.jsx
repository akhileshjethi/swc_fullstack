import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./Navbar.css";

const CineVerseLogo = () => (
  <Link to="/" className="navbar-logo">
    <div className="logo-icon">▶</div>
    <span className="logo-text">Cine<span>Verse</span></span>
  </Link>
);

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "customer") return "/customer/dashboard";
    if (user.role === "owner") return "/owner/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/login";
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <CineVerseLogo />

        {/* Desktop nav links */}
        {isAuthenticated && user?.role === "customer" && (
          <div className="navbar-links">
            <Link to="/customer/dashboard" className={`nav-link ${isActive("/customer/dashboard") ? "active" : ""}`}>Home</Link>
            <Link to="/customer/movies" className={`nav-link ${isActive("/customer/movies") ? "active" : ""}`}>Movies</Link>
            <Link to="/customer/history" className={`nav-link ${isActive("/customer/history") ? "active" : ""}`}>My Bookings</Link>
          </div>
        )}

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <div className="nav-avatar-wrapper">
                <div className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                  {user?.avatar}
                </div>
                {menuOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <p className="nav-dropdown-name">{user?.name}</p>
                      <p className="nav-dropdown-role">{user?.role}</p>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <Link to={getDashboardLink()} className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                      <span>🏠</span> Dashboard
                    </Link>
                    {user?.role === "customer" && (
                      <>
                        <Link to="/customer/profile" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                          <span>👤</span> Profile
                        </Link>
                        <Link to="/customer/settings" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                          <span>⚙️</span> Settings
                        </Link>
                      </>
                    )}
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item danger" onClick={handleLogout}>
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
