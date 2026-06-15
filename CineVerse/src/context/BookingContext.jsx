import { createContext, useContext, useState, useCallback } from "react";

// Booking Context – manages the multi-step booking flow state
const BookingContext = createContext(null);

const initialState = {
  movie: null,
  city: null,
  theatre: null,
  screen: null,
  show: null,
  selectedSeats: [],
  totalAmount: 0,
};

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(initialState);

  const setMovie = useCallback((movie) => {
    setBooking((prev) => ({ ...prev, movie, city: null, theatre: null, screen: null, show: null, selectedSeats: [], totalAmount: 0 }));
  }, []);

  const setCity = useCallback((city) => {
    setBooking((prev) => ({ ...prev, city, theatre: null, screen: null, show: null, selectedSeats: [], totalAmount: 0 }));
  }, []);

  const setTheatre = useCallback((theatre) => {
    setBooking((prev) => ({ ...prev, theatre, screen: null, show: null, selectedSeats: [], totalAmount: 0 }));
  }, []);

  const setScreen = useCallback((screen) => {
    setBooking((prev) => ({ ...prev, screen, show: null, selectedSeats: [], totalAmount: 0 }));
  }, []);

  const setShow = useCallback((show) => {
    setBooking((prev) => ({ ...prev, show, selectedSeats: [], totalAmount: 0 }));
  }, []);

  const setSelectedSeats = useCallback((seats) => {
    setBooking((prev) => {
      const amount = seats.reduce((sum, seat) => {
        const price = prev.show?.price[seat.type] || 0;
        return sum + price;
      }, 0);
      return { ...prev, selectedSeats: seats, totalAmount: amount };
    });
  }, []);

  const resetBooking = useCallback(() => {
    setBooking(initialState);
  }, []);

  const generateBookingId = () => {
    return "CVB" + Date.now().toString().slice(-6);
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        setMovie,
        setCity,
        setTheatre,
        setScreen,
        setShow,
        setSelectedSeats,
        resetBooking,
        generateBookingId,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};
