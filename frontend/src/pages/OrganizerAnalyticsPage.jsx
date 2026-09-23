import React, { useEffect, useState } from 'react';
import api from '../services/api';
import AIInsightCard from '../components/AIInsightCard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Sparkles, TrendingUp, DollarSign, Ticket, Users, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const OrganizerAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/organizer/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const summary = analytics?.summary || { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, totalAvailable: 0 };
  const charts = analytics?.charts || {};
  const featuredAI = analytics?.featuredAIInsight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>REAL-TIME AI DEMAND FORECASTING ENGINE</span>
        </div>
        <h1 className="text-3xl font-extrabold">Event Intelligence & Analytics</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Visualizing booking velocity trends, revenue distribution, capacity risks, and machine learning sell-out forecasts.
        </p>
      </div>

      {/* AI Featured Spotlight Card */}
      {featuredAI && (
        <AIInsightCard insight={featuredAI} eventName={featuredAI.eventName} />
      )}

      {/* 5 Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Tickets Sold Over Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>1. Tickets Sold Over Time</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Cumulative Sales</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.ticketsSoldOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none' }}
                />
                <Line type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Revenue by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-emerald-600" />
              <span>2. Revenue Distribution by Category</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Gross Sales</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.revenueByCategory || []}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ category, revenue }) => `${category}: ₹${revenue}`}
                >
                  {(charts.revenueByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Capacity Utilization vs Remaining (Stacked Bar) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>3. Capacity Utilization vs Remaining Seats across Events</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Event Comparison</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.capacityComparison || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', color: '#fff', border: 'none' }}
                />
                <Legend />
                <Bar dataKey="ticketsSold" name="Tickets Sold" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="availableTickets" name="Available Capacity" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrganizerAnalyticsPage;
