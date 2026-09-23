import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AIInsightCard from '../components/AIInsightCard';
import {
  Building2,
  PlusCircle,
  Calendar,
  Ticket,
  DollarSign,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/organizer/dashboard'),
        api.get('/organizer/analytics').catch(() => null),
      ]);

      setData(dashRes.data);
      if (analyticsRes) setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error('Failed fetching organizer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const summary = data?.summary || { totalEvents: 0, totalTicketsSold: 0, totalAvailableTickets: 0, totalRevenue: 0 };
  const events = data?.events || [];
  const featuredAI = analyticsData?.featuredAIInsight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>ORGANIZER PORTAL • {user?.organizationName || 'TechEvents Global'}</span>
          </div>
          <h1 className="text-3xl font-extrabold">Organizer Command Center</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time capacity tracking, revenue monitoring, and machine learning sell-out velocity forecasting.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <Link
            to="/organizer/analytics"
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Full AI Analytics</span>
          </Link>

          <Link
            to="/organizer/events/create"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Create Event</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Events */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Events</span>
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary.totalEvents}</div>
          <p className="text-xs text-slate-500 font-medium">Active & past organized events</p>
        </div>

        {/* Tickets Sold */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tickets Sold</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{summary.totalTicketsSold.toLocaleString()}</div>
          <p className="text-xs text-slate-500 font-medium">Confirmed bookings across events</p>
        </div>

        {/* Available Capacity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary.totalAvailableTickets.toLocaleString()}</div>
          <p className="text-xs text-slate-500 font-medium">Remaining seats ready for sale</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">₹{summary.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-500 font-medium">Gross ticket sales revenue</p>
        </div>

      </div>

      {/* Featured AI Event Insight Component */}
      {featuredAI && (
        <AIInsightCard insight={featuredAI} eventName={featuredAI.eventName} />
      )}

      {/* MY EVENTS Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">MY EVENTS</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live capacity management and performance summary</p>
          </div>
          <Link
            to="/organizer/events"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
          >
            <span>View All ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {events.map((evt) => (
              <div
                key={evt.id || evt._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/80 transition-colors"
              >
                
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {evt.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{evt.date} • {evt.venue}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{evt.name}</h3>
                </div>

                {/* Capacity Stats Breakdown */}
                <div className="grid grid-cols-4 gap-4 text-center text-xs font-semibold">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Capacity</span>
                    <span className="font-extrabold text-slate-800 text-sm">{evt.capacity}</span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-emerald-600 block text-[10px] uppercase">Sold</span>
                    <span className="font-extrabold text-emerald-700 text-sm">{evt.ticketsSold}</span>
                  </div>

                  <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-indigo-600 block text-[10px] uppercase">Available</span>
                    <span className="font-extrabold text-indigo-700 text-sm">{evt.availableTickets}</span>
                  </div>

                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-amber-600 block text-[10px] uppercase">Revenue</span>
                    <span className="font-extrabold text-amber-800 text-sm">₹{evt.revenue?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/organizer/events/${evt.id || evt._id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Stats</span>
                  </Link>

                  <Link
                    to={`/organizer/events/${evt.id || evt._id}/edit`}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            No events created yet. Click "+ Create Event" to get started!
          </div>
        )}

      </div>

    </div>
  );
};

export default OrganizerDashboard;
