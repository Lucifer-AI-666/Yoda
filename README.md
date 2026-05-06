**Tauros Sentinel** è una piattaforma avanzata di cybersecurity alimentata dall'intelligenza artificiale (Gemini API), progettata per il monitoraggio in tempo reale, l'analisi forense di pacchetti Android e la scansione di minacce web.

## 🚀 Funzionalità Principali

### 1. Sentinel AI Agent (Monitoraggio Autonomo)
Un ag# Tauros Sentinel - AI Cybersecurity Hub

ente intelligente che opera costantemente in background per rilevare attività sospette nel sistema.
- **Analisi Statica e Dinamica**: Monitora processi, traffico di rete e modifiche di sistema.
- **Ragionamento AI**: Ogni evento viene analizzato da Gemini per determinare il livello di rischio e l'azione correttiva.
- **Feed in Tempo Reale**: Visualizza il processo decisionale dell'agente direttamente nella dashboard.

### 2. APK Forensics (Analisi Android)
Strumento specializzato per l'ispezione di file APK.
- **Estrazione Metadati**: Recupera automaticamente nome pacchetto, versioni e requisiti SDK.
- **Analisi del Manifesto**: Decompila e analizza il file `AndroidManifest.xml` per identificare permessi pericolosi o capacità nascoste (spyware, tracker).

### 3. URL Security Scanner
Scansione profonda di URL per la protezione della navigazione.
- **Rilevamento Phishing**: Identifica domini malevoli e tentativi di frode.
- **Tracking Extraction**: Rileva e isola parametri di tracciamento invasivi.

### 4. Threat Intel AI
Un'interfaccia di chat dedicata per consultare un esperto di cybersecurity neurale. Ideale per approfondire vulnerabilità specifiche o analizzare report tecnici.

## 🛠️ Tech Stack

- **Frontend**: React 18 con TypeScript.
- **Styling**: Tailwind CSS (Design Brutalista/Tech).
- **AI Engine**: Google Gemini API (`gemini-2.5-flash-preview`).
- **Visualizzazione Dati**: Recharts per grafici di traffico e minacce.
- **Iconografia**: Lucide React.
- **Parsing APK**: `app-info-parser`.

## 📂 Struttura del Progetto

- `/src/components`: Moduli UI riutilizzabili (Scanner, Inspector, Chat).
- `/src/services`: Logica di integrazione API e il servizio autonomo `SentinelService`.
- `/src/Dashboard.tsx`: Centro di comando principale con monitoraggio live.
- `/src/types.ts`: Definizioni rigorose per eventi di sicurezza e stati dell'agente.

## ⚙️ Installazione

1. Assicurati di avere una chiave API valida per Gemini.
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia l'ambiente di sviluppo:
   ```bash
   npm run dev
   ```

---
*Tauros Sentinel v3.2.1 - Sviluppato per la massima visibilità sulla sicurezza digitale.*
