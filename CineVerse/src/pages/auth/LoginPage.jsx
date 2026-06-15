import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setGlobalError("");
    await new Promise(r => setTimeout(r, 800));
    const result = login(form.email, form.password);
    if (result.success) {
      const map = { customer: "/customer/dashboard", owner: "/owner/dashboard", admin: "/admin/dashboard" };
      navigate(map[result.user.role]);
    } else {
      setGlobalError(result.error);
    }
    setLoading(false);
  };

  const handleDemoLogin = (email, password) => {
    setForm({ email, password });
    setErrors({});
    setGlobalError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-overlay" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-container">
        <div className="auth-card slide-up">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">▶</div>
            <span>Cine<span>Verse</span></span>
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to book your next cinematic experience</p>

          {/* Demo accounts */}
          <div className="demo-accounts">
            <p className="demo-label">Quick Demo Login:</p>
            <div className="demo-btns">
              <button className="demo-btn" onClick={() => handleDemoLogin("customer@cineverse.com", "customer123")}>
                🎬 Customer
              </button>
              <button className="demo-btn" onClick={() => handleDemoLogin("owner@cineverse.com", "owner123")}>
                🎭 Owner
              </button>
              <button className="demo-btn" onClick={() => handleDemoLogin("admin@cineverse.com", "admin123")}>
                ⚡ Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {globalError && (
              <div className="auth-global-error">
                <span>⚠️</span> {globalError}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                id="login-password"
                type="password"
                className={`input-field ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: "" })); }}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading} id="login-submit">
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
