// Layout for customer booking flow - has navbar + content wrapper
import Navbar from "../components/layout/Navbar";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

const STEPS = [
  { path: "/customer/movies", label: "Movie" },
  { path: "/customer/location", label: "City" },
  { path: "/customer/theatre", label: "Theatre" },
  { path: "/customer/screen", label: "Screen" },
  { path: "/customer/showtime", label: "Show" },
  { path: "/customer/seats", label: "Seats" },
  { path: "/customer/summary", label: "Summary" },
  { path: "/customer/confirmation", label: "Confirm" },
];

export default function BookingLayout() {
  const location = useLocation();
  const { booking } = useBooking();
  const currentIdx = STEPS.findIndex(s => location.pathname.startsWith(s.path));

  const isBookingFlow = currentIdx >= 1; // show progress only from location onwards

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", paddingTop: "var(--navbar-height)" }}>
        {isBookingFlow && (
          <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", padding: "12px 48px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
              {STEPS.slice(1).map((step, idx) => {
                const realIdx = idx + 1;
                const isActive = currentIdx === realIdx;
                const isCompleted = currentIdx > realIdx;
                return (
                  <div key={step.path} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flex: "none", flexDirection: "column", alignItems: "center", gap: 4, cursor: isCompleted ? "pointer" : "default" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: isCompleted ? "var(--accent-primary)" : isActive ? "transparent" : "transparent",
                        border: `2px solid ${isCompleted ? "var(--accent-primary)" : isActive ? "var(--accent-primary)" : "var(--border-color)"}`,
                        color: isCompleted ? "white" : isActive ? "var(--accent-primary)" : "var(--text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: 700, transition: "all 0.2s",
                      }}>
                        {isCompleted ? "✓" : realIdx}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: isActive ? "var(--accent-primary)" : isCompleted ? "var(--text-secondary)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 2 && (
                      <div style={{ flex: 1, height: 2, background: isCompleted ? "var(--accent-primary)" : "var(--border-color)", margin: "0 4px", marginBottom: 18, transition: "background 0.3s" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 48px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
