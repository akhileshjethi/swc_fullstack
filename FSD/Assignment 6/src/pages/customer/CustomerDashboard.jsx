import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNowShowing, getUpcoming } from "../../data/movies";
import MovieGrid from "../../components/movie/MovieGrid";
import "./CustomerDashboard.css";

const BANNER_MOVIE = getNowShowing()[0];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const nowShowing = getNowShowing().slice(0, 6);
  const upcoming = getUpcoming().slice(0, 4);

  return (
    <div className="dashboard-page">
      {/* Hero Banner */}
      <section className="hero-banner" style={{ backgroundImage: `url(${BANNER_MOVIE.banner})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <span>⭐</span> {BANNER_MOVIE.rating} Rating
          </div>
          <h1 className="hero-title">{BANNER_MOVIE.title}</h1>
          <div className="hero-meta">
            {BANNER_MOVIE.genre.map(g => (
              <span key={g} className="badge badge-secondary">{g}</span>
            ))}
            <span className="badge badge-secondary">⏱ {BANNER_MOVIE.duration} min</span>
          </div>
          <p className="hero-description">{BANNER_MOVIE.description.slice(0, 140)}...</p>
          <div className="hero-actions">
            <Link to={`/customer/movie/${BANNER_MOVIE.id}`} className="btn btn-primary btn-lg" id="hero-book-now">
              🎟️ Book Now
            </Link>
            <Link to={`/customer/movie/${BANNER_MOVIE.id}`} className="btn btn-secondary btn-lg" id="hero-more-info">
              ℹ️ More Info
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="dashboard-content">
        {/* Welcome strip */}
        <div className="welcome-strip">
          <div>
            <h2>Welcome back, <span style={{ color: "var(--accent-primary)" }}>{user?.name?.split(" ")[0]}</span> 👋</h2>
            <p className="text-muted text-sm mt-1">Ready for your next cinematic adventure?</p>
          </div>
          <div className="quick-actions">
            <Link to="/customer/movies" className="btn btn-outline btn-sm" id="browse-all-movies">Browse Movies</Link>
            <Link to="/customer/history" className="btn btn-secondary btn-sm" id="view-bookings">My Bookings</Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="quick-stats">
          {[
            { icon: "🎬", label: "Movies Available", value: "13" },
            { icon: "🎭", label: "Theatres", value: "5" },
            { icon: "🎟️", label: "Your Bookings", value: "5" },
            { icon: "⭐", label: "Avg Rating", value: "8.1" },
          ].map(s => (
            <div key={s.label} className="quick-stat-card">
              <span className="quick-stat-icon">{s.icon}</span>
              <span className="quick-stat-value">{s.value}</span>
              <span className="quick-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Now Showing */}
        <section>
          <div className="section-header">
            <h2 className="section-title">🎬 Now <span>Showing</span></h2>
            <Link to="/customer/movies" className="btn btn-ghost btn-sm" id="view-all-showing">View All →</Link>
          </div>
          <MovieGrid movies={nowShowing} />
        </section>

        {/* Upcoming */}
        <section style={{ marginTop: 48 }}>
          <div className="section-header">
            <h2 className="section-title">🔜 Coming <span>Soon</span></h2>
            <Link to="/customer/movies" className="btn btn-ghost btn-sm" id="view-all-upcoming">View All →</Link>
          </div>
          <MovieGrid movies={upcoming} />
        </section>
      </div>
    </div>
  );
}
