import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cities } from "../../data/theatres";
import { useBooking } from "../../context/BookingContext";

export default function LocationPage() {
  const { booking, setCity } = useBooking();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city) => {
    setCity(city.name);
    navigate("/customer/theatre");
  };

  if (!booking.movie) {
    navigate("/customer/movies");
    return null;
  }

  return (
    <div className="fade-in">
      {/* Booking progress */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Select <span style={{ color: "var(--accent-primary)" }}>City</span></h1>
        <p className="text-muted">
          Booking for: <strong style={{ color: "var(--text-primary)" }}>{booking.movie.title}</strong>
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 28 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem" }}>🔍</span>
        <input
          id="city-search"
          type="text"
          placeholder="Search city..."
          className="input-field"
          style={{ paddingLeft: 40 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* City grid */}
      <div className="grid-3" style={{ gap: 14 }}>
        {filtered.map(city => (
          <button
            key={city.id}
            id={`city-${city.id}`}
            onClick={() => handleSelect(city)}
            style={{
              background: "var(--bg-card)", border: "1.5px solid var(--border-color)",
              borderRadius: "var(--radius-lg)", padding: "20px 24px",
              textAlign: "left", cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.background = "rgba(229,9,20,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.background = "var(--bg-card)"; }}
          >
            <span style={{ fontSize: "1.8rem" }}>🏙️</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>{city.name}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{city.state}</p>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "3rem" }}>🏙️</div>
          <p>No cities found</p>
        </div>
      )}
    </div>
  );
}
