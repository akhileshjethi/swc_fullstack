import { useState } from "react";
import { getScreensByTheatre } from "../../data/screens";

export default function SeatLayoutPage() {
  const screens = getScreensByTheatre(1);
  const [selectedScreen, setSelectedScreen] = useState(screens[0]);
  const [rows, setRows] = useState(selectedScreen?.rows || 8);
  const [cols, setCols] = useState(selectedScreen?.cols || 15);
  const [vipRows, setVipRows] = useState(2);
  const [premiumRows, setPremiumRows] = useState(2);

  const rowLabels = "ABCDEFGHIJKLMNOPQRST".slice(0, rows);

  const getSeatType = (rowIdx) => {
    if (rowIdx < vipRows) return "vip";
    if (rowIdx < vipRows + premiumRows) return "premium";
    return "regular";
  };

  const typeColors = { vip: "#a78bfa", premium: "var(--accent-gold)", regular: "#60a5fa" };

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: 24 }}>Seat Layout <span style={{ color: "var(--accent-primary)" }}>Configuration</span></h1>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
        {/* Config panel */}
        <div className="card" style={{ position: "sticky", top: 88 }}>
          <h3 style={{ marginBottom: 16 }}>Configuration</h3>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Select Screen</label>
            <select className="input-field" value={selectedScreen?.id} onChange={e => {
              const s = screens.find(sc => sc.id === Number(e.target.value));
              setSelectedScreen(s); setRows(s.rows); setCols(s.cols);
            }}>
              {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="input-group">
              <label className="input-label">Rows</label>
              <input type="number" className="input-field" min={1} max={20} value={rows} onChange={e => setRows(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label className="input-label">Columns</label>
              <input type="number" className="input-field" min={1} max={40} value={cols} onChange={e => setCols(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="input-label" style={{ marginBottom: 8, display: "block" }}>VIP Rows (from front): {vipRows}</label>
            <input type="range" min={0} max={Math.min(4, rows)} value={vipRows} onChange={e => setVipRows(Number(e.target.value))} style={{ width: "100%", accentColor: "#a78bfa" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="input-label" style={{ marginBottom: 8, display: "block" }}>Premium Rows: {premiumRows}</label>
            <input type="range" min={0} max={Math.min(6, rows - vipRows)} value={premiumRows} onChange={e => setPremiumRows(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent-gold)" }} />
          </div>

          <div style={{ padding: 14, background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", marginBottom: 16, fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#a78bfa" }}>VIP seats</span><span>{vipRows * cols}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "var(--accent-gold)" }}>Premium seats</span><span>{premiumRows * cols}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#60a5fa" }}>Regular seats</span><span>{(rows - vipRows - premiumRows) * cols}</span>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }} id="save-layout-btn">💾 Save Layout</button>
        </div>

        {/* Preview */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Layout Preview</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 20 }}>Total: {rows * cols} seats</p>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(180deg, rgba(229,9,20,0.3), rgba(229,9,20,0.05))", borderTop: "3px solid rgba(229,9,20,0.7)", borderRadius: "50% 50% 0 0 / 20px", padding: "8px 60px 4px", fontSize: "0.7rem", letterSpacing: 4, color: "rgba(229,9,20,0.8)", fontWeight: 700, display: "inline-block" }}>
              SCREEN
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
            {[...rowLabels].map((row, rowIdx) => {
              const type = getSeatType(rowIdx);
              return (
                <div key={row} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>{row}</span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: cols }).map((_, ci) => (
                      <div key={ci} style={{ width: 18, height: 16, borderRadius: "3px 3px 2px 2px", background: `${typeColors[type]}20`, border: `1px solid ${typeColors[type]}50` }} />
                    ))}
                  </div>
                  <span style={{ width: 20, fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>{row}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 20, justifyContent: "center" }}>
            {[{ type: "vip", label: "VIP" }, { type: "premium", label: "Premium" }, { type: "regular", label: "Regular" }].map(({ type, label }) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}>
                <div style={{ width: 16, height: 14, borderRadius: "3px 3px 2px 2px", background: `${typeColors[type]}20`, border: `1px solid ${typeColors[type]}50` }} />
                <span style={{ color: typeColors[type] }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
