import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import "./BookingSummary.css";

export default function BookingSummaryPage() {
  const { booking, generateBookingId } = useBooking();
  const navigate = useNavigate();

  if (!booking.selectedSeats?.length) { navigate("/customer/seats"); return null; }

  const { movie, theatre, screen, show, selectedSeats, totalAmount } = booking;

  const handleConfirm = () => {
    navigate("/customer/confirmation");
  };

  const typeLabel = { regular: "Regular", premium: "Premium", vip: "VIP" };
  const typeColor = { regular: "#60a5fa", premium: "var(--accent-gold)", vip: "#a78bfa" };

  return (
    <div className="summary-page fade-in">
      <h1 style={{ marginBottom: 24 }}>Booking <span style={{ color: "var(--accent-primary)" }}>Summary</span></h1>

      <div className="summary-layout">
        {/* Left: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Movie Info */}
          <div className="summary-card">
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <img src={movie.poster} alt={movie.title} style={{ width: 80, borderRadius: "var(--radius-md)", objectFit: "cover", aspectRatio: "2/3" }} onError={e => e.target.style.display = "none"} />
              <div>
                <h3 style={{ marginBottom: 6 }}>{movie.title}</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {movie.genre.map(g => <span key={g} className="badge badge-primary">{g}</span>)}
                </div>
                <p style={{ marginTop: 8, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  ⏱ {movie.duration} min · {movie.language}
                </p>
              </div>
            </div>
          </div>

          {/* Venue Info */}
          <div className="summary-card">
            <h4 className="summary-section-label">Venue Details</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div className="summary-row"><span>🎭 Theatre</span><strong>{theatre.name}</strong></div>
              <div className="summary-row"><span>🖥️ Screen</span><strong>{screen.name}</strong></div>
              <div className="summary-row"><span>📅 Date</span><strong>{show.date}</strong></div>
              <div className="summary-row"><span>🕐 Time</span><strong>{show.time}</strong></div>
            </div>
          </div>

          {/* Seats */}
          <div className="summary-card">
            <h4 className="summary-section-label">Selected Seats ({selectedSeats.length})</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {selectedSeats.map(seat => (
                <div key={seat.id} style={{ background: "var(--bg-elevated)", border: `1.5px solid ${typeColor[seat.type]}`, borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: typeColor[seat.type] }}>{seat.id}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{typeLabel[seat.type]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Price Breakdown */}
        <div className="price-breakdown-card">
          <h4 className="summary-section-label" style={{ marginBottom: 16 }}>Price Breakdown</h4>
          {selectedSeats.map(seat => (
            <div key={seat.id} className="price-row">
              <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                {seat.id} <span style={{ color: typeColor[seat.type] }}>({typeLabel[seat.type]})</span>
              </span>
              <span style={{ fontWeight: 600 }}>₹{show.price[seat.type]}</span>
            </div>
          ))}

          <div className="divider" />

          <div className="price-row" style={{ marginBottom: 8 }}>
            <span className="text-muted">Convenience Fee</span>
            <span style={{ fontWeight: 600 }}>₹{selectedSeats.length * 30}</span>
          </div>
          <div className="price-row">
            <span className="text-muted">GST (18%)</span>
            <span style={{ fontWeight: 600 }}>₹{Math.round(totalAmount * 0.18)}</span>
          </div>

          <div className="divider" />

          <div className="price-row total-row">
            <span>Total Amount</span>
            <span className="total-amount">₹{totalAmount + selectedSeats.length * 30 + Math.round(totalAmount * 0.18)}</span>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 20 }} id="confirm-booking" onClick={handleConfirm}>
            🎟️ Confirm & Pay
          </button>

          <p className="text-muted text-xs" style={{ textAlign: "center", marginTop: 12 }}>
            Secure payment · No cancellation charges within 2 hrs
          </p>
        </div>
      </div>
    </div>
  );
}
