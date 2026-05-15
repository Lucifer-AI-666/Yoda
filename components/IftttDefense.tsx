import React, { useState, useEffect } from 'react';
import {
  ShieldOff, Link, Mail, Database, Globe, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Lock, Users, Zap, Eye, Ban, ShieldCheck
} from 'lucide-react';
import { analyzeOAuthApp } from '../services/geminiService';
import {
  OAuthApp, ForwardingRule, DlpRule, BlockedDomain, MfaStatus,
  OAuthRisk, OAuthStatus
} from '../types';

// ─── Mock data ─────────────────────────────────────────────────────────────

const INITIAL_OAUTH_APPS: OAuthApp[] = [
  {
    id: 'app-001', name: 'IFTTT', vendor: 'IFTTT Inc.',
    scopes: ['mail.read', 'mail.send', 'files.readwrite', 'calendar.read'],
    connectedUser: 'mario.rossi@azienda.it', connectedSince: '2024-11-03',
    lastActivity: '2026-05-11 08:14', risk: 'CRITICAL', status: 'ACTIVE', isBlocklisted: true
  },
  {
    id: 'app-002', name: 'Zapier', vendor: 'Zapier Inc.',
    scopes: ['mail.read', 'files.readwrite.all', 'sites.readwrite.all'],
    connectedUser: 'anna.bianchi@azienda.it', connectedSince: '2025-02-17',
    lastActivity: '2026-05-10 15:42', risk: 'CRITICAL', status: 'ACTIVE', isBlocklisted: true
  },
  {
    id: 'app-003', name: 'Power Automate (Personal)',
    vendor: 'Microsoft (personal tenant)',
    scopes: ['mail.readwrite', 'files.read'],
    connectedUser: 'luca.verdi@azienda.it', connectedSince: '2025-07-09',
    lastActivity: '2026-05-11 07:55', risk: 'HIGH', status: 'ACTIVE', isBlocklisted: false
  },
  {
    id: 'app-004', name: 'Dropbox (Personal)',
    vendor: 'Dropbox Inc.',
    scopes: ['files.readwrite'],
    connectedUser: 'giulia.neri@azienda.it', connectedSince: '2024-08-22',
    lastActivity: '2026-05-09 11:30', risk: 'HIGH', status: 'ACTIVE', isBlocklisted: false
  },
  {
    id: 'app-005', name: 'Slack (approved)',
    vendor: 'Slack Technologies',
    scopes: ['chat.write', 'files.read'],
    connectedUser: 'ALL USERS', connectedSince: '2023-01-15',
    lastActivity: '2026-05-11 09:01', risk: 'LOW', status: 'ACTIVE', isBlocklisted: false
  },
];

const INITIAL_FORWARDING_RULES: ForwardingRule[] = [
  {
    id: 'fwd-001', user: 'mario.rossi@azienda.it',
    sourceMailbox: 'mario.rossi@azienda.it',
    destination: 'mario.rossi.personal@gmail.com',
    destinationDomain: 'gmail.com', createdAt: '2026-05-10 22:31',
    isExternal: true, isBlocked: false, triggeredBy: 'IFTTT'
  },
  {
    id: 'fwd-002', user: 'anna.bianchi@azienda.it',
    sourceMailbox: 'vendite@azienda.it',
    destination: 'webhook@trigger.zapier.com',
    destinationDomain: 'zapier.com', createdAt: '2026-05-08 14:05',
    isExternal: true, isBlocked: false, triggeredBy: 'API'
  },
  {
    id: 'fwd-003', user: 'ceo@azienda.it',
    sourceMailbox: 'ceo@azienda.it',
    destination: 'ceo-backup@azienda.it',
    destinationDomain: 'azienda.it', createdAt: '2025-03-01 09:00',
    isExternal: false, isBlocked: false, triggeredBy: 'MANUAL'
  },
];

