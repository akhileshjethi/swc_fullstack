// Mock screens data for theatres
export const screens = [
  // Theatre 1 - CineVerse IMAX BKC
  { id: 1, theatreId: 1, name: "IMAX Screen 1", type: "IMAX", capacity: 250, rows: 10, cols: 25 },
  { id: 2, theatreId: 1, name: "Screen 2 - Dolby", type: "Dolby Atmos", capacity: 180, rows: 9, cols: 20 },
  { id: 3, theatreId: 1, name: "Screen 3 - 4DX", type: "4DX", capacity: 120, rows: 8, cols: 15 },
  { id: 4, theatreId: 1, name: "Screen 4 - Standard", type: "Standard", capacity: 200, rows: 10, cols: 20 },
  { id: 5, theatreId: 1, name: "Screen 5 - Premium", type: "Premium", capacity: 150, rows: 10, cols: 15 },

  // Theatre 2 - StarLight Andheri
  { id: 6, theatreId: 2, name: "Screen A - Dolby", type: "Dolby Atmos", capacity: 180, rows: 9, cols: 20 },
  { id: 7, theatreId: 2, name: "Screen B - Standard", type: "Standard", capacity: 200, rows: 10, cols: 20 },
  { id: 8, theatreId: 2, name: "Screen C - Recliner", type: "Recliner", capacity: 100, rows: 8, cols: 13 },
  { id: 9, theatreId: 2, name: "Screen D - Standard", type: "Standard", capacity: 220, rows: 11, cols: 20 },

  // Theatre 3 - Galaxy Bengaluru
  { id: 10, theatreId: 3, name: "Audi 1 - 4K", type: "4K", capacity: 200, rows: 10, cols: 20 },
  { id: 11, theatreId: 3, name: "Audi 2 - VIP", type: "VIP", capacity: 80, rows: 8, cols: 10 },
  { id: 12, theatreId: 3, name: "Audi 3 - Standard", type: "Standard", capacity: 220, rows: 11, cols: 20 },
  { id: 13, theatreId: 3, name: "Audi 4 - Dolby", type: "Dolby Atmos", capacity: 180, rows: 9, cols: 20 },
  { id: 14, theatreId: 3, name: "Audi 5 - Premium", type: "Premium", capacity: 160, rows: 10, cols: 16 },
  { id: 15, theatreId: 3, name: "Audi 6 - Standard", type: "Standard", capacity: 200, rows: 10, cols: 20 },

  // Theatre 4 - Phoenix Chennai
  { id: 16, theatreId: 4, name: "Screen 1 - Dolby", type: "Dolby Atmos", capacity: 180, rows: 9, cols: 20 },
  { id: 17, theatreId: 4, name: "Screen 2 - Standard", type: "Standard", capacity: 200, rows: 10, cols: 20 },
  { id: 18, theatreId: 4, name: "Screen 3 - Standard", type: "Standard", capacity: 220, rows: 11, cols: 20 },
  { id: 19, theatreId: 4, name: "Screen 4 - Premium", type: "Premium", capacity: 150, rows: 10, cols: 15 },

  // Theatre 5 - Horizon Hyderabad
  { id: 20, theatreId: 5, name: "IMAX Grand", type: "IMAX", capacity: 300, rows: 12, cols: 25 },
  { id: 21, theatreId: 5, name: "Screen 2 - Dolby", type: "Dolby Atmos", capacity: 180, rows: 9, cols: 20 },
  { id: 22, theatreId: 5, name: "Screen 3 - 4DX", type: "4DX", capacity: 120, rows: 8, cols: 15 },
  { id: 23, theatreId: 5, name: "VIP Lounge", type: "VIP", capacity: 60, rows: 6, cols: 10 },
  { id: 24, theatreId: 5, name: "Screen 5 - Standard", type: "Standard", capacity: 200, rows: 10, cols: 20 },
  { id: 25, theatreId: 5, name: "Screen 6 - Recliner", type: "Recliner", capacity: 100, rows: 8, cols: 13 },
  { id: 26, theatreId: 5, name: "Screen 7 - Standard", type: "Standard", capacity: 220, rows: 11, cols: 20 },
];

export const getScreensByTheatre = (theatreId) =>
  screens.filter((s) => s.theatreId === parseInt(theatreId));

export const getScreenById = (id) =>
  screens.find((s) => s.id === parseInt(id));
