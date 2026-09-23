import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Tag, Users, AlertTriangle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const EventCard = ({ event, onBookClick, onWaitlistClick }) => {
  const { capacityUpdates } = useSocket();

  // Socket real-time override
  const realTimeData = capacityUpdates[event._id] || capacityUpdates[event.id];
  const availableTickets = realTimeData ? realTimeData.availableTickets : event.availableTickets;
  const ticketsSold = realTimeData ? realTimeData.ticketsSold : event.ticketsSold;
  const capacity = event.capacity;

  const isSoldOut = availableTickets <= 0;
  const fillPercentage = capacity > 0 ? Math.min(100, Math.round((ticketsSold / capacity) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      
      {/* Event Header Image */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
        
        {/* Category Tag */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-slate-700/50 flex items-center space-x-1">
          <Tag className="w-3 h-3 text-brand-400" />
          <span>{event.category}</span>
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-brand-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-md">
          {event.ticketPrice === 0 ? 'FREE' : `₹${event.ticketPrice} / ticket`}
        </div>

        {/* Live Status Badge */}
        {isSoldOut ? (
          <div className="absolute bottom-3 left-3 bg-red-600/90 text-white font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider flex items-center space-x-1 shadow-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOLD OUT</span>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-md flex items-center space-x-1 shadow">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Available: {availableTickets} / {capacity}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors mb-2">
            {event.name}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {event.description}
          </p>

          <div className="space-y-2 text-xs font-medium text-slate-600 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{event.date} {event.time && `• ${event.time}`}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500">Booking Capacity</span>
            <span className={fillPercentage >= 90 ? 'text-red-600' : 'text-slate-700'}>
              {availableTickets} remaining ({fillPercentage}% filled)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isSoldOut
                  ? 'bg-red-500'
                  : fillPercentage >= 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            to={`/events/${event._id || event.id}`}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-center py-2.5 rounded-xl text-sm transition-colors"
          >
            View Event
          </Link>

          {isSoldOut ? (
            <button
              onClick={() => onWaitlistClick && onWaitlistClick(event)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow hover:shadow-md"
            >
              Join Waitlist
            </button>
          ) : (
            <button
              onClick={() => onBookClick && onBookClick(event)}
              className="flex-1 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-1"
            >
              <Ticket className="w-4 h-4" />
              <span>Book Tickets</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default EventCard;
