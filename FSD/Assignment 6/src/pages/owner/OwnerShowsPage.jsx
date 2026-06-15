import { useState } from "react";
import { shows as initialShows } from "../../data/shows";
import { movies } from "../../data/movies";
import { screens } from "../../data/screens";

export default function OwnerShowsPage() {
  const [shows, setShows] = useState(initialShows.filter(s => s.theatreId === 1));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ movieId: "", screenId: "", date: "", time: "", priceRegular: "", pricePremium: "", priceVip: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newShow = {
      id: Date.now(), theatreId: 1,
      movieId: Number(form.movieId), screenId: Number(form.screenId),
      date: form.date, time: form.time,
      price: { regular: Number(form.priceRegular), premium: Number(form.pricePremium), vip: Number(form.priceVip) },
      occupancy: 0,
    };
    setShows(prev => [...prev, newShow]);
    setShowForm(false);
    setForm({ movieId: "", screenId: "", date: "", time: "", priceRegular: "", pricePremium: "", priceVip: "" });
  };

  const handleDelete = (id) => setShows(prev => prev.filter(s => s.id !== id));

  const getMovieTitle = (id) => movies.find(m => m.id === id)?.title || "Unknown";
  const getScreenName = (id) => screens.find(s => s.id === id)?.name || "Unknown";

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>Manage <span style={{ color: "var(--accent-primary)" }}>Shows</span></h1>
        <button className="btn btn-primary" id="add-show-btn" onClick={() => setShowForm(true)}>+ Add Show</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>Add New Show</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Movie</label>
                <select className="input-field" value={form.movieId} onChange={e => setForm(p => ({ ...p, movieId: e.target.value }))} required>
                  <option value="">Select Movie</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Screen</label>
                <select className="input-field" value={form.screenId} onChange={e => setForm(p => ({ ...p, screenId: e.target.value }))} required>
                  <option value="">Select Screen</option>
                  {screens.filter(s => s.theatreId === 1).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Time</label>
                  <input type="text" className="input-field" placeholder="10:00 AM" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["priceRegular", "Regular ₹"], ["pricePremium", "Premium ₹"], ["priceVip", "VIP ₹"]].map(([k, l]) => (
                  <div key={k} className="input-group">
                    <label className="input-label">{l}</label>
                    <input type="number" className="input-field" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} required />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Show</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Movie</th><th>Screen</th><th>Date</th><th>Time</th><th>Occupancy</th><th>Prices</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {shows.map(show => (
              <tr key={show.id}>
                <td style={{ fontWeight: 600 }}>{getMovieTitle(show.movieId)}</td>
                <td>{getScreenName(show.screenId)}</td>
                <td>{show.date}</td>
                <td>{show.time}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                      <div style={{ width: `${show.occupancy}%`, height: "100%", background: show.occupancy > 80 ? "#f87171" : show.occupancy > 60 ? "var(--accent-gold)" : "#4ade80", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: "0.78rem" }}>{show.occupancy}%</span>
                  </div>
                </td>
                <td style={{ fontSize: "0.78rem" }}>₹{show.price.regular}/₹{show.price.premium}/₹{show.price.vip}</td>
                <td>
                  <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => handleDelete(show.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
