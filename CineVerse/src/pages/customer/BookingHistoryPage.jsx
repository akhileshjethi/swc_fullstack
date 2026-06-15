import { useAuth } from "../../context/AuthContext";
import { getBookingsByUser } from "../../data/bookings";
import { movies } from "../../data/movies";
import { Link } from "react-router-dom";

const statusColors = {
  confirmed: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.3)", label: "✓ Confirmed" },
  completed: { bg: "rgba(74,158,255,0.1)", color: "#60a5fa", border: "rgba(74,158,255,0.3)", label: "✓ Completed" },
  cancelled: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)", label: "✕ Cancelled" },
};

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const bookings = getBookingsByUser(user?.id || 1);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1>Booking <span style={{ color: "var(--accent-primary)" }}>History</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>{bookings.length} total bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "3rem" }}>🎟️</div>
          <p>No bookings yet</p>
          <Link to="/customer/movies" className="btn btn-primary">Browse Movies</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bookings.map(booking => {
            const status = statusColors[booking.status] || statusColors.completed;
            const movie = movies.find(m => m.id === booking.movieId);
            return (
              <div key={booking.id} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {movie && (
                  <img src={movie.poster} alt={booking.movieTitle} style={{ width: 70, aspectRatio: "2/3", objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>{booking.movieTitle}</h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
                        🎭 {booking.theatreName} · {booking.screenName}
                      </p>
                    </div>
                    <span style={{ padding: "4px 12px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700, background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>📅 {booking.showDate}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>🕐 {booking.showTime}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>💺 {booking.seats.join(", ")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Booking ID: <strong style={{ color: "var(--text-primary)" }}>{booking.id}</strong>
                    </span>
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--accent-primary)" }}>₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
