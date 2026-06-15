// Mock shows/showtimes data
export const shows = [
  // Stellar Odyssey at CineVerse IMAX BKC
  { id: 1, movieId: 1, theatreId: 1, screenId: 1, date: "2026-06-10", time: "10:00 AM", price: { regular: 300, premium: 450, vip: 700 }, occupancy: 60 },
  { id: 2, movieId: 1, theatreId: 1, screenId: 1, date: "2026-06-10", time: "01:30 PM", price: { regular: 300, premium: 450, vip: 700 }, occupancy: 85 },
  { id: 3, movieId: 1, theatreId: 1, screenId: 1, date: "2026-06-10", time: "05:00 PM", price: { regular: 350, premium: 500, vip: 750 }, occupancy: 92 },
  { id: 4, movieId: 1, theatreId: 1, screenId: 1, date: "2026-06-10", time: "09:00 PM", price: { regular: 350, premium: 500, vip: 750 }, occupancy: 45 },
  { id: 5, movieId: 1, theatreId: 2, screenId: 6, date: "2026-06-10", time: "11:00 AM", price: { regular: 250, premium: 380, vip: 600 }, occupancy: 55 },
  { id: 6, movieId: 1, theatreId: 2, screenId: 6, date: "2026-06-10", time: "03:00 PM", price: { regular: 280, premium: 400, vip: 620 }, occupancy: 70 },
  { id: 7, movieId: 1, theatreId: 2, screenId: 6, date: "2026-06-10", time: "07:00 PM", price: { regular: 300, premium: 430, vip: 650 }, occupancy: 88 },

  // Crimson Tides at StarLight Andheri
  { id: 8, movieId: 2, theatreId: 2, screenId: 7, date: "2026-06-10", time: "09:30 AM", price: { regular: 200, premium: 320, vip: 520 }, occupancy: 40 },
  { id: 9, movieId: 2, theatreId: 2, screenId: 7, date: "2026-06-10", time: "12:30 PM", price: { regular: 220, premium: 340, vip: 540 }, occupancy: 65 },
  { id: 10, movieId: 2, theatreId: 2, screenId: 7, date: "2026-06-10", time: "04:00 PM", price: { regular: 250, premium: 370, vip: 570 }, occupancy: 80 },
  { id: 11, movieId: 2, theatreId: 2, screenId: 7, date: "2026-06-10", time: "08:30 PM", price: { regular: 270, premium: 390, vip: 590 }, occupancy: 72 },

  // Neon Dynasty at Galaxy Bengaluru
  { id: 12, movieId: 3, theatreId: 3, screenId: 10, date: "2026-06-10", time: "10:30 AM", price: { regular: 280, premium: 420, vip: 680 }, occupancy: 50 },
  { id: 13, movieId: 3, theatreId: 3, screenId: 10, date: "2026-06-10", time: "02:00 PM", price: { regular: 300, premium: 440, vip: 700 }, occupancy: 78 },
  { id: 14, movieId: 3, theatreId: 3, screenId: 10, date: "2026-06-10", time: "06:30 PM", price: { regular: 320, premium: 460, vip: 720 }, occupancy: 95 },
  { id: 15, movieId: 3, theatreId: 3, screenId: 10, date: "2026-06-10", time: "10:00 PM", price: { regular: 300, premium: 440, vip: 700 }, occupancy: 38 },

  // The Lost Kingdom at Horizon Hyderabad
  { id: 16, movieId: 4, theatreId: 5, screenId: 20, date: "2026-06-10", time: "09:00 AM", price: { regular: 350, premium: 520, vip: 850 }, occupancy: 45 },
  { id: 17, movieId: 4, theatreId: 5, screenId: 20, date: "2026-06-10", time: "01:00 PM", price: { regular: 380, premium: 550, vip: 880 }, occupancy: 82 },
  { id: 18, movieId: 4, theatreId: 5, screenId: 20, date: "2026-06-10", time: "05:30 PM", price: { regular: 400, premium: 580, vip: 900 }, occupancy: 91 },
  { id: 19, movieId: 4, theatreId: 5, screenId: 20, date: "2026-06-10", time: "09:30 PM", price: { regular: 380, premium: 550, vip: 880 }, occupancy: 60 },

  // Monsoon Wedding at Phoenix Chennai
  { id: 20, movieId: 7, theatreId: 4, screenId: 16, date: "2026-06-10", time: "10:00 AM", price: { regular: 180, premium: 280, vip: 460 }, occupancy: 35 },
  { id: 21, movieId: 7, theatreId: 4, screenId: 16, date: "2026-06-10", time: "01:30 PM", price: { regular: 200, premium: 300, vip: 480 }, occupancy: 60 },
  { id: 22, movieId: 7, theatreId: 4, screenId: 16, date: "2026-06-10", time: "05:00 PM", price: { regular: 220, premium: 320, vip: 500 }, occupancy: 75 },
  { id: 23, movieId: 7, theatreId: 4, screenId: 16, date: "2026-06-10", time: "08:30 PM", price: { regular: 230, premium: 340, vip: 520 }, occupancy: 88 },

  // Velocity at StarLight Andheri
  { id: 24, movieId: 11, theatreId: 2, screenId: 8, date: "2026-06-10", time: "11:30 AM", price: { regular: 220, premium: 340, vip: 560 }, occupancy: 50 },
  { id: 25, movieId: 11, theatreId: 2, screenId: 8, date: "2026-06-10", time: "03:30 PM", price: { regular: 250, premium: 370, vip: 590 }, occupancy: 70 },
  { id: 26, movieId: 11, theatreId: 2, screenId: 8, date: "2026-06-10", time: "07:30 PM", price: { regular: 280, premium: 400, vip: 620 }, occupancy: 83 },
];

export const getShowsByMovieAndTheatre = (movieId, theatreId) =>
  shows.filter(
    (s) => s.movieId === parseInt(movieId) && s.theatreId === parseInt(theatreId)
  );

export const getShowsByTheatre = (theatreId) =>
  shows.filter((s) => s.theatreId === parseInt(theatreId));

export const getShowById = (id) =>
  shows.find((s) => s.id === parseInt(id));
