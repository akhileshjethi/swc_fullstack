import { useState } from "react";
import { theatres as initialTheatres } from "../../data/theatres";

export default function AdminTheatresPage() {
  const [theatreList, setTheatreList] = useState(initialTheatres);
  const [search, setSearch] = useState("");

  const filtered = theatreList.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = { approved: "success", pending: "gold", rejected: "danger" };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1>Manage <span style={{ color: "var(--accent-primary)" }}>Theatres</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>{filtered.length} theatres registered</p>
      </div>

      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input id="theatre-search" type="text" placeholder="Search theatres or cities..." className="input-field" style={{ paddingLeft: 40 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Theatre</th><th>City</th><th>Screens</th><th>Rating</th><th>Facilities</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(theatre => (
              <tr key={theatre.id}>
                <td>
                  <div>
                    <p style={{ fontWeight: 600 }}>{theatre.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{theatre.address}</p>
                  </div>
                </td>
                <td>{theatre.city}</td>
                <td style={{ textAlign: "center" }}>{theatre.screens}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "var(--accent-gold)" }}>⭐</span>
                    <span style={{ fontWeight: 600 }}>{theatre.rating}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {theatre.facilities.slice(0, 2).map(f => <span key={f} className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>{f}</span>)}
                    {theatre.facilities.length > 2 && <span className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>+{theatre.facilities.length - 2}</span>}
                  </div>
                </td>
                <td><span className={`badge badge-${statusColors[theatre.status] || "secondary"}`}>{theatre.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
