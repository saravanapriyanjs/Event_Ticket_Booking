import React from 'react';
import { Ticket, Cpu, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-bold text-xl mb-3">
              <Ticket className="w-6 h-6 text-brand-500" />
              <span>EventIQ</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Smart Event Ticket Booking & Capacity Management Platform powered by MongoDB atomic concurrency protection and Python AI demand forecasting intelligence.
            </p>
            <div className="mt-4 flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Concurrency Engine Active
              </span>
              <span className="flex items-center text-indigo-400">
                <Cpu className="w-3.5 h-3.5 mr-1" />
                AI ML Model v1.0
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">User Experience</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/events" className="hover:text-brand-400 transition-colors">Browse Events</a></li>
              <li><a href="/user/login" className="hover:text-brand-400 transition-colors">User Sign In</a></li>
              <li><a href="/user/bookings" className="hover:text-brand-400 transition-colors">Digital Ticket Wallet</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Organizer Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/organizer/login" className="hover:text-brand-400 transition-colors">Organizer Login</a></li>
              <li><a href="/organizer/events/create" className="hover:text-brand-400 transition-colors">Create Event</a></li>
              <li><a href="/organizer/analytics" className="hover:text-brand-400 transition-colors">Demand Analytics</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 EventIQ Platform. Hackathon Production Release.</p>
          <div className="flex items-center space-x-1 mt-2 md:mt-0 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Role-Based JWT Authorization & Atomic Capacity Locking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
