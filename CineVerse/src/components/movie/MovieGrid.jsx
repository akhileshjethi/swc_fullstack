import MovieCard from "./MovieCard";

export default function MovieGrid({ movies, emptyMessage = "No movies found" }) {
  if (!movies?.length) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: "3rem" }}>🎬</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="movie-grid slide-up">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
