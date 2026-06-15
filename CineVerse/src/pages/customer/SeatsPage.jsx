import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { SeatGrid, SeatLegend } from "../../components/booking/Seat";
import "./SeatsPage.css";

// Generate a mock seat map for the screen
function generateSeats(screen, occupancyPct) {
  const rows = "ABCDEFGHIJ".slice(0, screen.rows);
  const cols = screen.cols;
  const totalSeats = rows.length * cols;
  const occupiedCount = Math.floor((occupancyPct / 100) * totalSeats);

  const seats = [];
  let occupiedPlaced = 0;

  [...rows].forEach((row, rowIdx) => {
    for (let col = 1; col <= cols; col++) {
      const id = `${row}${col}`;
      // Determine seat type based on row position
      let type = "regular";
      if (rowIdx < 2) type = "vip";
      else if (rowIdx < 4) type = "premium";

      // Randomly occupy some seats
      const isOccupied = occupiedPlaced < occupiedCount && Math.random() < occupancyPct / 100;
      if (isOccupied) occupiedPlaced++;

      seats.push({ id, type, status: isOccupied ? "occupied" : "available", isSelected: false });
    }
  });

  return seats;
}

export default function SeatsPage() {
  const { booking, setSelectedSeats } = useBooking();
  const navigate = useNavigate();

  if (!booking.show) { navigate("/customer/showtime"); return null; }

  const [seats, setSeats] = useState(() =>
    generateSeats(booking.screen, booking.show.occupancy)
  );
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSeatSelect = (seat) => {
    setSeats(prev => prev.map(s =>
      s.id === seat.id ? { ...s, isSelected: !s.isSelected } : s
    ));
    setSelectedIds(prev =>
      prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : [...prev, seat.id]
    );
  };

  const selectedSeatData = useMemo(() =>
    seats.filter(s => s.isSelected).map(s => ({
      id: s.id, type: s.type
    })),
    [seats]
  );

  const totalAmount = useMemo(() =>
    selectedSeatData.reduce((sum, s) => sum + (booking.show.price[s.type] || 0), 0),
    [selectedSeatData, booking.show]
  );

  const handleProceed = () => {
    setSelectedSeats(selectedSeatData);
    navigate("/customer/summary");
  };

  return (
    <div className="seats-page fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1>Select <span style={{ color: "var(--accent-primary)" }}>Seats</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>
          {booking.movie.title} · {booking.theatre.name} · {booking.show.time}
        </p>
      </div>

      {/* Legend */}
      <SeatLegend />

      {/* Seat Map */}
      <div className="seat-map-card">
        <SeatGrid seats={seats} onSeatSelect={handleSeatSelect} />
      </div>

      {/* Summary bar */}
      <div className="seat-summary-bar">
        <div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Selected Seats</div>
          {selectedIds.length > 0 ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {selectedIds.map(id => {
                const seat = seats.find(s => s.id === id);
                const colorMap = { vip: "#a78bfa", premium: "var(--accent-gold)", regular: "#60a5fa" };
                return (
                  <span key={id} style={{
                    background: "var(--bg-elevated)", border: `1.5px solid ${colorMap[seat?.type]}`,
                    borderRadius: 6, padding: "2px 8px", fontSize: "0.78rem", fontWeight: 700,
                    color: colorMap[seat?.type],
                  }}>{id}</span>
                );
              })}
            </div>
          ) : (
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>No seats selected</p>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Total Amount</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-primary)" }}>₹{totalAmount}</div>
        </div>
        <button
          className="btn btn-primary btn-lg"
          id="proceed-to-summary"
          disabled={selectedIds.length === 0}
          onClick={handleProceed}
        >
          Proceed →
        </button>
      </div>
    </div>
  );
}
