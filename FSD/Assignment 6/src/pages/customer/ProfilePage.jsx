import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "+91 98765 43210",
    preferredLocation: user?.preferredLocation || "Mumbai",
  });

  const handleSave = () => {
    setEditing(false);
    // In a real app, would update context/backend
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>My <span style={{ color: "var(--accent-primary)" }}>Profile</span></h1>
          <p className="text-muted" style={{ marginTop: 6 }}>Manage your personal information</p>
        </div>
        <button className="btn btn-primary" id="edit-profile-btn" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? "💾 Save Changes" : "✏️ Edit Profile"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        {/* Avatar card */}
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", fontWeight: 800, margin: "0 auto 16px", boxShadow: "var(--shadow-accent)" }}>
            {user?.avatar}
          </div>
          <h3 style={{ marginBottom: 4 }}>{user?.name}</h3>
          <span className="badge badge-primary" style={{ textTransform: "capitalize" }}>{user?.role}</span>
          <p style={{ marginTop: 12, fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Member since {new Date(user?.joinDate || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Info */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Personal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { label: "Full Name", key: "name", icon: "👤" },
              { label: "Email Address", key: "email", icon: "📧" },
              { label: "Mobile Number", key: "mobile", icon: "📱" },
              { label: "Preferred Location", key: "preferredLocation", icon: "📍" },
            ].map(f => (
              <div key={f.key} className="input-group">
                <label className="input-label">{f.icon} {f.label}</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                ) : (
                  <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-color)", fontSize: "0.95rem" }}>
                    {form[f.key] || "—"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
