import { users } from "../../data/users";
import { theatres } from "../../data/theatres";
import { getAllBookings } from "../../data/bookings";
import { movies } from "../../data/movies";

const StatCard = ({ icon, label, value, color = "var(--accent-primary)", sub }) => (
  <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{icon}</div>
    <div>
      <div style={{ fontSize: "2.2rem", fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.78rem", color: "#4ade80", marginTop: 4 }}>↑ {sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const allBookings = getAllBookings();
  const totalRevenue = allBookings.reduce((s, b) => s + b.totalAmount, 0);

  const genreCount = movies.reduce((acc, m) => {
    m.genre.forEach(g => { acc[g] = (acc[g] || 0) + 1; });
    return acc;
  }, {});
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1>Admin <span style={{ color: "var(--accent-primary)" }}>Dashboard</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>Platform overview and analytics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Users" value={users.length} color="#4a9eff" sub="2 new this week" />
        <StatCard icon="🎭" label="Total Theatres" value={theatres.length} color="#8b5cf6" sub="1 pending" />
        <StatCard icon="🎟️" label="Total Bookings" value={allBookings.length} color="var(--accent-gold)" sub="20% up" />
        <StatCard icon="💰" label="Platform Revenue" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} color="#4ade80" sub="38% up" />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Genre Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Genres</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topGenres.map(([genre, count]) => (
              <div key={genre}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.88rem" }}>
                  <span>{genre}</span><span style={{ color: "var(--text-muted)" }}>{count} movies</span>
                </div>
                <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(count / movies.length) * 100}%`, height: "100%", background: "var(--gradient-primary)", borderRadius: 4, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Recent Bookings</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allBookings.slice(0, 5).map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{b.movieTitle}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{b.id} · {b.showDate}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, color: "var(--accent-primary)" }}>₹{b.totalAmount}</p>
                  <span className={`badge badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "info"}`} style={{ fontSize: "0.68rem" }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
