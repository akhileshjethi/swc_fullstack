import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { ProtectedRoute, GuestRoute } from "./routes/ProtectedRoute";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import BookingLayout from "./layouts/BookingLayout";
import CustomerLayout from "./layouts/CustomerLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MoviesPage from "./pages/customer/MoviesPage";
import MovieDetailsPage from "./pages/customer/MovieDetailsPage";
import LocationPage from "./pages/customer/LocationPage";
import TheatrePage from "./pages/customer/TheatrePage";
import ScreenPage from "./pages/customer/ScreenPage";
import ShowtimePage from "./pages/customer/ShowtimePage";
import SeatsPage from "./pages/customer/SeatsPage";
import BookingSummaryPage from "./pages/customer/BookingSummaryPage";
import BookingConfirmationPage from "./pages/customer/BookingConfirmationPage";
import ProfilePage from "./pages/customer/ProfilePage";
import SettingsPage from "./pages/customer/SettingsPage";
import BookingHistoryPage from "./pages/customer/BookingHistoryPage";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerMoviesPage from "./pages/owner/OwnerMoviesPage";
import OwnerShowsPage from "./pages/owner/OwnerShowsPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";
import OwnerScreensPage from "./pages/owner/OwnerScreensPage";
import SeatLayoutPage from "./pages/owner/SeatLayoutPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminTheatresPage from "./pages/admin/AdminTheatresPage";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes (guest only) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* ─── Customer Routes ─── */}
            {/* Dashboard (sidebar layout) */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/profile" element={<ProfilePage />} />
              <Route path="/customer/settings" element={<SettingsPage />} />
              <Route path="/customer/history" element={<BookingHistoryPage />} />
            </Route>

            {/* Booking Flow (booking layout with progress bar) */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]}><BookingLayout /></ProtectedRoute>}>
              <Route path="/customer/movies" element={<MoviesPage />} />
              <Route path="/customer/movie/:id" element={<MovieDetailsPage />} />
              <Route path="/customer/location" element={<LocationPage />} />
              <Route path="/customer/theatre" element={<TheatrePage />} />
              <Route path="/customer/screen" element={<ScreenPage />} />
              <Route path="/customer/showtime" element={<ShowtimePage />} />
              <Route path="/customer/seats" element={<SeatsPage />} />
              <Route path="/customer/summary" element={<BookingSummaryPage />} />
              <Route path="/customer/confirmation" element={<BookingConfirmationPage />} />
            </Route>

            {/* ─── Owner Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={["owner"]}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/movies" element={<OwnerMoviesPage />} />
              <Route path="/owner/shows" element={<OwnerShowsPage />} />
              <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
              <Route path="/owner/screens" element={<OwnerScreensPage />} />
              <Route path="/owner/layout" element={<SeatLayoutPage />} />
            </Route>

            {/* ─── Admin Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/theatres" element={<AdminTheatresPage />} />
              <Route path="/admin/requests" element={<AdminRequestsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
