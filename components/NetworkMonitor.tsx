import React, { useState, useEffect, useRef } from 'react';
import { Activity, Shield, Zap, Globe, Server, Cpu, Wifi } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

interface Packet {
  id: string;
  source: string;
  destination: string;
  protocol: string;
  size: number;
  status: 'ALLOWED' | 'BLOCKED' | 'FLAGGED';
  timestamp: string;
}

const NetworkMonitor: React.FC = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [trafficData, setTrafficData] = useState<{time: string, kbps: number}[]>([]);
  const [stats, setStats] = useState({
    totalPackets: 0,
    blocked: 0,
    activeConnections: 0,
    cpuLoad: 12
  });
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocols = ['TCP', 'UDP', 'HTTPS', 'SSH', 'FTP', 'DNS'];
    const ips = ['192.168.1.1', '10.0.0.5', '172.16.0.22', '8.8.8.8', '1.1.1.1', '192.168.0.44'];
    
    const interval = setInterval(() => {
      const newPacket: Packet = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        source: ips[Math.floor(Math.random() * ips.length)],
        destination: ips[Math.floor(Math.random() * ips.length)],
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        size: Math.floor(Math.random() * 1500) + 64,
        status: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'BLOCKED' : 'FLAGGED') : 'ALLOWED',
        timestamp: new Date().toLocaleTimeString()
      };

      setPackets(prev => [newPacket, ...prev].slice(0, 50));
      setStats(prev => ({
        totalPackets: prev.totalPackets + 1,
        blocked: prev.blocked + (newPacket.status === 'BLOCKED' ? 1 : 0),
        activeConnections: Math.floor(Math.random() * 20) + 40,
        cpuLoad: Math.floor(Math.random() * 15) + 10
      }));

      setTrafficData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), kbps: Math.floor(Math.random() * 500) + 200 }];
        return newData.slice(-20);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border-b-2 border-cyan-500/50">
          <div className="flex items-center gap-3">
            <Wifi className="text-cyan-400" size={20} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Packets / Sec</p>
              <p className="text-xl font-mono text-white">12.4</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border-b-2 border-emerald-500/50">
          <div className="flex items-center gap-3">
            <Server className="text-emerald-400" size={20} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Active Nodes</p>
              <p className="text-xl font-mono text-white">{stats.activeConnections}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border-b-2 border-red-500/50">
          <div className="flex items-center gap-3">
            <Shield className="text-red-400" size={20} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Threats Blocked</p>
              <p className="text-xl font-mono text-white">{stats.blocked}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border-b-2 border-amber-500/50">
          <div className="flex items-center gap-3">
            <Cpu className="text-amber-400" size={20} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">CPU Load</p>
              <p className="text-xl font-mono text-white">{stats.cpuLoad}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Traffic Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Activity className="text-cyan-400" size={18} />
              Live Throughput
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Real-time Feed</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorKbps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 1000]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="kbps" stroke="#06b6d4" fillOpacity={1} fill="url(#colorKbps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            System Controls
          </h3>
          <div className="space-y-3 flex-1">
            <button className="w-full p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Flush DNS Cache</p>
              <p className="text-[10px] text-slate-500">Clear all local resolution records</p>
            </button>
            <button className="w-full p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Reset Firewall</p>
              <p className="text-[10px] text-slate-500">Reload default security policies</p>
            </button>
            <button className="w-full p-3 rounded-lg bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 text-left transition-colors">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency Lockdown</p>
              <p className="text-[10px] text-red-500/70">Sever all external connections</p>
            </button>
          </div>
        </div>
      </div>

      {/* Packet Log */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
            <Globe className="text-blue-400" size={16} />
            Packet Inspection Log
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Buffer: {packets.length} / 50
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Packet ID</th>
                <th className="p-4 font-bold">Source</th>
                <th className="p-4 font-bold">Protocol</th>
                <th className="p-4 font-bold">Size</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px]">
              {packets.map((pkt) => (
                <tr key={pkt.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-500">{pkt.timestamp}</td>
                  <td className="p-4 text-cyan-400">{pkt.id}</td>
                  <td className="p-4 text-slate-300">{pkt.source}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                      {pkt.protocol}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{pkt.size} B</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      pkt.status === 'ALLOWED' ? 'text-emerald-500 bg-emerald-500/10' :
                      pkt.status === 'BLOCKED' ? 'text-red-500 bg-red-500/10' :
                      'text-amber-500 bg-amber-500/10'
                    }`}>
                      {pkt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NetworkMonitor;
