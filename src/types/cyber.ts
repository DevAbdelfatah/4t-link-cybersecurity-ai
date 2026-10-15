export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'Unknown';

export type IndicatorSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface ThreatIndicator {
  id: string;
  category: 'protocol' | 'domain' | 'ip' | 'homograph' | 'brand' | 'obfuscation' | 'shortener' | 'path' | 'entropy' | 'dns' | 'reputation';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: IndicatorSeverity;
  scoreContribution: number;
  evidence?: string;
}

export interface ProviderResult {
  provider: 'virustotal' | 'google_safe_browsing' | 'rdap' | 'cloudflare_doh';
  name: string;
  status: 'clean' | 'suspicious' | 'malicious' | 'unconfigured' | 'error' | 'not_found';
  message: string;
  messageAr: string;
  details?: Record<string, any>;
  queriedAt?: string;
}

export interface DomainIntelligence {
  domain: string;
  rootDomain: string;
  subdomain: string;
  tld: string;
  ipAddresses?: string[];
  mxRecords?: string[];
  txtRecords?: string[];
  nsRecords?: string[];
  isIpAddress: boolean;
  isPrivateIp?: boolean;
  entropy: number;
  isPunycode: boolean;
  unicodeDomain?: string;
  registrar?: string;
  registeredDate?: string;
  expiresDate?: string;
  domainAgeDays?: number;
  rdapQueried: boolean;
}

export interface URLAnalysisResult {
  id: string;
  analyzedAt: string;
  inputUrl: string;
  normalizedUrl: string;
  protocol: 'https' | 'http' | 'other';
  port?: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  domainIntel: DomainIntelligence;
  indicators: ThreatIndicator[];
  passedChecks: {
    title: string;
    titleAr: string;
    details: string;
  }[];
  uncheckedSources: {
    source: string;
    reason: string;
    reasonAr: string;
  }[];
  providers: ProviderResult[];
  recommendations: {
    summary: string;
    summaryAr: string;
    actions: string[];
    actionsAr: string[];
    technicalGuidance: string[];
    technicalGuidanceAr: string[];
  };
  disclaimer: string;
  disclaimerAr: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedAnalysis?: URLAnalysisResult;
  isError?: boolean;
}

export interface ProviderStatusSummary {
  virustotalConfigured: boolean;
  safeBrowsingConfigured: boolean;
  geminiConfigured: boolean;
  rdapActive: boolean;
  dohActive: boolean;
}
