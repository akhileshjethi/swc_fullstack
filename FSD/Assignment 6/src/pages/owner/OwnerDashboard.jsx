import { useAuth } from "../../context/AuthContext";
import { getBookingsByUser, getAllBookings } from "../../data/bookings";
import { movies } from "../../data/movies";
import { shows } from "../../data/shows";

const StatCard = ({ icon, label, value, color = "var(--accent-primary)", trend }) => (
  <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{icon}</div>
      {trend && <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#4ade80" }}>↑ {trend}</span>}
    </div>
    <div>
      <div style={{ fontSize: "2rem", fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

export default function OwnerDashboard() {
  const { user } = useAuth();
  const allBookings = getAllBookings();
  const ownerBookings = allBookings.filter(b => b.theatreId === 1);
  const revenue = ownerBookings.reduce((s, b) => s + b.totalAmount, 0);
  const activeShows = shows.filter(s => s.theatreId === 1).length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1>Theatre <span style={{ color: "var(--accent-primary)" }}>Dashboard</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>Welcome back, {user?.name}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="🎬" label="Total Movies" value={movies.length} color="#4a9eff" trend="2 this week" />
        <StatCard icon="🎟️" label="Total Bookings" value={ownerBookings.length} color="#8b5cf6" trend="12% up" />
        <StatCard icon="🕐" label="Active Shows" value={activeShows} color="var(--accent-gold)" />
        <StatCard icon="💰" label="Revenue (₹)" value={`${(revenue / 1000).toFixed(1)}K`} color="#4ade80" trend="18% up" />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Bookings</h3>
        {ownerBookings.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 0" }}>
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Movie</th>
                  <th>Seats</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ownerBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.id}</td>
                    <td>{b.movieTitle}</td>
                    <td>{b.seats.join(", ")}</td>
                    <td>{b.showDate}</td>
                    <td style={{ color: "var(--accent-primary)", fontWeight: 700 }}>₹{b.totalAmount}</td>
                    <td><span className={`badge badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "info"}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
