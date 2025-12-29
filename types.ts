export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  URL_SCANNER = 'URL_SCANNER',
  APK_INSPECTOR = 'APK_INSPECTOR',
  THREAT_INTEL = 'THREAT_INTEL'
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