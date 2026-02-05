
import React, { useMemo } from 'react';
import { GasReading } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar
} from 'recharts';

interface DashboardProps {
  readings: GasReading[];
}

const Dashboard: React.FC<DashboardProps> = ({ readings }) => {
  const stats = useMemo(() => {
    if (readings.length < 2) return null;

    const first = readings[0];
    const last = readings[readings.length - 1];
    const totalDiff = last.value - first.value;
    const timeDiffMs = last.timestamp - first.timestamp;
    const days = timeDiffMs / (1000 * 60 * 60 * 24);
    
    // Last 30 days average
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentReadings = readings.filter(r => r.timestamp >= thirtyDaysAgo);
    let avgDaily = 0;
    if (recentReadings.length >= 2) {
      const rFirst = recentReadings[0];
      const rLast = recentReadings[recentReadings.length - 1];
      const rDays = (rLast.timestamp - rFirst.timestamp) / (1000 * 60 * 60 * 24);
      avgDaily = rDays > 0 ? (rLast.value - rFirst.value) / rDays : 0;
    } else {
      avgDaily = days > 0 ? totalDiff / days : 0;
    }

    return {
      currentReading: last.value,
      totalUsage: totalDiff,
      avgDaily,
      periodDays: Math.ceil(days),
      readingCount: readings.length
    };
  }, [readings]);

  const chartData = useMemo(() => {
    return readings.map(r => ({
      date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: r.value,
      timestamp: r.timestamp
    }));
  }, [readings]);

  // Daily consumption logic
  const consumptionData = useMemo(() => {
    const data = [];
    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1];
      const curr = readings[i];
      const diff = curr.value - prev.value;
      const hours = (curr.timestamp - prev.timestamp) / (1000 * 60 * 60);
      const days = hours / 24;
      
      // We normalize consumption per day
      data.push({
        date: new Date(curr.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        consumption: Number((diff / Math.max(days, 0.1)).toFixed(2))
      });
    }
    return data;
  }, [readings]);

  if (readings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-fire text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to GasTrack</h2>
        <p className="text-slate-500 max-w-sm mx-auto mb-8">
          Start tracking your heating gas usage. Take a photo of your meter to record your first reading.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Overview of your gas consumption</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-600">
            Last reading: {new Date(readings[readings.length - 1].timestamp).toLocaleDateString()}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Current Reading" 
          value={`${stats?.currentReading.toFixed(2) || readings[0].value.toFixed(2)}`} 
          unit="m³" 
          icon="fa-gauge-high"
          color="blue"
        />
        <StatCard 
          label="Total Consumption" 
          value={`${stats?.totalUsage.toFixed(2) || '0.00'}`} 
          unit="m³" 
          icon="fa-chart-area"
          color="indigo"
        />
        <StatCard 
          label="Average Usage" 
          value={`${stats?.avgDaily.toFixed(2) || '0.00'}`} 
          unit="m³/day" 
          icon="fa-fire-flame-simple"
          color="orange"
        />
        <StatCard 
          label="Readings" 
          value={`${readings.length}`} 
          unit="total" 
          icon="fa-list-check"
          color="emerald"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-500"></i>
            Meter Progression
          </h3>
          <div className="text-xs text-slate-400 font-medium">Cumulative m³</div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Consumption Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-droplet text-orange-500"></i>
            Daily Consumption Trend
          </h3>
          <div className="text-xs text-slate-400 font-medium">Normalized m³/day</div>
        </div>
        <div className="h-[250px] w-full">
          {consumptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="consumption" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <i className="fas fa-info-circle mb-2"></i>
              <p className="text-sm">Need at least 2 readings to calculate consumption</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: 'blue' | 'indigo' | 'orange' | 'emerald';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <i className={`fas ${icon} text-lg`}></i>
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-slate-400 text-xs font-semibold">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
