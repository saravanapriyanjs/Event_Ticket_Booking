import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AIInsightCard from '../components/AIInsightCard';
import { ArrowLeft, Edit, Users, Ticket, DollarSign, Calendar, MapPin, Sparkles, Clock, AlertTriangle } from 'lucide-react';

const OrganizerEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [waitlistData, setWaitlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, waitlistRes] = await Promise.all([
        api.get(`/organizer/events/${id}/statistics`),
        api.get(`/events/${id}/waitlist`).catch(() => null),
      ]);

      setData(statsRes.data);
      if (waitlistRes) setWaitlistData(waitlistRes.data.waitlist || []);
    } catch (err) {
      console.error('Failed fetching statistics:', err);
      setError(err.response?.data?.message || 'Failed loading event statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">{error || 'Event statistics unavailable.'}</h2>
        <Link to="/organizer/events" className="inline-block px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl">
          Back to Events List
        </Link>
      </div>
    );
  }

  const { event, stats, aiInsight } = data;
  const fillRate = event.capacity > 0 ? Math.round((event.ticketsSold / event.capacity) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/organizer/events')}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Events</span>
        </button>

        <Link
          to={`/organizer/events/${event.id || id}/edit`}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Event</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {event.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">{event.date}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{event.name}</h1>
          <p className="text-slate-500 text-sm flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-slate-400" /> {event.venue}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold uppercase text-slate-400 block">Total Gross Revenue</span>
          <span className="text-3xl font-extrabold text-emerald-600">₹{event.revenue?.toLocaleString()}</span>
        </div>
      </div>

      {/* AI Demand Intelligence Highlight */}
      {aiInsight && (
        <AIInsightCard insight={aiInsight} eventName={event.name} />
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400 block">Seat Capacity</span>
          <div className="text-2xl font-extrabold text-slate-900">{event.capacity} seats</div>
          <p className="text-xs text-slate-500 font-medium">{event.availableTickets} available</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400 block">Tickets Sold</span>
          <div className="text-2xl font-extrabold text-emerald-600">{event.ticketsSold} ({fillRate}%)</div>
          <p className="text-xs text-slate-500 font-medium">Across {stats.totalBookingsCount} orders</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400 block">24h Velocity</span>
          <div className="text-2xl font-extrabold text-brand-600">+{stats.bookingVelocity24h} tickets</div>
          <p className="text-xs text-slate-500 font-medium">Recent booking pace</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400 block">Avg Order Size</span>
          <div className="text-2xl font-extrabold text-slate-900">{stats.averageBookingSize} tix</div>
          <p className="text-xs text-slate-500 font-medium">Tickets per transaction</p>
        </div>

      </div>

      {/* Waitlist Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Event Waitlist Entries</span>
          </h2>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
            {waitlistData.length} Waiting
          </span>
        </div>

        {waitlistData.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {waitlistData.map((w, idx) => (
              <div key={w._id || idx} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                    #{w.position}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{w.userId?.name || 'Waitlist User'}</span>
                    <span className="text-xs text-slate-400">{w.userId?.email}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No users currently on waitlist.</p>
        )}
      </div>

    </div>
  );
};

export default OrganizerEventDetailPage;
