import { useState, useMemo } from "react";
import { movies, genres } from "../../data/movies";
import MovieGrid from "../../components/movie/MovieGrid";
import "./MoviesPage.css";

export default function MoviesPage() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.genre.some(g => g.toLowerCase().includes(search.toLowerCase())) ||
        m.director.toLowerCase().includes(search.toLowerCase());
      const matchGenre = selectedGenre === "All" || m.genre.includes(selectedGenre);
      const matchStatus = selectedStatus === "all" || m.status === selectedStatus;
      return matchSearch && matchGenre && matchStatus;
    });
  }, [search, selectedGenre, selectedStatus]);

  return (
    <div className="movies-page fade-in">
      <div className="movies-header">
        <div>
          <h1>Movie <span style={{ color: "var(--accent-primary)" }}>Catalog</span></h1>
          <p className="text-muted" style={{ marginTop: 6, fontSize: "0.9rem" }}>
            {filtered.length} movies available
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="movies-filters">
        {/* Search */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="movie-search"
            type="text"
            placeholder="Search by title, genre, director..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Status filter */}
        <div className="filter-pills">
          {[
            { val: "all", label: "All Movies" },
            { val: "now_showing", label: "Now Showing" },
            { val: "upcoming", label: "Upcoming" },
          ].map(opt => (
            <button
              key={opt.val}
              id={`filter-${opt.val}`}
              className={`filter-pill ${selectedStatus === opt.val ? "active" : ""}`}
              onClick={() => setSelectedStatus(opt.val)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre chips */}
      <div className="genre-chips">
        {genres.map(g => (
          <button
            key={g}
            id={`genre-${g}`}
            className={`genre-chip ${selectedGenre === g ? "active" : ""}`}
            onClick={() => setSelectedGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid */}
      <MovieGrid movies={filtered} emptyMessage="No movies match your search. Try different filters." />
    </div>
  );
}
