import { useNavigate } from "react-router-dom";
import { getTheatresByCity } from "../../data/theatres";
import { useBooking } from "../../context/BookingContext";

export default function TheatrePage() {
  const { booking, setTheatre } = useBooking();
  const navigate = useNavigate();

  if (!booking.city) { navigate("/customer/location"); return null; }

  const theatres = getTheatresByCity(booking.city);

  const handleSelect = (theatre) => {
    setTheatre(theatre);
    navigate("/customer/screen");
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1>Select <span style={{ color: "var(--accent-primary)" }}>Theatre</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>
          {booking.movie.title} · {booking.city}
        </p>
      </div>

      {theatres.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "3rem" }}>🎭</div>
          <p>No theatres in {booking.city} yet</p>
          <button className="btn btn-primary" onClick={() => navigate("/customer/location")}>Change City</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {theatres.map(theatre => (
            <div
              key={theatre.id}
              id={`theatre-${theatre.id}`}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(theatre)}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <img
                  src={theatre.image}
                  alt={theatre.name}
                  style={{ width: 140, height: 90, objectFit: "cover", borderRadius: "var(--radius-md)", flexShrink: 0 }}
                  onError={e => e.target.style.display = "none"}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", marginBottom: 4 }}>{theatre.name}</h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 10 }}>📍 {theatre.address}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginBottom: 4 }}>
                        <span style={{ color: "var(--accent-gold)", fontSize: "0.85rem" }}>⭐</span>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{theatre.rating}</span>
                      </div>
                      <span className="text-muted text-sm">📏 {theatre.distance}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {theatre.facilities.map(f => (
                      <span key={f} className="badge badge-secondary">{f}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-muted text-sm">🖥️ {theatre.screens} Screens</span>
                    <button className="btn btn-primary btn-sm">Select →</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
