import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Calendar } from 'lucide-react';

const UserProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold uppercase">
              Role: {role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1" /> Email Address
            </span>
            <span className="text-slate-900 font-bold block">{user?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Account Security
            </span>
            <span className="text-emerald-600 font-bold block">JWT Authenticated Session</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
