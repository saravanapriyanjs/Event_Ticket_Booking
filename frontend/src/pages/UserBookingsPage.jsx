import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TicketModal from '../components/TicketModal';
import { Ticket, Calendar, MapPin, QrCode, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Capacity will be restored for other buyers.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      setMessage(res.data.message || 'Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Ticket Wallet</h1>
          <p className="text-slate-500 text-sm mt-1">View your confirmed digital event passes & QR verification codes</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-2xl text-xs font-bold text-slate-700">
          {bookings.length} Total Pass(es)
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-sm flex items-center space-x-2 animate-fadeIn shadow-xl border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isCancelled = b.status === 'CANCELLED';
            const event = b.eventId || {};

            return (
              <div
                key={b._id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  isCancelled ? 'border-slate-200 opacity-60 bg-slate-50/80' : 'border-slate-200 hover:shadow-md'
                }`}
              >
                
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg text-sm border border-brand-200">
                      {b.bookingId}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        isCancelled
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{event.name || 'Event Ticket'}</h3>

                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 pt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{event.date || 'TBA'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{event.venue || 'Main Venue'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Ticket className="w-4 h-4 text-slate-400" />
                      <span>{b.quantity} Ticket(s) • Total Paid: ₹{b.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {!isCancelled && (
                    <>
                      <button
                        onClick={() => setSelectedTicket(b)}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow"
                      >
                        <QrCode className="w-4 h-4 text-brand-400" />
                        <span>View QR Ticket</span>
                      </button>

                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={cancellingId === b._id}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Booking</span>
                      </button>
                    </>
                  )}

                  {isCancelled && (
                    <span className="text-xs font-bold text-slate-400 italic">
                      Booking Cancelled & Capacity Restored
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-semibold text-slate-700">You have no active event bookings yet.</p>
          <a
            href="/events"
            className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Explore & Book Events
          </a>
        </div>
      )}

      {selectedTicket && (
        <TicketModal
          booking={{
            ...selectedTicket,
            eventName: selectedTicket.eventId?.name,
            venue: selectedTicket.eventId?.venue,
            date: selectedTicket.eventId?.date,
          }}
          onClose={() => setSelectedTicket(null)}
        />
      )}

    </div>
  );
};

export default UserBookingsPage;
