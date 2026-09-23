import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import TicketModal from '../components/TicketModal';
import { Calendar, MapPin, Ticket, Tag, Users, AlertTriangle, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isUser, isOrganizer } = useAuth();
  const { capacityUpdates } = useSocket();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [waitlistMsg, setWaitlistMsg] = useState('');

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      console.error('Failed fetching event:', err);
      setError('Event not found or failed loading.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">{error || 'Event not found.'}</h2>
        <Link to="/events" className="inline-block px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl">
          Back to Events Catalog
        </Link>
      </div>
    );
  }

  // Socket real-time capacity override
  const socketData = capacityUpdates[event._id] || capacityUpdates[event.id];
  const availableTickets = socketData ? socketData.availableTickets : event.availableTickets;
  const ticketsSold = socketData ? socketData.ticketsSold : event.ticketsSold;
  const isSoldOut = availableTickets <= 0;
  const fillPercentage = event.capacity > 0 ? Math.min(100, Math.round((ticketsSold / event.capacity) * 100)) : 0;

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      navigate('/user/login');
      return;
    }
    try {
      const res = await api.post(`/events/${event._id || event.id}/waitlist`);
      setWaitlistMsg(res.data.message);
    } catch (err) {
      setWaitlistMsg(err.response?.data?.message || 'Failed to join waitlist.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 h-80">
            <img
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700/50 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-400" />
              <span>{event.category}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{event.name}</h1>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center">
                <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                Organized by: <span className="font-bold text-slate-800 ml-1">{event.organizerId?.organizationName || event.organizerId?.name || 'Authorized Organizer'}</span>
              </p>
            </div>

            <div className="border-t border-b border-slate-100 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
              <div className="flex items-center space-x-3 text-slate-700">
                <Calendar className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Date & Time</span>
                  <span>{event.date} • {event.time}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-700">
                <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Venue</span>
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">About This Event</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Live Capacity Booking Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Price</span>
              <span className="text-3xl font-extrabold text-slate-900">
                {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice}`}
              </span>
            </div>

            {/* Live Capacity Gauge */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-slate-500" /> Capacity Status
                </span>
                <span className={isSoldOut ? 'text-red-600' : 'text-emerald-600'}>
                  {isSoldOut ? 'SOLD OUT' : `${availableTickets} Available`}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isSoldOut ? 'bg-red-500' : fillPercentage >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 text-center text-xs font-semibold text-slate-500 pt-1">
                <div>
                  <span className="block text-slate-900 font-extrabold text-sm">{ticketsSold}</span>
                  <span>Tickets Sold</span>
                </div>
                <div>
                  <span className="block text-slate-900 font-extrabold text-sm">{event.capacity}</span>
                  <span>Total Seats</span>
                </div>
              </div>
            </div>

            {waitlistMsg && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{waitlistMsg}</span>
              </div>
            )}

            {/* Primary Action Button */}
            {isSoldOut ? (
              <button
                onClick={handleJoinWaitlist}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base shadow-lg transition-all"
              >
                Join Event Waitlist
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/user/login');
                  } else {
                    setShowBookingModal(true);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl hover:shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Ticket className="w-5 h-5" />
                <span>{isAuthenticated ? 'Book Tickets Now' : 'Login to Book Tickets'}</span>
              </button>
            )}

            {isOrganizer && (
              <div className="pt-2 text-center">
                <Link
                  to={`/organizer/events/${event._id || event.id}`}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View in Organizer Dashboard & Analytics &rarr;
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>

      {showBookingModal && (
        <BookingModal
          event={event}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={(b) => {
            setConfirmedBooking(b);
            fetchEvent();
          }}
        />
      )}

      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}

    </div>
  );
};

export default EventDetailPage;