const INITIAL_DLP_RULES: DlpRule[] = [
  {
    id: 'dlp-001', name: 'Block CONFIDENTIAL to Personal Cloud',
    classification: 'CONFIDENTIAL', action: 'BLOCK',
    targetPaths: ['~/Dropbox/', '~/OneDrive Personal/', '~/Google Drive/'],
    status: 'ACTIVE', violationsToday: 3
  },
  {
    id: 'dlp-002', name: 'Quarantine INTERNAL on USB',
    classification: 'INTERNAL', action: 'QUARANTINE',
    targetPaths: ['/Volumes/USB*', 'D:\\', 'E:\\'],
    status: 'ACTIVE', violationsToday: 1
  },
  {
    id: 'dlp-003', name: 'Alert on PUBLIC bulk export',
    classification: 'PUBLIC', action: 'ALERT',
    targetPaths: ['*bulk-export*', '*.csv > 10MB'],
    status: 'DISABLED', violationsToday: 0
  },
];

const BLOCKED_DOMAINS: BlockedDomain[] = [
  { domain: 'ifttt.com', category: 'IFTTT', blockedAt: '2026-05-11 06:00', blockType: 'FIREWALL', requestsBlocked: 47 },
  { domain: 'maker.ifttt.com', category: 'IFTTT', blockedAt: '2026-05-11 06:00', blockType: 'DNS', requestsBlocked: 31 },
  { domain: 'connect.ifttt.com', category: 'IFTTT', blockedAt: '2026-05-11 06:00', blockType: 'DNS', requestsBlocked: 12 },
  { domain: 'hooks.zapier.com', category: 'AUTOMATION', blockedAt: '2026-05-11 06:30', blockType: 'FIREWALL', requestsBlocked: 9 },
  { domain: 'trigger.zapier.com', category: 'AUTOMATION', blockedAt: '2026-05-11 06:30', blockType: 'PROXY', requestsBlocked: 5 },
  { domain: 'dropbox.com', category: 'PERSONAL_CLOUD', blockedAt: '2026-05-11 07:00', blockType: 'PROXY', requestsBlocked: 22 },
];

