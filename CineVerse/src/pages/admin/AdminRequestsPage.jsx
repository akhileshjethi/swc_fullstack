import { useState } from "react";
import { theatres } from "../../data/theatres";

const pending = theatres.filter(t => t.status === "pending");

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([
    ...pending,
    { id: 99, name: "CinePlex - Powai", city: "Mumbai", address: "Powai, Mumbai - 400076", screens: 4, rating: 0, facilities: ["Dolby Atmos", "Parking"], status: "pending", ownerId: 99 },
    { id: 98, name: "StarMovies - Whitefield", city: "Bengaluru", address: "Whitefield, Bengaluru - 560066", screens: 5, rating: 0, facilities: ["IMAX", "4DX", "VIP Lounge"], status: "pending", ownerId: 98 },
  ]);

  const handleAction = (id, action) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1>Theatre <span style={{ color: "var(--accent-primary)" }}>Requests</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>
          {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} for approval
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: "3rem" }}>✅</div><p>No pending requests</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {requests.map(req => (
            <div key={req.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: "1rem" }}>{req.name}</h3>
                    <span className={`badge badge-${req.status === "pending" ? "gold" : req.status === "approved" ? "success" : "danger"}`}>{req.status}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 10 }}>📍 {req.address}</p>
                  <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>🖥️ {req.screens} screens</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>👤 Owner #{req.ownerId}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {req.facilities.map(f => <span key={f} className="badge badge-secondary">{f}</span>)}
                  </div>
                </div>

                {req.status === "pending" && (
                  <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                    <button
                      id={`approve-${req.id}`}
                      className="btn btn-sm"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                      onClick={() => handleAction(req.id, "approved")}
                    >
                      ✓ Approve
                    </button>
                    <button
                      id={`reject-${req.id}`}
                      className="btn btn-sm"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
                      onClick={() => handleAction(req.id, "rejected")}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {req.status !== "pending" && (
                  <span className={`badge badge-${req.status === "approved" ? "success" : "danger"}`} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                    {req.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
