import { useNavigate } from "react-router-dom";
import { getScreensByTheatre } from "../../data/screens";
import { useBooking } from "../../context/BookingContext";

const typeColors = {
  IMAX: "#4a9eff", "Dolby Atmos": "#8b5cf6", "4DX": "#f59e0b",
  VIP: "#ec4899", Premium: "#f5a623", Recliner: "#10b981",
  "4K": "#06b6d4", Standard: "#6b7280",
};

export default function ScreenPage() {
  const { booking, setScreen } = useBooking();
  const navigate = useNavigate();

  if (!booking.theatre) { navigate("/customer/theatre"); return null; }

  const screens = getScreensByTheatre(booking.theatre.id);

  const handleSelect = (screen) => {
    setScreen(screen);
    navigate("/customer/showtime");
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1>Select <span style={{ color: "var(--accent-primary)" }}>Screen</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>
          {booking.movie.title} · {booking.theatre.name}
        </p>
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        {screens.map(screen => {
          const color = typeColors[screen.type] || "#6b7280";
          return (
            <div
              key={screen.id}
              id={`screen-${screen.id}`}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(screen)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>{screen.name}</h3>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: "999px",
                    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
                    background: `${color}20`, color, border: `1px solid ${color}40`,
                  }}>{screen.type}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-primary)" }}>
                    {screen.capacity}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>seats</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  📐 {screen.rows} rows × {screen.cols} cols
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-primary btn-sm">Select →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
