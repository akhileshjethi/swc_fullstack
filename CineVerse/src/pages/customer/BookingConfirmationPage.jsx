import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import "./BookingConfirmation.css";

export default function BookingConfirmationPage() {
  const { booking, generateBookingId, resetBooking } = useBooking();
  const bookingId = useMemo(() => generateBookingId(), []);

  if (!booking.selectedSeats?.length) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <p>No booking in progress</p>
        <Link to="/customer/movies" className="btn btn-primary">Browse Movies</Link>
      </div>
    );
  }

  const { movie, theatre, screen, show, selectedSeats, totalAmount } = booking;
  const grand = totalAmount + selectedSeats.length * 30 + Math.round(totalAmount * 0.18);

  return (
    <div className="confirmation-page fade-in">
      {/* Success Animation */}
      <div className="confirmation-success">
        <div className="success-ring">
          <div className="success-checkmark">✓</div>
        </div>
        <h1>Booking <span>Confirmed!</span></h1>
        <p className="text-muted">Your tickets have been booked successfully</p>
      </div>

      {/* Ticket Card */}
      <div className="ticket-card">
        <div className="ticket-header">
          <div className="ticket-logo">
            <div style={{ background: "var(--gradient-primary)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>▶</div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Cine<span style={{ color: "var(--accent-primary)" }}>Verse</span></span>
          </div>
          <div className="ticket-id">
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Booking ID</span>
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>{bookingId}</span>
          </div>
        </div>

        <div className="ticket-divider">
          <div className="ticket-hole left" />
          <div className="ticket-dashes" />
          <div className="ticket-hole right" />
        </div>

        <div className="ticket-body">
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <img src={movie.poster} alt={movie.title} style={{ width: 80, borderRadius: "var(--radius-md)", objectFit: "cover", aspectRatio: "2/3" }} onError={e => e.target.style.display = "none"} />
            <div>
              <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>{movie.title}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{movie.genre.join(", ")} · {movie.duration} min</p>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-detail"><span>🎭 Theatre</span><strong>{theatre.name}</strong></div>
            <div className="ticket-detail"><span>🖥️ Screen</span><strong>{screen.name}</strong></div>
            <div className="ticket-detail"><span>📅 Date</span><strong>{show.date}</strong></div>
            <div className="ticket-detail"><span>🕐 Show</span><strong>{show.time}</strong></div>
          </div>

          <div className="ticket-seats">
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Seats</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {selectedSeats.map(s => (
                <span key={s.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: "0.85rem" }}>{s.id}</span>
              ))}
            </div>
          </div>

          <div className="ticket-divider">
            <div className="ticket-hole left" />
            <div className="ticket-dashes" />
            <div className="ticket-hole right" />
          </div>

          {/* QR Placeholder */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div className="qr-placeholder">
              <div className="qr-inner">QR</div>
              <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>Scan at venue</p>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>Total Paid</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--accent-primary)" }}>₹{grand}</div>
              <div style={{ fontSize: "0.78rem", color: "#4ade80", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <span>✓</span> Payment Successful
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
        <Link to="/customer/history" className="btn btn-secondary btn-lg" id="view-booking-history" onClick={resetBooking}>
          📋 View All Bookings
        </Link>
        <Link to="/customer/movies" className="btn btn-primary btn-lg" id="book-more-movies" onClick={resetBooking}>
          🎬 Book More Movies
        </Link>
      </div>
    </div>
  );
}