const MFA_STATUSES: MfaStatus[] = [
  { service: 'Google Workspace', enforced: true, usersCompliant: 87, usersTotal: 89, lastAudit: '2026-05-11' },
  { service: 'Microsoft 365', enforced: true, usersCompliant: 82, usersTotal: 89, lastAudit: '2026-05-11' },
  { service: 'VPN (Cisco AnyConnect)', enforced: true, usersCompliant: 89, usersTotal: 89, lastAudit: '2026-05-10' },
  { service: 'GitHub Enterprise', enforced: false, usersCompliant: 41, usersTotal: 89, lastAudit: '2026-05-09' },
  { service: 'Azure DevOps', enforced: false, usersCompliant: 53, usersTotal: 89, lastAudit: '2026-05-09' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const RiskBadge: React.FC<{ risk: OAuthRisk }> = ({ risk }) => {
  const styles: Record<OAuthRisk, string> = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${styles[risk]}`}>
      {risk}
    </span>
  );
};

const StatusBadge: React.FC<{ status: OAuthStatus }> = ({ status }) => {
  const styles: Record<OAuthStatus, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400',
    REVOKED: 'bg-slate-500/10 text-slate-500',
    PENDING_REVOCATION: 'bg-amber-500/10 text-amber-400',
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────

const IftttDefense: React.FC = () => {
  const [oauthApps, setOauthApps] = useState<OAuthApp[]>(INITIAL_OAUTH_APPS);
  const [forwardingRules, setForwardingRules] = useState<ForwardingRule[]>(INITIAL_FORWARDING_RULES);
  const [dlpRules, setDlpRules] = useState<DlpRule[]>(INITIAL_DLP_RULES);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<{ appId: string; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'oauth' | 'forwarding' | 'dlp' | 'firewall' | 'mfa'>('oauth');

  const criticalApps = oauthApps.filter(a => a.risk === 'CRITICAL' && a.status === 'ACTIVE').length;
  const blockedFwdRules = forwardingRules.filter(r => r.isBlocked).length;
  const externalFwdRules = forwardingRules.filter(r => r.isExternal && !r.isBlocked).length;
  const totalRequestsBlocked = BLOCKED_DOMAINS.reduce((s, d) => s + d.requestsBlocked, 0);

  const revokeApp = (id: string) => {
    setOauthApps(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'REVOKED' as OAuthStatus } : a)
    );
  };

  const blockForwardingRule = (id: string) => {
    setForwardingRules(prev =>
      prev.map(r => r.id === id ? { ...r, isBlocked: true } : r)
    );
  };

  const toggleDlpRule = (id: string) => {
    setDlpRules(prev =>
      prev.map(r => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : r)
    );
  };

  const analyzeApp = async (app: OAuthApp) => {
    setAnalyzingId(app.id);
    setAiInsight(null);
    try {
      const result = await analyzeOAuthApp(app.name, app.scopes, app.vendor);
      setAiInsight({ appId: app.id, text: result });
    } catch {
      setAiInsight({ appId: app.id, text: 'Analysis unavailable. Check API key.' });
    } finally {
      setAnalyzingId(null);
    }
  };

  const tabs = [
    { key: 'oauth' as const, label: 'OAuth Audit', icon: <Link size={14} /> },
    { key: 'forwarding' as const, label: 'Email Forwarding', icon: <Mail size={14} /> },
    { key: 'dlp' as const, label: 'DLP Rules', icon: <Database size={14} /> },
    { key: 'firewall' as const, label: 'Firewall / DNS', icon: <Globe size={14} /> },
    { key: 'mfa' as const, label: 'MFA Enforcement', icon: <Lock size={14} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Top-3 Quick Actions Banner */}
      <div className="glass-panel p-6 rounded-xl border-t-2 border-amber-500/40">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={16} /> Top-3 Operazioni Prioritarie
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0"><Lock size={16} className="text-cyan-400" /></div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">1. MFA Ovunque</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Imponi MFA su VPN, Office 365 e Google Workspace. Mitiga phishing APT e protegge account da integrazioni IFTTT non autorizzate.
                </p>
                <span className={`mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded font-bold ${MFA_STATUSES.every(m => m.enforced) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {MFA_STATUSES.filter(m => m.enforced).length}/{MFA_STATUSES.length} SERVIZI ATTIVI
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg shrink-0"><ShieldOff size={16} className="text-red-400" /></div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">2. Blocca OAuth non autorizzato</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Impedisci a IFTTT/Zapier di leggere/scrivere su Drive, SharePoint ed Email aziendale. Revoca immediatamente le app nella blocklist.
                </p>
                <span className={`mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded font-bold ${criticalApps > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {criticalApps} APP CRITICHE ATTIVE
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg shrink-0"><Users size={16} className="text-purple-400" /></div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">3. Segmenta Accessi MSP</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Monitora e segmenta gli accessi esterni dei fornitori IT. L'infrastruttura deve sopravvivere anche se la rete MSP è compromessa da APT 10.
                </p>
                <span className="mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400">
                  REVISIONE MANUALE RICHIESTA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border-b-2 border-red-500/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">App OAuth Critiche</p>
          <p className="text-2xl font-mono text-red-400 mt-1">{criticalApps}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">attive nel tenant</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border-b-2 border-amber-500/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Inoltri Esterni</p>
          <p className="text-2xl font-mono text-amber-400 mt-1">{externalFwdRules}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">non ancora bloccati</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border-b-2 border-cyan-500/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Domini Bloccati</p>
          <p className="text-2xl font-mono text-cyan-400 mt-1">{BLOCKED_DOMAINS.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{totalRequestsBlocked} richieste intercettate</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border-b-2 border-emerald-500/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">DLP Violazioni</p>
          <p className="text-2xl font-mono text-emerald-400 mt-1">{dlpRules.reduce((s, r) => s + r.violationsToday, 0)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">oggi bloccate</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-900/10'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── OAuth Audit ─────────────────────────────────────────────────── */}
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  App di terze parti con accesso OAuth attivo al tenant. Le app in <span className="text-red-400">blocklist</span> devono essere revocate immediatamente.
                </p>
              </div>

              {aiInsight && (
                <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                  <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-2">AI Security Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiInsight.text}</p>
                </div>
              )}

              <div className="space-y-3">
                {oauthApps.map(app => (
                  <div key={app.id} className={`p-4 rounded-lg border transition-colors ${
                    app.isBlocklisted && app.status === 'ACTIVE'
                      ? 'bg-red-900/10 border-red-500/20'
                      : app.status === 'REVOKED'
                      ? 'bg-slate-900/50 border-slate-700/30 opacity-50'
                      : 'bg-slate-800/40 border-slate-700/50'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{app.name}</span>
                          <RiskBadge risk={app.risk} />
                          <StatusBadge status={app.status} />
                          {app.isBlocklisted && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-500/30 font-bold">BLOCKLISTED</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{app.vendor} · {app.connectedUser} · Ultima attività: {app.lastActivity}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.scopes.map(scope => (
                            <span key={scope} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 font-mono">{scope}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {app.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => analyzeApp(app)}
                              disabled={analyzingId === app.id}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {analyzingId === app.id
                                ? <RefreshCw size={12} className="animate-spin" />
                                : <Eye size={12} />
                              }
                              Analizza
                            </button>
                            <button
                              onClick={() => revokeApp(app.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-400 text-xs border border-red-500/30 transition-colors flex items-center gap-1.5"
                            >
                              <Ban size={12} /> Revoca
                            </button>
                          </>
                        )}
                        {app.status === 'REVOKED' && (
                          <span className="text-xs text-slate-500 flex items-center gap-1"><XCircle size={12} /> Revocato</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Email Forwarding ────────────────────────────────────────────── */}
          {activeTab === 'forwarding' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Regole di inoltro automatico rilevate. Le regole verso domini <span className="text-red-400">esterni</span> create da IFTTT/API sono vettori di data exfiltration.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <th className="pb-3 pr-4">Utente</th>
                      <th className="pb-3 pr-4">Destinazione</th>
                      <th className="pb-3 pr-4">Creato</th>
                      <th className="pb-3 pr-4">Trigger</th>
                      <th className="pb-3 pr-4">Stato</th>
                      <th className="pb-3">Azione</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {forwardingRules.map(rule => (
                      <tr key={rule.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 pr-4 font-mono text-slate-300">{rule.user}</td>
                        <td className="py-3 pr-4">
                          <span className={`font-mono ${rule.isExternal ? 'text-amber-400' : 'text-slate-400'}`}>
                            {rule.destination}
                          </span>
                          {rule.isExternal && <span className="ml-1 text-[9px] text-amber-500 uppercase">(esterno)</span>}
                        </td>
                        <td className="py-3 pr-4 text-slate-500 font-mono text-[10px]">{rule.createdAt}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            rule.triggeredBy === 'IFTTT' ? 'bg-red-500/10 text-red-400' :
                            rule.triggeredBy === 'API' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-slate-700 text-slate-400'
                          }`}>{rule.triggeredBy}</span>
                        </td>
                        <td className="py-3 pr-4">
                          {rule.isBlocked
                            ? <span className="text-[9px] text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Bloccata</span>
                            : <span className="text-[9px] text-amber-400 flex items-center gap-1"><AlertTriangle size={10} /> Attiva</span>
                          }
                        </td>
                        <td className="py-3">
                          {!rule.isBlocked && rule.isExternal && (
                            <button
                              onClick={() => blockForwardingRule(rule.id)}
                              className="px-2.5 py-1 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 text-[10px] border border-red-500/20 transition-colors flex items-center gap-1"
                            >
                              <Ban size={10} /> Blocca
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-[11px] text-slate-400 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                Per bloccare l'inoltro automatico in modo definitivo, configura il <span className="text-cyan-400 mx-1">Transport Rule</span> su Exchange/Gmail che rifiuta qualsiasi regola di forwarding verso domini non nella allowlist aziendale.
              </div>
            </div>
          )}

          {/* ── DLP Rules ───────────────────────────────────────────────────── */}
          {activeTab === 'dlp' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Regole DLP endpoint attive. Impediscono la copia di dati classificati su cloud personali sincronizzati tramite IFTTT/Dropbox.
              </p>
              <div className="space-y-3">
                {dlpRules.map(rule => (
                  <div key={rule.id} className={`p-4 rounded-lg border ${rule.status === 'ACTIVE' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-900/40 border-slate-800/30 opacity-60'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{rule.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                            rule.classification === 'CONFIDENTIAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            rule.classification === 'INTERNAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}>{rule.classification}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            rule.action === 'BLOCK' ? 'bg-red-900/20 text-red-400' :
                            rule.action === 'QUARANTINE' ? 'bg-amber-900/20 text-amber-400' :
                            'bg-blue-900/20 text-blue-400'
                          }`}>{rule.action}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rule.targetPaths.map(p => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 font-mono">{p}</span>
                          ))}
                        </div>
                        {rule.violationsToday > 0 && (
                          <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                            <AlertTriangle size={10} /> {rule.violationsToday} violazioni bloccate oggi
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleDlpRule(rule.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          rule.status === 'ACTIVE'
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            : 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {rule.status === 'ACTIVE' ? <><XCircle size={12} /> Disabilita</> : <><CheckCircle size={12} /> Abilita</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Firewall / DNS ──────────────────────────────────────────────── */}
          {activeTab === 'firewall' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Domini bloccati a livello di firewall, DNS e proxy. Taglia i canali C2 basati su IFTTT Webhook e i servizi di automazione non approvati.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <th className="pb-3 pr-4">Dominio</th>
                      <th className="pb-3 pr-4">Categoria</th>
                      <th className="pb-3 pr-4">Tipo blocco</th>
                      <th className="pb-3 pr-4">Bloccato il</th>
                      <th className="pb-3">Richieste bloccate</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {BLOCKED_DOMAINS.map(d => (
                      <tr key={d.domain} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 pr-4 text-cyan-400">{d.domain}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            d.category === 'IFTTT' ? 'bg-red-500/10 text-red-400' :
                            d.category === 'AUTOMATION' ? 'bg-orange-500/10 text-orange-400' :
                            d.category === 'C2' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>{d.category}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{d.blockType}</span>
                        </td>
                        <td className="py-3 pr-4 text-slate-500 text-[10px]">{d.blockedAt}</td>
                        <td className="py-3">
                          <span className="text-emerald-400 font-bold">{d.requestsBlocked}</span>
                          <span className="text-slate-500 ml-1">bloccate</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                Blocca anche <span className="text-cyan-400 mx-0.5 font-mono">*.ifttt.com</span>, <span className="text-cyan-400 mx-0.5 font-mono">*.zapier.com</span> e <span className="text-cyan-400 mx-0.5 font-mono">*.make.com</span> a livello DNS e proxy per coprire tutti i sottodomini e gli endpoint Webhook.
              </div>
            </div>
          )}

          {/* ── MFA Enforcement ─────────────────────────────────────────────── */}
          {activeTab === 'mfa' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Stato dell'autenticazione multi-fattore per i servizi critici. MFA riduce drasticamente il rischio che credenziali compromesse vengano usate per autorizzare app IFTTT.
              </p>
              <div className="space-y-3">
                {MFA_STATUSES.map(mfa => {
                  const pct = Math.round((mfa.usersCompliant / mfa.usersTotal) * 100);
                  return (
                    <div key={mfa.service} className={`p-4 rounded-lg border ${mfa.enforced ? 'bg-emerald-900/5 border-emerald-500/20' : 'bg-red-900/5 border-red-500/20'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {mfa.enforced
                              ? <CheckCircle size={14} className="text-emerald-400" />
                              : <XCircle size={14} className="text-red-400" />
                            }
                            <span className="text-sm font-semibold text-white">{mfa.service}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${mfa.enforced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {mfa.enforced ? 'ENFORCED' : 'NOT ENFORCED'}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Conformità utenti</span>
                              <span className={pct === 100 ? 'text-emerald-400' : pct >= 80 ? 'text-amber-400' : 'text-red-400'}>
                                {mfa.usersCompliant}/{mfa.usersTotal} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-500">Ultimo audit</p>
                          <p className="text-[10px] text-slate-400 font-mono">{mfa.lastAudit}</p>
                          {!mfa.enforced && (
                            <button className="mt-2 px-3 py-1.5 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 text-xs border border-amber-500/20 transition-colors flex items-center gap-1">
                              <Lock size={10} /> Enforce ora
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default IftttDefense;
