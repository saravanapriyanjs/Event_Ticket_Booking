import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EventCard from '../components/EventCard';
import BookingModal from '../components/BookingModal';
import TicketModal from '../components/TicketModal';
import { Search, Filter, Sparkles, CheckCircle2, Ticket, AlertCircle } from 'lucide-react';

const categories = ['All', 'Technology', 'Concert', 'Workshop', 'Cultural', 'Sports', 'Show'];

const UserDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [notification, setNotification] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.get('/events', { params });
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleJoinWaitlist = async (event) => {
    try {
      const res = await api.post(`/events/${event._id || event.id}/waitlist`);
      setNotification(res.data.message || 'Joined waitlist successfully!');
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setNotification(err.response?.data?.message || 'Failed to join waitlist.');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>USER TICKET PORTAL</span>
          </div>
          <h1 className="text-3xl font-extrabold">Welcome back, {user?.name || 'Explorer'}!</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Check real-time ticket availability, book instant seats, and access your digital ticket wallet with QR verification.
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event name, venue or details..."
              className="w-full pl-10 pr-24 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-600 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Search
            </button>
          </form>

          {/* Categories Pill List */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Events Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Upcoming Events</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Showing events in category: <span className="font-bold text-brand-600">{selectedCategory}</span>
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {events.length} Event(s) Found
        </span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard
              key={evt._id || evt.id}
              event={evt}
              onBookClick={(eventToBook) => setSelectedEventForBooking(eventToBook)}
              onWaitlistClick={(eventForWaitlist) => handleJoinWaitlist(eventForWaitlist)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-semibold text-slate-700">No events found matching your filter criteria.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearch(''); fetchEvents(); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Booking Modal Trigger */}
      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
          onBookingSuccess={(bookingData) => {
            setConfirmedBooking(bookingData);
            fetchEvents();
          }}
        />
      )}

      {/* Digital Ticket Modal Trigger */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}

    </div>
  );
};

export default UserDashboard;
