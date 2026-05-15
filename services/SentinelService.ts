import { analyzeSystemEvent } from './geminiService';
import { SentinelEvent, AgentStatus } from '../types';

type SentinelCallback = (event: SentinelEvent) => void;
type StatusCallback = (status: AgentStatus) => void;

class SentinelService {
  private static instance: SentinelService;
  private intervalId: NodeJS.Timeout | null = null;
  private onEventCallbacks: SentinelCallback[] = [];
  private onStatusCallbacks: StatusCallback[] = [];
  private status: AgentStatus = AgentStatus.OFFLINE;
  private logs: SentinelEvent[] = [];

  private constructor() {}

  public static getInstance(): SentinelService {
    if (!SentinelService.instance) {
      SentinelService.instance = new SentinelService();
    }
    return SentinelService.instance;
  }

  public start() {
    if (this.intervalId) return;
    this.updateStatus(AgentStatus.IDLE);
    
    // Simulate background "system" activity
    this.intervalId = setInterval(() => {
      this.performScan();
    }, 15000); // Scan every 15 seconds
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateStatus(AgentStatus.OFFLINE);
  }

  private async performScan() {
    this.updateStatus(AgentStatus.SCANNING);
    
    // Generate a random "system event" to analyze
    const events = [
      "New process 'svchost.exe' started from unusual directory /tmp/bin",
      "Encrypted outbound traffic detected to IP 45.33.22.11 on port 4444",
      "Attempt to modify system registry key HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      "User 'admin' logged in from a new geographic location: Moscow, RU",
      "File 'invoice_scan.pdf.exe' downloaded to Downloads folder",
      "High CPU usage detected in background task 'SystemUpdate.exe'",
      "Multiple failed login attempts detected on SSH port 22",
      "Hidden task 'CleanUp' scheduled to run at 3:00 AM daily",
      "New browser extension 'AdBlocker Pro' installed with permission to read all site data",
      // IFTTT / Shadow IT specific events
      "OAuth token granted to 'IFTTT' app with scopes: mail.read, files.readwrite by user mario.rossi@azienda.it",
      "Outbound HTTPS request to maker.ifttt.com/trigger/email_forward/with/key/abc123 detected",
      "Email forwarding rule created: mario.rossi@azienda.it -> mario.rossi.personal@gmail.com via IFTTT Applet",
      "File 'Contratto_NDA_2026.docx' (CONFIDENTIAL) copied to ~/Dropbox/Personal/ — DLP rule triggered",
      "Zapier webhook POST to hooks.zapier.com/catch/8821/xyz detected from workstation WS-044",
      "Power Automate flow (personal tenant) triggered: SharePoint file exported to personal OneDrive",
      "DNS query for connect.ifttt.com blocked by enterprise DNS filter — source: 192.168.1.87",
      "New OAuth app 'Make (Integromat)' requesting files.readwrite.all scope on user account",
      "Bulk email export (>500 messages) initiated via IMAP from external IP 203.0.113.45",
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    try {
      this.updateStatus(AgentStatus.ANALYZING);
      const analysis = await analyzeSystemEvent(randomEvent);
      
      const newEvent: SentinelEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        type: analysis.type,
        source: "System Kernel / Network Monitor",
        description: randomEvent,
        actionTaken: analysis.actionTaken,
        aiReasoning: analysis.reasoning
      };

      this.logs = [newEvent, ...this.logs].slice(0, 50); // Keep last 50 logs
      this.notifyEvent(newEvent);
      
      if (analysis.type === 'MALWARE_DETECTED' || analysis.type === 'CRITICAL') {
        this.updateStatus(AgentStatus.THREAT_MITIGATED);
        setTimeout(() => this.updateStatus(AgentStatus.IDLE), 5000);
      } else {
        this.updateStatus(AgentStatus.IDLE);
      }
    } catch (error) {
      this.updateStatus(AgentStatus.IDLE);
    }
  }

  private updateStatus(status: AgentStatus) {
    this.status = status;
    this.onStatusCallbacks.forEach(cb => cb(status));
  }

  private notifyEvent(event: SentinelEvent) {
    this.onEventCallbacks.forEach(cb => cb(event));
  }

  public onEvent(cb: SentinelCallback) {
    this.onEventCallbacks.push(cb);
    return () => {
      this.onEventCallbacks = this.onEventCallbacks.filter(c => c !== cb);
    };
  }

  public onStatusChange(cb: StatusCallback) {
    this.onStatusCallbacks.push(cb);
    return () => {
      this.onStatusCallbacks = this.onStatusCallbacks.filter(c => c !== cb);
    };
  }

  public getStatus() {
    return this.status;
  }

  public getLogs() {
    return this.logs;
  }
}

export const sentinel = SentinelService.getInstance();
