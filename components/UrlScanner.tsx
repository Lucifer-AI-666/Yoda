import React, { useState } from 'react';
import { Search, AlertOctagon, CheckCircle, HelpCircle, ArrowRight, X } from 'lucide-react';
import { scanUrl } from '../services/geminiService';
import { UrlScanResult } from '../types';

const UrlScanner: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    try {
      const data = await scanUrl(url);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 70) return 'text-amber-400';
    return 'text-red-500';
  };

  const getRiskBg = (score: number) => {
    if (score < 30) return 'bg-emerald-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">URL Threat Vector Analysis</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Analyze malicious domains, phishing links, and tracking parameters using Tauros AI heuristics.
        </p>
      </div>

      <form onSubmit={handleScan} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter suspicious URL (e.g., http://suspicious-site.com?track=id)"
            className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-slate-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Scanning...</span>
            ) : (
              <>
                Scan <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-700 animate-slide-up">
          <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-slate-400 text-xs font-mono uppercase mb-1">Target</div>
              <div className="text-white font-mono break-all">{result.url}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase">Risk Score</div>
                <div className={`text-2xl font-bold ${getRiskColor(result.riskScore)}`}>
                  {result.riskScore}/100
                </div>
              </div>
              <div className={`h-12 w-1.5 rounded-full ${getRiskBg(result.riskScore)}`}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Analysis Summary</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {result.analysis}
              </p>
              
              <div className="flex gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.isMalicious ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'}`}>
                  {result.threatType}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Tracking Parameters</h3>
              {result.detectedTrackingParams.length > 0 ? (
                <div className="space-y-2">
                  {result.detectedTrackingParams.map((param, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700">
                      <code className="text-xs text-red-300">{param}</code>
                      <X size={14} className="text-red-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-sm p-3 bg-emerald-500/5 rounded border border-emerald-500/10">
                  <CheckCircle size={16} />
                  No tracking parameters detected
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlScanner;