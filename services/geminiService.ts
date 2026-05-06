import { GoogleGenAI, Type } from "@google/genai";
import { UrlScanResult, ApkAnalysisResult } from "../types";

// Initialize Gemini Client
// NOTE: Process.env.API_KEY is handled by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_MODEL = "gemini-2.5-flash-preview";

export const scanUrl = async (url: string): Promise<UrlScanResult> => {
  try {
    const prompt = `
      Analyze the following URL for security threats, phishing attempts, and tracking parameters.
      URL: ${url}
      
      Act as a cybersecurity expert. Identify tracking parameters (like utm_, fbclid, etc.) and assess the reputation of the domain.
      Return the result in strictly structured JSON.
    `;

    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING },
            riskScore: { type: Type.INTEGER, description: "0 is safe, 100 is critical" },
            isMalicious: { type: Type.BOOLEAN },
            threatType: { type: Type.STRING, enum: ['PHISHING', 'MALWARE', 'TRACKING', 'SAFE', 'UNKNOWN'] },
            analysis: { type: Type.STRING, description: "A brief technical summary of findings" },
            detectedTrackingParams: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["url", "riskScore", "isMalicious", "threatType", "analysis", "detectedTrackingParams"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as UrlScanResult;
  } catch (error) {
    console.error("URL Scan Error:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
      url,
      riskScore: 0,
      isMalicious: false,
      threatType: 'UNKNOWN',
      analysis: "Scan failed. Please check your API key or connection.",
      detectedTrackingParams: []
    };
  }
};

export const analyzeApkManifest = async (manifestText: string): Promise<ApkAnalysisResult> => {
  try {
    const prompt = `
      Analyze the following Android Manifest text / Permission list for security risks.
      Input: ${manifestText}
      
      Identify dangerous permissions, unusual receiver definitions, and potential spyware characteristics.
    `;

    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            packageName: { type: Type.STRING, description: "Extracted or inferred package name" },
            riskLevel: { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
            permissionsIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiddenCapabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["riskLevel", "permissionsIssues", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ApkAnalysisResult;

  } catch (error) {
    console.error("APK Analysis Error:", error);
    return {
      packageName: "unknown",
      riskLevel: "LOW",
      permissionsIssues: ["Analysis Failed"],
      hiddenCapabilities: [],
      summary: "Could not complete analysis."
    };
  }
};

export const getThreatIntelChat = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const chat = ai.chats.create({
    model: BASE_MODEL,
    history: history,
    config: {
      systemInstruction: "You are Tauros, an advanced automated cybersecurity analyst. Your tone is professional, concise, and technical. You specialize in Android forensics, network traffic analysis, and malware decomposition. Always prioritize user privacy and safety.",
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};

export const analyzeSystemEvent = async (eventDescription: string): Promise<{
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'MALWARE_DETECTED' | 'TASK_EMBEDDED',
  actionTaken: string,
  reasoning: string
}> => {
  try {
    const prompt = `
      As an autonomous security agent, analyze the following system event:
      "${eventDescription}"
      
      Determine if this is a threat. 
      Return a JSON object with:
      - type: One of ['INFO', 'WARNING', 'CRITICAL', 'MALWARE_DETECTED', 'TASK_EMBEDDED']
      - actionTaken: A brief description of what an automated antivirus would do.
      - reasoning: Your technical reasoning.
    `;

    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['INFO', 'WARNING', 'CRITICAL', 'MALWARE_DETECTED', 'TASK_EMBEDDED'] },
            actionTaken: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["type", "actionTaken", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    return {
      type: 'INFO',
      actionTaken: 'Monitoring continued.',
      reasoning: 'Event analyzed as non-threatening or analysis failed.'
    };
  }
};