import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Activity, Globe, Lock, Cpu, Terminal, Zap, ShieldAlert, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { sentinel } from './services/SentinelService';
import { SentinelEvent, AgentStatus } from './types';

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
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(sentinel.getStatus());
  const [sentinelLogs, setSentinelLogs] = useState<SentinelEvent[]>(sentinel.getLogs());

  useEffect(() => {
    const unsubStatus = sentinel.onStatusChange(setAgentStatus);
    const unsubEvents = sentinel.onEvent((event) => {
      setSentinelLogs(prev => [event, ...prev].slice(0, 50));
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, []);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.IDLE: return 'text-emerald-400';
      case AgentStatus.SCANNING: return 'text-cyan-400';
      case AgentStatus.ANALYZING: return 'text-amber-400';
      case AgentStatus.THREAT_MITIGATED: return 'text-red-400';
      default: return 'text-slate-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'MALWARE_DETECTED': return <ShieldAlert className="text-red-500" size={14} />;
      case 'TASK_EMBEDDED': return <Zap className="text-amber-500" size={14} />;
      case 'CRITICAL': return <AlertTriangle className="text-red-400" size={14} />;
      default: return <Search className="text-cyan-500" size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Agent Control Panel */}
      <div className="glass-panel p-6 rounded-xl border-t-2 border-cyan-500/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-slate-800 border ${agentStatus !== AgentStatus.OFFLINE ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-700'}`}>
              <Cpu className={`w-6 h-6 ${agentStatus !== AgentStatus.OFFLINE ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Sentinel AI Agent
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">Autonomous</span>
              </h3>
              <p className={`text-sm font-mono ${getStatusColor(agentStatus)}`}>
                STATUS: {agentStatus}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => sentinel.start()}
              disabled={agentStatus !== AgentStatus.OFFLINE}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap size={16} /> Deploy Agent
            </button>
            <button 
              onClick={() => sentinel.stop()}
              disabled={agentStatus === AgentStatus.OFFLINE}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="System Integrity" value={agentStatus === AgentStatus.THREAT_MITIGATED ? 'RECOVERING' : 'SECURE'} icon={<ShieldCheck size={24} />} color="#10b981" />
        <StatCard title="Threats Blocked" value={(142 + sentinelLogs.filter(l => l.type === 'MALWARE_DETECTED').length).toString()} icon={<AlertTriangle size={24} />} color="#ef4444" />
        <StatCard title="AI Reasoning Tasks" value={sentinelLogs.length.toString()} icon={<Terminal size={24} />} color="#3b82f6" />
        <StatCard title="Agent Uptime" value={agentStatus === AgentStatus.OFFLINE ? '0:00' : 'ACTIVE'} icon={<Activity size={24} />} color="#8b5cf6" />
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

        {/* Agent Activity Feed */}
        <div className="glass-panel p-6 rounded-xl flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="text-cyan-400" size={20} />
            Agent Reasoning Feed
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {sentinelLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                <Search size={48} className="mb-2 opacity-20" />
                <p className="text-sm">Agent idle. Deploy to begin autonomous monitoring.</p>
              </div>
            )}
            {sentinelLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2 animate-slide-in">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getEventIcon(log.type)}
                    <span className="text-[10px] font-mono text-slate-500">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    log.type === 'MALWARE_DETECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    log.type === 'TASK_EMBEDDED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {log.type}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{log.description}</p>
                <div className="pt-2 border-t border-slate-700/50">
                  <p className="text-[10px] text-cyan-400 font-mono">ACTION: {log.actionTaken}</p>
                  <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">Reasoning: {log.aiReasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">System Event Stream</h3>
        <div className="font-mono text-xs md:text-sm text-slate-400 space-y-2 max-h-48 overflow-y-auto">
          <div className="flex gap-4">
            <span className="text-slate-500">[10:42:15]</span>
            <span className="text-emerald-400">INFO</span>
            <span>System initialization complete. Tauros Engine v3.2.1 active.</span>
          </div>
          {sentinelLogs.map(log => (
            <div key={log.id} className="flex gap-4">
              <span className="text-slate-500">[{log.timestamp.toLocaleTimeString()}]</span>
              <span className={log.type === 'MALWARE_DETECTED' ? 'text-red-400' : 'text-cyan-400'}>{log.type.substring(0, 4)}</span>
              <span>{log.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;