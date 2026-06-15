import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../data/movies";
import { useBooking } from "../../context/BookingContext";
import "./MovieDetails.css";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setMovie } = useBooking();
  const movie = getMovieById(id);

  if (!movie) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <div style={{ fontSize: "4rem" }}>🎬</div>
        <p>Movie not found</p>
        <button className="btn btn-primary" onClick={() => navigate("/customer/movies")}>Browse Movies</button>
      </div>
    );
  }

  const handleBookNow = () => {
    setMovie(movie);
    navigate("/customer/location");
  };

  const ratingColor = movie.rating >= 8 ? "#4ade80" : movie.rating >= 6 ? "var(--accent-gold)" : "#f87171";

  return (
    <div className="movie-details-page fade-in">
      {/* Banner */}
      <div className="movie-detail-banner" style={{ backgroundImage: `url(${movie.banner})` }}>
        <div className="movie-detail-banner-overlay" />
      </div>

      <div className="movie-detail-content">
        <div className="movie-detail-layout">
          {/* Poster */}
          <div className="movie-detail-poster-col">
            <div className="movie-detail-poster-wrapper">
              <img
                src={movie.poster}
                alt={movie.title}
                className="movie-detail-poster"
                onError={e => { e.target.src = `https://placehold.co/400x600/1a1a26/ffffff?text=${encodeURIComponent(movie.title)}`; }}
              />
              <div className="movie-detail-rating-badge" style={{ color: ratingColor, borderColor: ratingColor }}>
                ⭐ {movie.rating}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="movie-detail-info">
            <div>
              {movie.genre.map(g => <span key={g} className="badge badge-primary" style={{ marginRight: 6 }}>{g}</span>)}
            </div>
            <h1 className="movie-detail-title">{movie.title}</h1>

            <div className="movie-detail-meta">
              <div className="meta-item"><span>🎬</span><span>{movie.director}</span></div>
              <div className="meta-item"><span>⏱</span><span>{movie.duration} minutes</span></div>
              <div className="meta-item"><span>🌐</span><span>{movie.language}</span></div>
              <div className="meta-item"><span>📅</span><span>{new Date(movie.releaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
            </div>

            <div className="movie-detail-section">
              <h3>Synopsis</h3>
              <p className="movie-synopsis">{movie.description}</p>
            </div>

            <div className="movie-detail-section">
              <h3>Cast</h3>
              <div className="cast-list">
                {movie.cast.map(member => (
                  <div key={member} className="cast-card">
                    <div className="cast-avatar">{member.charAt(0)}</div>
                    <span className="cast-name">{member}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="movie-detail-prices">
              <h3>Ticket Prices</h3>
              <div className="price-list">
                <div className="price-item">
                  <span className="badge badge-info">Regular</span>
                  <span className="price-value">₹{movie.price.regular}</span>
                </div>
                <div className="price-item">
                  <span className="badge badge-gold">Premium</span>
                  <span className="price-value">₹{movie.price.premium}</span>
                </div>
                <div className="price-item">
                  <span className="badge badge-purple">VIP</span>
                  <span className="price-value">₹{movie.price.vip}</span>
                </div>
              </div>
            </div>

            <div className="movie-detail-actions">
              {movie.status === "now_showing" ? (
                <button className="btn btn-primary btn-lg" id="book-now-btn" onClick={handleBookNow}>
                  🎟️ Book Tickets
                </button>
              ) : (
                <button className="btn btn-secondary btn-lg" disabled>
                  🔔 Notify Me
                </button>
              )}
              <button className="btn btn-secondary btn-lg" id="trailer-btn">
                ▶ Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
