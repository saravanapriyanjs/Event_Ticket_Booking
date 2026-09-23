import React from 'react';
import { Sparkles, AlertTriangle, TrendingUp, Clock, ShieldAlert, Cpu } from 'lucide-react';

const AIInsightCard = ({ insight, eventName }) => {
  if (!insight) return null;

  const demandLevel = insight.demand_level || 'MEDIUM';
  const capacityRisk = insight.capacity_risk || 'MEDIUM';
  const predictedDemand = insight.predicted_additional_demand || 0;
  const utilization = insight.current_capacity_utilization || '0%';
  const selloutDays = insight.estimated_sellout_days || 'N/A';
  const recommendation = insight.recommendation || 'Maintain standard monitoring.';
  const source = insight.source || 'trained_ml_model';

  const getBadgeColor = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg tracking-tight flex items-center space-x-2">
              <span>AI EVENT INSIGHT</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">{eventName || insight.eventName || 'Event Analytics'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
          <Cpu className="w-3.5 h-3.5" />
          <span>{source === 'trained_ml_model' ? 'Scikit-Learn ML' : 'Rule Engine'}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        
        {/* Current Demand */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Current Demand</span>
          <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(demandLevel)}`}>
            {demandLevel}
          </span>
        </div>

        {/* Current Capacity Utilization */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Current Capacity</span>
          <span className="text-xl font-extrabold text-white">{utilization}</span>
        </div>

        {/* Predicted Demand */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Predicted Addl. Demand</span>
          <span className="text-xl font-extrabold text-brand-400 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-brand-400" />
            {predictedDemand} tickets
          </span>
        </div>

        {/* Capacity Risk */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Capacity Risk</span>
          <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(capacityRisk)}`}>
            {capacityRisk}
          </span>
        </div>

        {/* Expected Sell-Out */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 col-span-2 md:col-span-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Expected Sell-Out Period</span>
          <span className="text-sm font-bold text-amber-300 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-amber-400" />
            {selloutDays}
          </span>
        </div>

      </div>

      {/* Actionable AI Recommendation */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-0.5">AI Recommendation</span>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      </div>

    </div>
  );
};

export default AIInsightCard;
