// Reusable Footer component
export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border-color)",
      padding: "40px 24px 24px",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, background: "var(--gradient-primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>▶</div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>Cine<span style={{ color: "var(--accent-primary)" }}>Verse</span></span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Your premium movie ticket booking platform. Enjoy the best cinema experience.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: "0.95rem" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Movies", "Theatres", "Offers", "Gift Cards"].map(l => (
                <a key={l} href="#" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                  onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: "0.95rem" }}>Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map(l => (
                <a key={l} href="#" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                  onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: "0.95rem" }}>Follow Us</h4>
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "📘", "📷", "▶"].map((icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-primary)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}>{icon}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>© 2026 CineVerse. All rights reserved.</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Built with ❤️ for movie lovers</p>
        </div>
      </div>
    </footer>
  );
}
