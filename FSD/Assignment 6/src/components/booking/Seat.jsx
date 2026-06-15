import "./Seat.css";

// Individual seat component
export function Seat({ seat, onSelect }) {
  const { id, type, status, isSelected } = seat;

  return (
    <button
      className={`seat seat-${type} seat-${status} ${isSelected ? "seat-selected" : ""}`}
      onClick={() => status === "available" && onSelect(seat)}
      disabled={status === "occupied"}
      title={`${id} - ${type} ${status}`}
      aria-label={`Seat ${id} ${type} ${status}`}
    >
      <span className="seat-id">{id.replace(/[A-Z]/i, "")}</span>
    </button>
  );
}

// Seat grid layout
export function SeatGrid({ seats, onSeatSelect }) {
  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const rowLetter = seat.id.charAt(0);
    if (!acc[rowLetter]) acc[rowLetter] = [];
    acc[rowLetter].push(seat);
    return acc;
  }, {});

  return (
    <div className="seat-grid-container">
      {/* Screen indicator */}
      <div className="screen-indicator">
        <div className="screen-curve">SCREEN</div>
        <div className="screen-glow" />
      </div>

      <div className="seat-grid">
        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="seat-row">
            <span className="row-label">{rowLabel}</span>
            <div className="seat-row-seats">
              {rowSeats.map((seat) => (
                <Seat key={seat.id} seat={seat} onSelect={onSeatSelect} />
              ))}
            </div>
            <span className="row-label">{rowLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Seat legend
export function SeatLegend() {
  const items = [
    { type: "available regular", label: "Regular" },
    { type: "available premium", label: "Premium" },
    { type: "available vip", label: "VIP" },
    { type: "selected regular", label: "Selected" },
    { type: "occupied regular", label: "Occupied" },
  ];

  return (
    <div className="seat-legend">
      {items.map((item) => (
        <div key={item.label} className="legend-item">
          <div className={`legend-seat seat ${item.type}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
