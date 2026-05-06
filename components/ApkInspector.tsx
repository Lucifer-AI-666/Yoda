import React, { useState, useRef } from 'react';
import { FileCode, AlertTriangle, ShieldAlert, Terminal, Eye, Lock, Upload, File as FileIcon, Loader2, RefreshCw } from 'lucide-react';
import { analyzeApkManifest } from '../services/geminiService';
import { ApkAnalysisResult } from '../types';

interface ApkMetadata {
  package: string;
  versionName: string;
  versionCode: string;
  minSdkVersion: string;
  targetSdkVersion: string;
}

const ApkInspector: React.FC = () => {
  const [manifestText, setManifestText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ApkAnalysisResult | null>(null);
  const [metadata, setMetadata] = useState<ApkMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!manifestText.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const data = await analyzeApkManifest(manifestText);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const processApkFile = async (file: File) => {
    setParsing(true);
    try {
      // Dynamic import to avoid load issues if the library isn't cached
      const { default: AppInfoParser } = await import('app-info-parser');
      const parser = new AppInfoParser(file);
      const res = await parser.parse();

      let output = `=== APK ANALYSIS REPORT ===\n`;
      output += `Package: ${res.package || 'N/A'}\n`;
      output += `Version Name: ${res.versionName || 'N/A'}\n`;
      output += `Version Code: ${res.versionCode || 'N/A'}\n`;
      output += `Min SDK: ${res.minSdkVersion || 'N/A'}\n`;
      output += `Target SDK: ${res.targetSdkVersion || 'N/A'}\n\n`;

      output += `[PERMISSIONS]\n`;
      if (res.usesPermissions && Array.isArray(res.usesPermissions)) {
        output += res.usesPermissions.map((p: any) => {
          return typeof p === 'string' ? `- ${p}` : `- ${p.name || 'Unknown'}`;
        }).join('\n');
      } else {
        output += "No explicit permissions found.\n";
      }
      output += `\n\n`;

      if (res.application) {
        if (res.application.activities && res.application.activities.length > 0) {
          output += `[ACTIVITIES]\n`;
          output += res.application.activities.map((a: any) => `- ${a.name || 'Unknown'}`).join('\n');
          output += `\n\n`;
        }
        
        if (res.application.services && res.application.services.length > 0) {
          output += `[SERVICES]\n`;
          output += res.application.services.map((s: any) => `- ${s.name || 'Unknown'}`).join('\n');
          output += `\n\n`;
        }

        if (res.application.receivers && res.application.receivers.length > 0) {
          output += `[RECEIVERS]\n`;
          output += res.application.receivers.map((r: any) => `- ${r.name || 'Unknown'}`).join('\n');
          output += `\n\n`;
        }
      }

      setMetadata({
        package: res.package || 'N/A',
        versionName: res.versionName || 'N/A',
        versionCode: res.versionCode?.toString() || 'N/A',
        minSdkVersion: res.minSdkVersion || 'N/A',
        targetSdkVersion: res.targetSdkVersion || 'N/A'
      });

      setManifestText(output);
    } catch (error) {
      console.error("APK Parsing Error:", error);
      alert("Could not parse APK file. Please ensure it is a valid Android Package.");
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processApkFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.apk')) {
      processApkFile(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-4 flex flex-col h-full">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">APK Forensics</h2>
          <p className="text-slate-400 text-sm">
            Upload an APK file or paste manifest XML data to analyze structural risks.
          </p>
        </div>

        {/* Upload Zone */}
        <div 
          onClick={() => !parsing && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group relative overflow-hidden
            ${parsing ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-800'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".apk" 
            className="hidden" 
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            {parsing ? (
              <>
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <p className="text-sm font-medium text-cyan-300">Decompiling Manifest...</p>
                <p className="text-xs text-slate-500 mt-1">Extracting AXML data</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-cyan-900/50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white">
                  Click to Upload APK
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or drag and drop file here
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 relative group">
          <div className="absolute top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm p-2 flex justify-between items-center border-b border-slate-700 rounded-t-xl z-10">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <FileIcon size={12} />
              MANIFEST SOURCE
            </span>
            {manifestText && (
              <button 
                onClick={() => {
                  setManifestText('');
                  setMetadata(null);
                  setResult(null);
                }}
                className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 uppercase tracking-wider"
              >
                <RefreshCw size={10} /> Clear
              </button>
            )}
          </div>
          <textarea
            className="w-full h-96 lg:h-full bg-slate-900/50 border border-slate-700 rounded-xl pt-12 p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-500 resize-none custom-scrollbar leading-relaxed"
            placeholder="Upload an APK or paste manifest XML here (e.g., <manifest ...> ... </manifest>)"
            value={manifestText}
            onChange={(e) => setManifestText(e.target.value)}
          />
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={handleAnalyze}
              disabled={loading || parsing || !manifestText}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Terminal size={16} /> Analyze Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {metadata && (
          <div className="glass-panel p-6 rounded-xl border border-cyan-500/20 animate-fade-in">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <FileIcon className="text-cyan-400" size={18} />
              APK Metadata
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {/* Package Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 border-b border-cyan-900/30 pb-2">
                  <FileIcon size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Package Identity</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Package Name</p>
                    <p className="text-sm font-mono text-cyan-100 break-all">{metadata.package}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Version</p>
                    <p className="text-sm font-mono text-white">{metadata.versionName} ({metadata.versionCode})</p>
                  </div>
                </div>
              </div>

              {/* SDK Requirements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-amber-900/30 pb-2">
                  <ShieldAlert size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">SDK Requirements</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Minimum SDK Version</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono text-white">{metadata.minSdkVersion}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        API Level
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Target SDK Version</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono text-white">{metadata.targetSdkVersion}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        API Level
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result ? (
          <div className="animate-fade-in space-y-6">
            {/* Header Card */}
            <div className={`glass-panel p-6 rounded-xl border-l-4 ${result.riskLevel === 'CRITICAL' ? 'border-red-500' : result.riskLevel === 'HIGH' ? 'border-amber-500' : 'border-emerald-500'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Package Analysis</h3>
                  <div className="text-xl md:text-2xl font-mono text-white mt-1 break-all">{result.packageName}</div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm shrink-0 ml-4 ${result.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {result.riskLevel} RISK
                </div>
              </div>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed border-t border-slate-700/50 pt-4">
                {result.summary}
              </p>
            </div>

            {/* Permissions */}
            <div className="glass-panel p-6 rounded-xl">
              <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
                <ShieldAlert className="text-amber-400" size={18} />
                Critical Permissions
              </h4>
              <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {result.permissionsIssues.map((perm, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded border border-slate-700/50">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="font-mono break-all">{perm}</span>
                  </li>
                ))}
                {result.permissionsIssues.length === 0 && (
                  <li className="text-slate-500 italic text-sm">No high-risk permissions identified.</li>
                )}
              </ul>
            </div>

            {/* Hidden Capabilities */}
            <div className="glass-panel p-6 rounded-xl">
              <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Eye className="text-cyan-400" size={18} />
                Hidden Capabilities
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {result.hiddenCapabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-cyan-300 border border-cyan-900/30 bg-cyan-950/30 p-2 rounded">
                    <Lock size={12} className="shrink-0" />
                    <span className="truncate">{cap}</span>
                  </div>
                ))}
                 {result.hiddenCapabilities.length === 0 && (
                  <div className="text-slate-500 italic text-sm">No hidden capabilities detected.</div>
                )}
              </div>
            </div>
          </div>
        ) : !metadata ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 glass-panel rounded-xl border-dashed border-2 border-slate-800 p-12">
            <FileCode size={64} className="mb-4 opacity-50" />
            <p className="text-center font-medium text-lg">Awaiting APK Upload</p>
            <p className="text-center text-sm mt-2 max-w-xs text-slate-500">
              Upload an APK file to extract its manifest and begin the AI security assessment.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 glass-panel rounded-xl border-dashed border-2 border-slate-800 p-12">
            <Loader2 size={48} className="mb-4 opacity-50 animate-spin text-cyan-500" />
            <p className="text-center font-medium text-lg text-slate-400">Ready for Analysis</p>
            <p className="text-center text-sm mt-2 max-w-xs text-slate-500">
              Click "Analyze Data" to start the deep security scan on the extracted manifest.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApkInspector;