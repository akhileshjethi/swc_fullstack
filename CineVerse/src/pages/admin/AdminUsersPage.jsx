import { useState } from "react";
import { users as initialUsers } from "../../data/users";

export default function AdminUsersPage() {
  const [userList, setUserList] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filtered = userList.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id) => {
    setUserList(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u
    ));
  };

  const roleColors = { customer: "badge-info", owner: "badge-gold", admin: "badge-purple" };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1>Manage <span style={{ color: "var(--accent-primary)" }}>Users</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>{filtered.length} users found</p>
      </div>

      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input id="user-search" type="text" placeholder="Search users..." className="input-field" style={{ paddingLeft: 40 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>{user.avatar}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>{user.email}</td>
                <td><span className={`badge ${roleColors[user.role] || "badge-secondary"}`}>{user.role}</span></td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>{user.preferredLocation || "—"}</td>
                <td>
                  <span className={`badge badge-${user.status === "blocked" ? "danger" : "success"}`}>
                    {user.status === "blocked" ? "Blocked" : "Active"}
                  </span>
                </td>
                <td>
                  <button
                    id={`toggle-user-${user.id}`}
                    className="btn btn-sm"
                    style={{ background: user.status === "blocked" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: user.status === "blocked" ? "#4ade80" : "#f87171", border: `1px solid ${user.status === "blocked" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}
                    onClick={() => toggleBlock(user.id)}
                  >
                    {user.status === "blocked" ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
