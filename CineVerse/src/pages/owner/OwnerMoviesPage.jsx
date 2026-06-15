import { useState } from "react";
import { movies as initialMovies } from "../../data/movies";

export default function OwnerMoviesPage() {
  const [movies, setMovies] = useState(initialMovies);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", genre: "", duration: "", rating: "", poster: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setMovies(prev => prev.map(m => m.id === editId ? { ...m, ...form, genre: form.genre.split(",").map(g => g.trim()), duration: Number(form.duration) } : m));
    } else {
      setMovies(prev => [...prev, { id: Date.now(), ...form, genre: form.genre.split(",").map(g => g.trim()), duration: Number(form.duration), status: "now_showing", cast: [], director: "" }]);
    }
    setShowForm(false); setEditId(null);
    setForm({ title: "", genre: "", duration: "", rating: "", poster: "", description: "" });
  };

  const handleEdit = (movie) => {
    setEditId(movie.id);
    setForm({ title: movie.title, genre: movie.genre.join(", "), duration: movie.duration, rating: movie.rating, poster: movie.poster, description: movie.description });
    setShowForm(true);
  };

  const handleDelete = (id) => setMovies(prev => prev.filter(m => m.id !== id));

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>Manage <span style={{ color: "var(--accent-primary)" }}>Movies</span></h1>
        <button className="btn btn-primary" id="add-movie-btn" onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", genre: "", duration: "", rating: "", poster: "", description: "" }); }}>
          + Add Movie
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editId ? "Edit Movie" : "Add New Movie"}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { key: "title", label: "Movie Title", placeholder: "e.g. The Dark Knight" },
                { key: "genre", label: "Genres (comma separated)", placeholder: "Action, Thriller" },
                { key: "duration", label: "Duration (minutes)", placeholder: "150", type: "number" },
                { key: "rating", label: "Rating (0-10)", placeholder: "8.5", type: "number" },
                { key: "poster", label: "Poster URL", placeholder: "https://..." },
              ].map(f => (
                <div key={f.key} className="input-group">
                  <label className="input-label">{f.label}</label>
                  <input type={f.type || "text"} className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.key !== "poster"} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-movie-btn">{editId ? "Update" : "Add Movie"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Poster</th><th>Title</th><th>Genre</th><th>Duration</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td><img src={movie.poster} alt={movie.title} style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 6 }} onError={e => e.target.style.display = "none"} /></td>
                <td style={{ fontWeight: 600 }}>{movie.title}</td>
                <td><span className="badge badge-primary">{movie.genre[0]}</span></td>
                <td>{movie.duration} min</td>
                <td><span style={{ color: "var(--accent-gold)" }}>⭐ {movie.rating}</span></td>
                <td><span className={`badge badge-${movie.status === "now_showing" ? "success" : "info"}`}>{movie.status === "now_showing" ? "Showing" : "Upcoming"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(movie)}>✏️</button>
                    <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => handleDelete(movie.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
