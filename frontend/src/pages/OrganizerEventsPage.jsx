import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, Eye, Edit, Trash2, Calendar, MapPin, Ticket, AlertCircle } from 'lucide-react';

const OrganizerEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await api.get('/organizer/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/events/${id}`);
      setMessage(`Event "${name}" deleted successfully.`);
      fetchEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage My Events</h1>
          <p className="text-slate-500 text-sm mt-1">Create, update, or inspect events you own</p>
        </div>
        <Link
          to="/organizer/events/create"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl transition-all inline-flex items-center space-x-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Create New Event</span>
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-sm font-semibold animate-fadeIn shadow-lg">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {events.map((evt) => (
            <div
              key={evt._id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/80 transition-colors"
            >
              
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {evt.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">₹{evt.ticketPrice} per ticket</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{evt.name}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {evt.date} • {evt.time}</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {evt.venue}</span>
                  <span className="flex items-center text-slate-700 font-bold">
                    <Ticket className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Sold: {evt.ticketsSold} / {evt.capacity} (Avail: {evt.availableTickets})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/organizer/events/${evt._id}`}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 shadow"
                >
                  <Eye className="w-4 h-4 text-brand-400" />
                  <span>View Details & AI</span>
                </Link>

                <Link
                  to={`/organizer/events/${evt._id}/edit`}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>

                <button
                  onClick={() => handleDelete(evt._id, evt.name)}
                  disabled={deletingId === evt._id}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-semibold text-slate-700">No events created yet.</p>
          <Link
            to="/organizer/events/create"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow"
          >
            Create Your First Event
          </Link>
        </div>
      )}

    </div>
  );
};

export default OrganizerEventsPage;
