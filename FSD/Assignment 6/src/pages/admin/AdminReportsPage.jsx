import { movies } from "../../data/movies";
import { getAllBookings } from "../../data/bookings";
import { theatres } from "../../data/theatres";
import { users } from "../../data/users";

const AnalyticsCard = ({ title, value, change, icon, color }) => (
  <div className="card">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <span style={{ fontSize: "1.4rem" }}>{icon}</span>
      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: change > 0 ? "#4ade80" : "#f87171" }}>
        {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
      </span>
    </div>
    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: color || "var(--text-primary)", marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{title}</div>
  </div>
);

// Simple bar chart component
const BarChart = ({ data, color = "var(--accent-primary)" }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: `${(d.value / max) * 100}%`, background: color, borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 1s ease", opacity: 0.7 + (i / data.length) * 0.3 }} />
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminReportsPage() {
  const allBookings = getAllBookings();
  const revenue = allBookings.reduce((s, b) => s + b.totalAmount, 0);

  const monthlyData = [
    { label: "Jan", value: 45000 }, { label: "Feb", value: 62000 }, { label: "Mar", value: 51000 },
    { label: "Apr", value: 78000 }, { label: "May", value: 95000 }, { label: "Jun", value: 112000 },
  ];

  const topMovies = movies.sort((a, b) => b.rating - a.rating).slice(0, 5);
  const topTheatres = theatres.filter(t => t.status === "approved").sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1>System <span style={{ color: "var(--accent-primary)" }}>Reports</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>Analytics and platform statistics</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <AnalyticsCard icon="💰" title="Total Revenue" value={`₹${(revenue / 1000).toFixed(1)}K`} change={18} color="var(--accent-primary)" />
        <AnalyticsCard icon="🎟️" title="Total Bookings" value={allBookings.length} change={12} color="#4a9eff" />
        <AnalyticsCard icon="👥" title="Active Users" value={users.filter(u => u.status !== "blocked").length} change={8} color="#8b5cf6" />
        <AnalyticsCard icon="🎭" title="Active Theatres" value={theatres.filter(t => t.status === "approved").length} change={5} color="var(--accent-gold)" />
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Monthly Revenue</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Last 6 months performance</p>
          <BarChart data={monthlyData} color="var(--accent-primary)" />
        </div>

        {/* Top Rated Movies */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Rated Movies</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topMovies.map((movie, i) => (
              <div key={movie.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-muted)", width: 20, textAlign: "center" }}>#{i + 1}</span>
                <img src={movie.poster} alt={movie.title} style={{ width: 36, height: 50, objectFit: "cover", borderRadius: 6 }} onError={e => e.target.style.display = "none"} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>{movie.title}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{movie.genre[0]}</p>
                </div>
                <span style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.9rem" }}>⭐ {movie.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Theatres */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Top Performing Theatres</h3>
        <div className="grid-3" style={{ gap: 16 }}>
          {topTheatres.map((theatre, i) => (
            <div key={theatre.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: ["var(--accent-gold)", "#c0c0c0", "#cd7f32"][i] }}>#{i + 1}</span>
                <span style={{ color: "var(--accent-gold)", fontWeight: 700, fontSize: "0.9rem" }}>⭐ {theatre.rating}</span>
              </div>
              <p style={{ fontWeight: 600, marginBottom: 4, fontSize: "0.9rem" }}>{theatre.name}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{theatre.city} · {theatre.screens} screens</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
