import React, { useState } from 'react';
import { X, Ticket, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const BookingModal = ({ event, onClose, onBookingSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

  const ticketPrice = event.ticketPrice || 0;
  const availableTickets = event.availableTickets || 0;
  const maxAllowed = Math.min(10, availableTickets);
  const totalAmount = quantity * ticketPrice;

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (quantity > availableTickets) {
      setError(`Cannot book more than available capacity (${availableTickets}).`);
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/bookings', {
        eventId: event._id || event.id,
        quantity,
      });

      if (onBookingSuccess) {
        onBookingSuccess(res.data.booking);
      }
      onClose();
    } catch (err) {
      console.error('Booking Error:', err);
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Confirm Booking</span>
          </div>
          <h2 className="text-2xl font-extrabold">{event.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{event.category} Event</p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Event Details Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-brand-600" /> Date & Time</span>
              <span className="font-semibold text-slate-900">{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-brand-600" /> Venue</span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">{event.venue}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center"><Ticket className="w-4 h-4 mr-2 text-brand-600" /> Price Per Ticket</span>
              <span className="font-bold text-slate-900">₹{ticketPrice}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Available Capacity</span>
              <span className="font-semibold text-emerald-600">{availableTickets} tickets remaining</span>
            </div>
          </div>

          {/* Ticket Quantity Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              Select Number of Tickets
            </label>
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={num > maxAllowed}
                  onClick={() => setQuantity(num)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                    quantity === num
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105'
                      : num > maxAllowed
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-brand-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Calculation</p>
              <p className="text-sm font-bold text-slate-800">
                {quantity} ticket(s) × ₹{ticketPrice}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-600 font-semibold">Total Payable</p>
              <p className="text-2xl font-extrabold text-brand-700">₹{totalAmount}</p>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleBooking}
            disabled={loading || availableTickets <= 0}
            className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl text-base shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirm Booking (₹{totalAmount})</span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default BookingModal;
