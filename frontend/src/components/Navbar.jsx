import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Calendar,
  BarChart3,
  UserCheck,
  Building2,
  LogOut,
  PlusCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

const Navbar = () => {
  const { user, role, isAuthenticated, isOrganizer, isUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Event<span className="text-brand-500">IQ</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">AI Platform</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Book Smarter. Manage Better.</p>
            </div>
          </Link>

          {/* Navigation Links based on Role */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/events') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Events</span>
            </Link>

            {isUser && (
              <>
                <Link
                  to="/user/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/user/dashboard') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/user/bookings"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/user/bookings') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
              </>
            )}

            {isOrganizer && (
              <>
                <Link
                  to="/organizer/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/organizer/dashboard') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Organizer Portal
                </Link>
                <Link
                  to="/organizer/events"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/organizer/events') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  My Events
                </Link>
                <Link
                  to="/organizer/analytics"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/organizer/analytics') ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Analytics</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Auth Portal Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isOrganizer && (
                  <Link
                    to="/organizer/events/create"
                    className="hidden lg:flex items-center space-x-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:from-brand-500 hover:to-indigo-500 transition-all shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-full py-1.5 px-3">
                  <div className={`w-2 h-2 rounded-full ${isOrganizer ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/user/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>User Login</span>
                </Link>
                <Link
                  to="/organizer/login"
                  className="px-3.5 py-2 text-sm font-medium bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-lg transition-all shadow-md flex items-center space-x-1"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Organizer Portal</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
