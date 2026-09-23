import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Cpu, ShieldCheck, Sparkles, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';

const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data.slice(0, 3));
      } catch (err) {
        console.error('Failed fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 border-b border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-brand-400 border border-slate-700 text-xs font-semibold mb-6 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-POWERED EVENT DEMAND & CAPACITY PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Book Smarter. Manage Better. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">
              Predict Demand in Real-Time.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            EventIQ combines a concurrency-safe MongoDB ticket engine with Python machine learning to prevent overbooking and forecast event sell-out velocity.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/user/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl hover:shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Book Tickets Now</span>
            </Link>

            <Link
              to="/organizer/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Organizer AI Portal</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div>
              <div className="text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Atomic Concurrency Safe</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand-400">&lt; 50ms</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Real-Time Socket Sync</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-400">Scikit-Learn</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">ML Demand Forecast</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-400">Digital QR</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Instant Verification</div>
            </div>
          </div>

        </div>
      </section>

      {/* Novelty Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Why EventIQ Stands Out</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Unlike simple CRUD ticket websites, EventIQ integrates deep technical architectural safeguards and machine learning analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Concurrency-Safe Bookings</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Guaranteed atomic capacity checks using MongoDB conditional updates (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">availableTickets &gt;= requested</code>) to prevent race conditions during peak traffic.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI Demand Intelligence</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              FastAPI Python ML model predicting ticket booking velocity, risk of capacity exhaustion, and estimated sell-out timeframe.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Live Socket Synchronization</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instant live capacity counter broadcasts so users and organizers see remaining tickets update in real-time without refreshing.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Events</h2>
            <p className="text-slate-500 text-sm mt-1">Explore upcoming tech, concerts, and workshops</p>
          </div>
          <Link
            to="/events"
            className="text-brand-600 hover:text-brand-700 font-bold text-sm flex items-center space-x-1"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard key={evt._id || evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
            No events created yet. Log in as an Organizer to create the first event!
          </div>
        )}
      </section>

    </div>
  );
};

export default LandingPage;
