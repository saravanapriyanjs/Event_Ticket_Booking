import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, UserRoute, OrganizerRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerRegister from './pages/OrganizerRegister';
import UserDashboard from './pages/UserDashboard';
import EventDetailPage from './pages/EventDetailPage';
import UserBookingsPage from './pages/UserBookingsPage';
import UserProfilePage from './pages/UserProfilePage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerEventsPage from './pages/OrganizerEventsPage';
import CreateEditEventPage from './pages/CreateEditEventPage';
import OrganizerEventDetailPage from './pages/OrganizerEventDetailPage';
import OrganizerAnalyticsPage from './pages/OrganizerAnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<UserDashboard />} />
                <Route path="/events/:id" element={<EventDetailPage />} />

                {/* Auth Routes */}
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/organizer/login" element={<OrganizerLogin />} />
                <Route path="/organizer/register" element={<OrganizerRegister />} />

                {/* User Protected Routes */}
                <Route
                  path="/user/dashboard"
                  element={
                    <UserRoute>
                      <UserDashboard />
                    </UserRoute>
                  }
                />
                <Route
                  path="/user/bookings"
                  element={
                    <UserRoute>
                      <UserBookingsPage />
                    </UserRoute>
                  }
                />
                <Route
                  path="/user/profile"
                  element={
                    <UserRoute>
                      <UserProfilePage />
                    </UserRoute>
                  }
                />

                {/* Organizer Protected Routes */}
                <Route
                  path="/organizer/dashboard"
                  element={
                    <OrganizerRoute>
                      <OrganizerDashboard />
                    </OrganizerRoute>
                  }
                />
                <Route
                  path="/organizer/events"
                  element={
                    <OrganizerRoute>
                      <OrganizerEventsPage />
                    </OrganizerRoute>
                  }
                />
                <Route
                  path="/organizer/events/create"
                  element={
                    <OrganizerRoute>
                      <CreateEditEventPage />
                    </OrganizerRoute>
                  }
                />
                <Route
                  path="/organizer/events/:id"
                  element={
                    <OrganizerRoute>
                      <OrganizerEventDetailPage />
                    </OrganizerRoute>
                  }
                />
                <Route
                  path="/organizer/events/:id/edit"
                  element={
                    <OrganizerRoute>
                      <CreateEditEventPage />
                    </OrganizerRoute>
                  }
                />
                <Route
                  path="/organizer/analytics"
                  element={
                    <OrganizerRoute>
                      <OrganizerAnalyticsPage />
                    </OrganizerRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
