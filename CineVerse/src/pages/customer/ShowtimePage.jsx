import { useNavigate } from "react-router-dom";
import { getShowsByMovieAndTheatre } from "../../data/shows";
import { useBooking } from "../../context/BookingContext";

const occupancyColor = (pct) => {
  if (pct >= 90) return { color: "#f87171", label: "Almost Full" };
  if (pct >= 70) return { color: "var(--accent-gold)", label: "Filling Fast" };
  return { color: "#4ade80", label: "Available" };
};

export default function ShowtimePage() {
  const { booking, setShow } = useBooking();
  const navigate = useNavigate();

  if (!booking.screen) { navigate("/customer/screen"); return null; }

  const shows = getShowsByMovieAndTheatre(booking.movie.id, booking.theatre.id)
    .filter(s => s.screenId === booking.screen.id);

  // If no shows for specific screen, get all shows for movie+theatre
  const displayShows = shows.length > 0
    ? shows
    : getShowsByMovieAndTheatre(booking.movie.id, booking.theatre.id);

  const handleSelect = (show) => {
    setShow(show);
    navigate("/customer/seats");
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1>Select <span style={{ color: "var(--accent-primary)" }}>Showtime</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>
          {booking.movie.title} · {booking.theatre.name} · {booking.screen.name}
        </p>
      </div>

      {displayShows.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "3rem" }}>🕐</div>
          <p>No shows available for today</p>
          <button className="btn btn-primary" onClick={() => navigate("/customer/theatre")}>
            Try Another Theatre
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            📅 Today, {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {displayShows.map(show => {
              const occ = occupancyColor(show.occupancy);
              return (
                <button
                  key={show.id}
                  id={`show-${show.id}`}
                  onClick={() => handleSelect(show)}
                  style={{
                    background: "var(--bg-card)", border: "1.5px solid var(--border-color)",
                    borderRadius: "var(--radius-lg)", padding: "18px 24px",
                    textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                    minWidth: 180,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.background = "rgba(229,9,20,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "var(--bg-card)"; }}
                >
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>{show.time}</div>
                  <div style={{ fontSize: "0.78rem", color: occ.color, fontWeight: 600, marginBottom: 8 }}>
                    ● {occ.label} ({show.occupancy}%)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Regular: ₹{show.price.regular}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)" }}>Premium: ₹{show.price.premium}</span>
                    <span style={{ fontSize: "0.75rem", color: "#a78bfa" }}>VIP: ₹{show.price.vip}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
