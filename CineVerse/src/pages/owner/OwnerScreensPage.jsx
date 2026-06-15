import { useState } from "react";
import { getScreensByTheatre } from "../../data/screens";

export default function OwnerScreensPage() {
  const [screenList, setScreenList] = useState(getScreensByTheatre(1));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Standard", rows: "", cols: "" });

  const types = ["Standard", "Dolby Atmos", "IMAX", "4DX", "VIP", "Premium", "Recliner", "4K"];

  const handleSubmit = (e) => {
    e.preventDefault();
    const ns = { id: Date.now(), theatreId: 1, ...form, rows: Number(form.rows), cols: Number(form.cols), capacity: Number(form.rows) * Number(form.cols) };
    setScreenList(p => [...p, ns]);
    setShowForm(false);
    setForm({ name: "", type: "Standard", rows: "", cols: "" });
  };

  const handleDelete = (id) => setScreenList(p => p.filter(s => s.id !== id));

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>Screen <span style={{ color: "var(--accent-primary)" }}>Management</span></h1>
        <button className="btn btn-primary" id="add-screen-btn" onClick={() => setShowForm(true)}>+ Add Screen</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>Add New Screen</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Screen Name</label>
                <input type="text" className="input-field" placeholder="IMAX Screen 1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label className="input-label">Screen Type</label>
                <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Rows</label>
                  <input type="number" className="input-field" min={1} max={20} value={form.rows} onChange={e => setForm(p => ({ ...p, rows: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Columns</label>
                  <input type="number" className="input-field" min={1} max={40} value={form.cols} onChange={e => setForm(p => ({ ...p, cols: e.target.value }))} required />
                </div>
              </div>
              {form.rows && form.cols && (
                <p className="text-muted text-sm">Total capacity: <strong style={{ color: "var(--accent-primary)" }}>{Number(form.rows) * Number(form.cols)} seats</strong></p>
              )}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Screen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 16 }}>
        {screenList.map(screen => (
          <div key={screen.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ marginBottom: 6 }}>{screen.name}</h3>
                <span className="badge badge-info">{screen.type}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-primary)" }}>{screen.capacity}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>seats</div>
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 14 }}>
              📐 {screen.rows} rows × {screen.cols} columns
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm">✏️ Edit</button>
              <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => handleDelete(screen.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
