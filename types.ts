import React from 'react';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  URL_SCANNER = 'URL_SCANNER',
  APK_INSPECTOR = 'APK_INSPECTOR',
  THREAT_INTEL = 'THREAT_INTEL',
  NETWORK_MONITOR = 'NETWORK_MONITOR',
  IFTTT_DEFENSE = 'IFTTT_DEFENSE'
}

export interface UrlScanResult {
  url: string;
  riskScore: number; // 0-100
  isMalicious: boolean;
  threatType: 'PHISHING' | 'MALWARE' | 'TRACKING' | 'SAFE' | 'UNKNOWN';
  analysis: string;
  detectedTrackingParams: string[];
}

export interface ApkAnalysisResult {
  packageName: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  permissionsIssues: string[];
  hiddenCapabilities: string[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export interface SentinelEvent {
  id: string;
  timestamp: Date;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'MALWARE_DETECTED' | 'TASK_EMBEDDED';
  source: string;
  description: string;
  actionTaken?: string;
  aiReasoning?: string;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  THREAT_MITIGATED = 'THREAT_MITIGATED',
  OFFLINE = 'OFFLINE'
}

export type OAuthRisk = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type OAuthStatus = 'ACTIVE' | 'REVOKED' | 'PENDING_REVOCATION';

export interface OAuthApp {
  id: string;
  name: string;
  vendor: string;
  scopes: string[];
  connectedUser: string;
  connectedSince: string;
  lastActivity: string;
  risk: OAuthRisk;
  status: OAuthStatus;
  isBlocklisted: boolean;
}

export interface ForwardingRule {
  id: string;
  user: string;
  sourceMailbox: string;
  destination: string;
  destinationDomain: string;
  createdAt: string;
  isExternal: boolean;
  isBlocked: boolean;
  triggeredBy: 'MANUAL' | 'IFTTT' | 'RULE' | 'API';
}

export interface DlpRule {
  id: string;
  name: string;
  classification: 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
  action: 'BLOCK' | 'ALERT' | 'QUARANTINE';
  targetPaths: string[];
  status: 'ACTIVE' | 'DISABLED';
  violationsToday: number;
}

export interface BlockedDomain {
  domain: string;
  category: 'IFTTT' | 'AUTOMATION' | 'PERSONAL_CLOUD' | 'C2';
  blockedAt: string;
  blockType: 'FIREWALL' | 'DNS' | 'PROXY';
  requestsBlocked: number;
}

export interface MfaStatus {
  service: string;
  enforced: boolean;
  usersCompliant: number;
  usersTotal: number;
  lastAudit: string;
}