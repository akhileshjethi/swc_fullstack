import { getAllBookings } from "../../data/bookings";

export default function OwnerBookingsPage() {
  const bookings = getAllBookings().filter(b => b.theatreId === 1);
  const revenue = bookings.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1>View <span style={{ color: "var(--accent-primary)" }}>Bookings</span></h1>
        <p className="text-muted" style={{ marginTop: 6 }}>Total Revenue: <strong style={{ color: "#4ade80" }}>₹{revenue.toLocaleString()}</strong></p>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Booking ID</th><th>Movie</th><th>Customer</th><th>Show Date</th><th>Show Time</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.id}</td>
                <td>{b.movieTitle}</td>
                <td>User #{b.userId}</td>
                <td>{b.showDate}</td>
                <td>{b.showTime}</td>
                <td>{b.seats.join(", ")}</td>
                <td style={{ color: "var(--accent-primary)", fontWeight: 700 }}>₹{b.totalAmount}</td>
                <td><span className={`badge badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "info"}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
