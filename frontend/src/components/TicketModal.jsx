import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, X, Download, Ticket, Calendar, MapPin, DollarSign } from 'lucide-react';

const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const bookingId = booking.bookingId || 'EVT-2026-XXXXX';
  const eventName = booking.eventName || booking.eventId?.name || 'Event Ticket';
  const venue = booking.venue || booking.eventId?.venue || 'Main Venue';
  const date = booking.date || booking.eventId?.date || 'Upcoming';
  const quantity = booking.quantity || 1;
  const totalAmount = booking.totalAmount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Confirmed Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-100 hover:text-white rounded-full bg-emerald-700/50 hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold">Booking Confirmed!</h2>
          <p className="text-emerald-100 text-sm mt-0.5">Digital Ticket Issued</p>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-5">
          
          {/* Booking ID Highlight */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 text-center space-y-1 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Booking ID</span>
            <div className="text-2xl font-mono font-extrabold text-brand-400 tracking-wider">
              {bookingId}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
            {booking.qrCode ? (
              <img src={booking.qrCode} alt="Ticket QR" className="w-36 h-36 rounded-lg shadow-sm" />
            ) : (
              <QRCodeSVG
                value={JSON.stringify({ bookingId, eventName, quantity, totalAmount })}
                size={144}
                level="H"
                includeMargin={true}
              />
            )}
            <p className="text-[11px] font-semibold text-slate-400 mt-2">Scan at venue entrance</p>
          </div>

          {/* Summary Details */}
          <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center text-slate-500"><Ticket className="w-4 h-4 mr-2 text-brand-600" /> Event</span>
              <span className="font-bold text-slate-900 text-right">{eventName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center text-slate-500"><Calendar className="w-4 h-4 mr-2 text-brand-600" /> Date</span>
              <span className="font-semibold text-slate-800">{date}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center text-slate-500"><MapPin className="w-4 h-4 mr-2 text-brand-600" /> Venue</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{venue}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-slate-500">Tickets Booked</span>
              <span className="font-extrabold text-slate-900 text-base">{quantity} ticket(s)</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-base font-bold">
              <span className="text-slate-700">Total Paid</span>
              <span className="text-brand-600 text-lg">₹{totalAmount}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-lg"
          >
            Done & View My Bookings
          </button>

        </div>
      </div>
    </div>
  );
};

export default TicketModal;
