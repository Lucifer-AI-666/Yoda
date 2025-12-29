import React from 'react';
import { ShieldCheck, AlertTriangle, Activity, Globe, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

const MOCK_ACTIVITY_DATA = [
  { time: '00:00', threats: 2, traffic: 120 },
  { time: '04:00', threats: 1, traffic: 80 },
  { time: '08:00', threats: 5, traffic: 450 },
  { time: '12:00', threats: 12, traffic: 890 },
  { time: '16:00', threats: 8, traffic: 670 },
  { time: '20:00', threats: 15, traffic: 540 },
  { time: '24:00', threats: 4, traffic: 230 },
];

const MOCK_THREAT_TYPES = [
  { name: 'Phishing', count: 45 },
  { name: 'Malware', count: 23 },
  { name: 'Tracking', count: 89 },
  { name: 'Injection', count: 12 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="glass-panel p-6 rounded-xl flex items-center justify-between border-l-4" style={{ borderColor: color }}>
    <div>
      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg bg-opacity-10 bg-[${color}] text-[${color}]`} style={{ backgroundColor: `${color}20`, color: color }}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="System Status" value="SECURE" icon={<ShieldCheck size={24} />} color="#10b981" />
        <StatCard title="Threats Blocked" value="142" icon={<AlertTriangle size={24} />} color="#ef4444" />
        <StatCard title="URLs Scanned" value="1,284" icon={<Globe size={24} />} color="#3b82f6" />
        <StatCard title="Active Protocols" value="8" icon={<Activity size={24} />} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="text-cyan-400" size={20} />
            Network Traffic Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="traffic" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Lock className="text-amber-400" size={20} />
            Detected Vectors
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_THREAT_TYPES} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Recent System Logs</h3>
        <div className="font-mono text-xs md:text-sm text-slate-400 space-y-2 max-h-48 overflow-y-auto">
          <div className="flex gap-4">
            <span className="text-slate-500">[10:42:15]</span>
            <span className="text-emerald-400">INFO</span>
            <span>System initialization complete. Tauros Engine v3.2.1 active.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">[10:43:02]</span>
            <span className="text-cyan-400">NET</span>
            <span>Established secure connection to telemetry servers.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">[10:45:11]</span>
            <span className="text-amber-400">WARN</span>
            <span>Heuristic mismatch detected in packet header ID: 0x4F2A.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-slate-500">[10:48:33]</span>
            <span className="text-red-400">BLCK</span>
            <span>Connection attempt from suspicious IP 192.168.0.44 blocked.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;