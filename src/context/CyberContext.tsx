import React, { createContext, useContext, useState, useEffect } from 'react';
import { URLAnalysisResult, ChatMessage, ProviderStatusSummary } from '../types/cyber.ts';

export type ActiveTab = 'chat' | 'scanner' | 'domain' | 'history' | 'knowledge' | 'settings' | 'about';
export type Language = 'ar' | 'en';

interface CyberContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;

  // Analysis state
  currentAnalysis: URLAnalysisResult | null;
  setCurrentAnalysis: (analysis: URLAnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  analysisHistory: URLAnalysisResult[];
  saveAnalysisToHistory: (analysis: URLAnalysisResult) => void;
  clearHistory: () => void;

  // Chat state
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;

  // Attached analysis for chat
  chatAttachedAnalysis: URLAnalysisResult | null;
  setChatAttachedAnalysis: (analysis: URLAnalysisResult | null) => void;

  // Providers status
  providerStatus: ProviderStatusSummary | null;
  refreshProviderStatus: () => Promise<void>;

  // Print report
  printingAnalysis: URLAnalysisResult | null;
  setPrintingAnalysis: (analysis: URLAnalysisResult | null) => void;

  // Mobile sidebar drawer state
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const CyberContext = createContext<CyberContextType | undefined>(undefined);

// Initial official welcome messages featuring 4T-LINK & Abdelfatah Abdelhamid (Debo)
const INITIAL_MESSAGES: Record<Language, ChatMessage[]> = {
  ar: [
    {
      id: 'welcome_ar',
      role: 'assistant',
      content: `### مرحبًا بك في **4T-LINK** 🛡️
أنا **4T-LINK**، نموذج ذكاء اصطناعي تم تطويره وبرمجته وتدريبه أو تخصيصه بواسطة المبرمج **عبدالفتاح عبدالحميد**، المعروف باسم **ديبو (Debo)**. 

أنا مساعدك المتخصص في الأمن السيبراني، وتحليل الروابط المشبوهة، واكتشاف مؤشرات التصيد الاحتيالي، وفهم التهديدات الرقمية. أساعدك على تحليل المعلومات الأمنية وتفسير النتائج وتقديم إرشادات الحماية والدفاع الرقمي.

**ما الذي يمكنني مساعدتك به الآن؟**
- **فحص وتحليل رابط مشبوه** وتحديد درجة خطورته ومؤشرات الانتحال.
- **كشف مؤشرات التصيد (Phishing)** وهجمات الهوموغراف (Homoglyphs) وأساليب التضليل.
- **وضع خطة استجابة سريعة** في حال النقر على رابط مريب أو إدخال بيانات الاعتماد.
- **تفسير سجلات الأمان والتنبيهات** ومفاهيم أمان الويب وحماية الخوادم.

*يمكنك استخدام فاحص الروابط بالأسفل، أو سؤالي مباشرة عن أي موضوع في الأمن الرقمي.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  en: [
    {
      id: 'welcome_en',
      role: 'assistant',
      content: `### Welcome to **4T-LINK** 🛡️
I am **4T-LINK**, an AI model developed, programmed, and trained or customized by programmer **Abdelfatah Abdelhamid**, also known as **Debo**.

I specialize in cybersecurity, suspicious URL analysis, phishing indicators, threat assessment, and defensive digital security. I am here to help you analyze security data, interpret findings, and implement solid protection guidelines.

**How can I assist your security operations today?**
- **Inspect a suspicious URL** for brand spoofing, homographs, SSRF indicators, and dangerous payloads.
- **Understand phishing indicators** and modern evasion tactics like deep subdomains and userinfo tricks.
- **Execute an incident response checklist** if corporate credentials or an endpoint were exposed.
- **Analyze web security logs**, DNS records, and defensive architecture.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]
};

// UI Translations dictionary
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ar: {
    appTitle: '4T-LINK',
    appSubtitle: 'المساعد الذكي للأمن السيبراني — تطوير عبدالفتاح عبدالحميد (ديبو)',
    developerCredit: 'تطوير وبرمجة: عبدالفتاح عبدالحميد (ديبو)',
    newAnalysis: 'فحص رابط جديد',
    aiChat: 'محادثة 4T-LINK AI',
    urlScanner: 'فاحص الروابط (URL Scanner)',
    domainIntel: 'استخبارات النطاقات (DNS & RDAP)',
    history: 'سجل الفحوصات',
    knowledge: 'المكتبة وإرشادات الدفاع',
    settings: 'الإعدادات والمزودين',
    about: 'عن 4T-LINK والمطور',
    scanInputPlaceholder: 'أدخل الرابط أو النطاق المراد فحصه (مثال: https://example.com)...',
    analyzeButton: 'بدء تحليل الرابط',
    analyzingText: 'جاري فحص مؤشرات الأمان والخصائص...',
    riskScore: 'مؤشر الخطورة الإرشادي',
    riskLevel: 'مستوى الخطورة',
    observedIndicators: 'مؤشرات التهديد المرصودة',
    passedChecks: 'الفحوصات السليمة',
    uncheckedSources: 'مصادر لم يتم فحصها',
    recommendations: 'التوصيات وإجراءات الوقاية',
    providersTitle: 'تكاملات قواعد السمعة والاستخبارات',
    domainDetails: 'بيانات النطاق والبنية التحتية',
    exportJson: 'تصدير JSON',
    printReport: 'طباعة التقرير',
    consultAi: 'استشارة 4T-LINK حول النتيجة',
    clearHistoryBtn: 'مسح السجل',
    noHistory: 'لا توجد فحوصات سابقة حتى الآن. أدخل رابطًا في الفاحص للبدء.',
    quickShortcuts: 'اختصارات استشارية جاهزة',
    chatInputPlaceholder: 'اطرح سؤالاً أمنيًا على 4T-LINK، أو اسأله عن هويته ومطوره، أو الصق تنبيهًا للتحليل...',
    send: 'إرسال',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    retry: 'إعادة المحاولة',
    newChat: 'محادثة جديدة',
    attachAnalysis: 'إرفاق تقرير الفحص الحالي بالمحادثة',
    detachAnalysis: 'إلغاء إرفاق التقرير',
    activeAnalysisAttached: 'التقرير المرفق:',
    disclaimerBanner: 'النتائج تقدير إرشادي قائم على الخصائص الهيكلية، وليست بديلاً عن أنظمة EDR أو SIEM المتخصصة.'
  },
  en: {
    appTitle: '4T-LINK',
    appSubtitle: 'AI Cybersecurity Platform by Abdelfatah Abdelhamid (Debo)',
    developerCredit: 'Developed & Programmed by Abdelfatah Abdelhamid (Debo)',
    newAnalysis: 'New URL Scan',
    aiChat: '4T-LINK AI Chat',
    urlScanner: 'URL Scanner',
    domainIntel: 'Domain Intelligence',
    history: 'Analysis History',
    knowledge: 'Security Playbooks',
    settings: 'Settings & Status',
    about: 'About 4T-LINK & Creator',
    scanInputPlaceholder: 'Enter URL or domain (e.g. https://example.com or apple-id-login.cfd)...',
    analyzeButton: 'Analyze URL',
    analyzingText: 'Performing Heuristic Inspection...',
    riskScore: 'Heuristic Risk Score',
    riskLevel: 'Risk Level',
    observedIndicators: 'Observed Threat Indicators',
    passedChecks: 'Passed Heuristic Checks',
    uncheckedSources: 'Unchecked Data Sources',
    recommendations: 'Actionable Defensive Guidance',
    providersTitle: 'Threat Intelligence Integrations',
    domainDetails: 'Domain & Infrastructure Details',
    exportJson: 'Export JSON',
    printReport: 'Print Report',
    consultAi: 'Ask 4T-LINK About This Result',
    clearHistoryBtn: 'Clear History',
    noHistory: 'No analyses completed yet. Enter a URL in the Scanner to start.',
    quickShortcuts: 'Quick Analyst Prompts',
    chatInputPlaceholder: 'Ask 4T-LINK a cybersecurity question, ask who created it, or describe an alert...',
    send: 'Send',
    copy: 'Copy',
    copied: 'Copied!',
    retry: 'Retry',
    newChat: 'New Chat',
    attachAnalysis: 'Attach Active URL Analysis',
    detachAnalysis: 'Remove Analysis Context',
    activeAnalysisAttached: 'Attached Analysis:',
    disclaimerBanner: 'Heuristic evaluation based on static indicators. Not a replacement for dedicated EDR/SIEM tools.'
  }
};

export const CyberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [language, setLanguage] = useState<Language>('ar');
  const [currentAnalysis, setCurrentAnalysis] = useState<URLAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<URLAnalysisResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatAttachedAnalysis, setChatAttachedAnalysis] = useState<URLAnalysisResult | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatusSummary | null>(null);
  const [printingAnalysis, setPrintingAnalysis] = useState<URLAnalysisResult | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRtl = language === 'ar';

  // Load history from localStorage on mount (supporting both new 4tlink key and legacy debo key)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('4tlink_analysis_history') || localStorage.getItem('debo_analysis_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAnalysisHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage');
    }

    setChatMessages(INITIAL_MESSAGES[language]);
    refreshProviderStatus();
  }, []);

  // Update initial welcome message when language changes if only welcome is present
  useEffect(() => {
    if (chatMessages.length <= 1) {
      setChatMessages(INITIAL_MESSAGES[language]);
    }
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const saveAnalysisToHistory = (analysis: URLAnalysisResult) => {
    setAnalysisHistory(prev => {
      const updated = [analysis, ...prev.filter(a => a.id !== analysis.id)].slice(0, 50);
      try {
        localStorage.setItem('4tlink_analysis_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist history');
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    try {
      localStorage.removeItem('4tlink_analysis_history');
      localStorage.removeItem('debo_analysis_history');
    } catch (e) {
      // ignore
    }
  };

  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages(INITIAL_MESSAGES[language]);
    setChatAttachedAnalysis(null);
  };

  const refreshProviderStatus = async () => {
    try {
      const res = await fetch('/api/providers/status');
      if (res.ok) {
        const data = await res.json();
        setProviderStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch provider status:', err);
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  return (
    <CyberContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        isRtl,
        currentAnalysis,
        setCurrentAnalysis,
        isAnalyzing,
        setIsAnalyzing,
        analysisHistory,
        saveAnalysisToHistory,
        clearHistory,
        chatMessages,
        addChatMessage,
        clearChat,
        isChatLoading,
        setIsChatLoading,
        chatAttachedAnalysis,
        setChatAttachedAnalysis,
        providerStatus,
        refreshProviderStatus,
        printingAnalysis,
        setPrintingAnalysis,
        mobileMenuOpen,
        setMobileMenuOpen
      }}
    >
      {children}
    </CyberContext.Provider>
  );
};

export const useCyber = () => {
  const context = useContext(CyberContext);
  if (!context) {
    throw new Error('useCyber must be used within a CyberProvider');
  }
  return context;
};
