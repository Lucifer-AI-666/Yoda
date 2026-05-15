import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Globe, Shield, MessageSquare, Terminal, Menu, X, Wifi } from 'lucide-react';
import { ViewState } from './types';
import Dashboard from './Dashboard';
import UrlScanner from './components/UrlScanner';
import ApkInspector from './components/ApkInspector';
import ThreatIntelChat from './components/ThreatIntelChat';
import NetworkMonitor from './components/NetworkMonitor';
import { sentinel } from './services/SentinelService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Start the sentinel agent on app load
    sentinel.start();
    return () => sentinel.stop();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.URL_SCANNER: return <UrlScanner />;
      case ViewState.APK_INSPECTOR: return <ApkInspector />;
      case ViewState.THREAT_INTEL: return <ThreatIntelChat />;
      case ViewState.NETWORK_MONITOR: return <NetworkMonitor />;
      default: return <Dashboard />;
    }
  };

  const NavItem = ({ view, icon, label }: { view: ViewState; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        currentView === view
          ? 'bg-gradient-to-r from-cyan-900/50 to-transparent border-l-2 border-cyan-400 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Mobile Header */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyan-400" />
          <span className="text-xl font-bold text-white tracking-widest">TAUROS</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
              <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                <Terminal className="text-cyan-400 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-widest">TAUROS</h1>
                <p className="text-[10px] text-cyan-500 font-mono tracking-wider">SENTINEL EDITION</p>
              </div>
            </div>

            <nav className="space-y-2 flex-1">
              <NavItem view={ViewState.DASHBOARD} icon={<LayoutDashboard size={20} />} label="Overview" />
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Modules</p>
              </div>
              <NavItem view={ViewState.URL_SCANNER} icon={<Globe size={20} />} label="URL Scanner" />
              <NavItem view={ViewState.APK_INSPECTOR} icon={<Shield size={20} />} label="APK Forensics" />
              <NavItem view={ViewState.THREAT_INTEL} icon={<MessageSquare size={20} />} label="Threat Intel AI" />
              <NavItem view={ViewState.NETWORK_MONITOR} icon={<Wifi size={20} />} label="Network Monitor" />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">API Connection</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-mono text-white">
                    {process.env.API_KEY ? 'CONNECTED' : 'NO KEY'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentView === ViewState.DASHBOARD && 'System Dashboard'}
                  {currentView === ViewState.URL_SCANNER && 'URL Analysis'}
                  {currentView === ViewState.APK_INSPECTOR && 'APK Inspector'}
                  {currentView === ViewState.THREAT_INTEL && 'Threat Intelligence'}
                  {currentView === ViewState.NETWORK_MONITOR && 'Network Monitor'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {currentView === ViewState.DASHBOARD && 'Real-time security monitoring active.'}
                  {currentView === ViewState.URL_SCANNER && 'Deep scan and parameter extraction.'}
                  {currentView === ViewState.APK_INSPECTOR && 'Static analysis of Android packages.'}
                  {currentView === ViewState.THREAT_INTEL && 'Consult with the Neural Net.'}
                  {currentView === ViewState.NETWORK_MONITOR && 'Live packet inspection and firewall controls.'}
                </p>
              </div>
              <div className="hidden md:block text-xs font-mono text-slate-500">
                v3.2.1-STABLE
              </div>
            </header>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;