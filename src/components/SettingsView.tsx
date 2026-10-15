import React, { useEffect } from 'react';
import { Settings, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Trash2, Key, Globe, Database } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    providerStatus,
    refreshProviderStatus,
    clearHistory,
    analysisHistory,
    isRtl,
    t
  } = useCyber();

  useEffect(() => {
    refreshProviderStatus();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B12] text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
            <Settings className="w-6 h-6 text-[#22C55E]" />
            <span>{t('settings')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isRtl
              ? 'إدارة إعدادات المنصة، ومتابعة حالة اتصال مزودي معلومات التهديدات والاستخبارات السيبرانية.'
              : 'Platform configuration, threat intelligence integration status, and local session management.'}
          </p>
        </div>

        {/* Threat Intelligence Providers Matrix */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                <span>{isRtl ? 'حالة تكاملات قواعد السمعة والاستخبارات (Backend Status)' : 'Threat Intelligence Integrations Status'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl
                  ? 'يتم تخزين المفاتيح وتنفيذ الطلبات من الخادم فقط. لا يتم تزييف أو اختلاق أي استجابة.'
                  : 'Keys and API queries execute strictly server-side. Authentic responses only.'}
              </p>
            </div>
            <button
              onClick={() => refreshProviderStatus()}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* VirusTotal */}
            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-semibold text-slate-200">VirusTotal Intelligence API v3</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {isRtl
                    ? 'فحص الروابط والنطاقات عبر أكثر من 70 محرك مكافحة فيروسات وسجلات تهديدات دولية.'
                    : 'Scans URLs against 70+ antivirus engines and global threat telemetry databases.'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {providerStatus?.virustotalConfigured ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-[#22C55E] font-medium font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Configured</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-mono">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Unconfigured (VIRUSTOTAL_API_KEY)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Google Safe Browsing */}
            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-semibold text-slate-200">Google Safe Browsing API v4</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {isRtl
                    ? 'كشف مواقع الهندسة الاجتماعية والبرمجيات غير المرغوبة ومحاولات الخداع.'
                    : 'Real-time lookups for social engineering, phishing kits, and malicious software.'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {providerStatus?.safeBrowsingConfigured ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-[#22C55E] font-medium font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Configured</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-mono">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Unconfigured (GOOGLE_SAFE_BROWSING_API_KEY)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Cloudflare DoH */}
            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-semibold text-slate-200">Cloudflare 1.1.1.1 DNS-over-HTTPS (DoH)</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {isRtl
                    ? 'حل أسماء النطاقات والتحقق من وجودها الفعلي عالميًا وتفادي تزييف NXDOMAIN.'
                    : 'Global DoH queries for cryptographic DNS verification and NXDOMAIN discovery.'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-[#22C55E] font-medium font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active (Public DoH)</span>
                </span>
              </div>
            </div>

            {/* ICANN RDAP */}
            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-semibold text-slate-200">ICANN RDAP Protocol</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {isRtl
                    ? 'التحقق من تاريخ إنشاء النطاق وعمره والجهة المسجلة الرسمية بدون وسيط.'
                    : 'Public standard for authoritative domain age and registrar registration events.'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-[#22C55E] font-medium font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active (Public RDAP)</span>
                </span>
              </div>
            </div>

            {/* 4T-LINK AI Engine */}
            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-semibold text-slate-200">4T-LINK AI Threat Intelligence Engine</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {isRtl
                    ? 'تم تطويره وبرمجته وتخصيصه بواسطة عبدالفتاح عبدالحميد (ديبو) للتحليل الأمني الدفاعي.'
                    : 'Developed, programmed, and customized by Abdelfatah Abdelhamid (Debo) for defensive cybersecurity.'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {providerStatus?.geminiConfigured ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-[#22C55E] font-medium font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active (4T-LINK AI)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 font-mono">
                    <Key className="w-3.5 h-3.5" />
                    <span>Checking configuration</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Language & Local Data Preferences */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? 'تفضيلات اللغة وتخزين البيانات' : 'Preferences & Data Storage'}</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">{isRtl ? 'لغة الواجهة' : 'Interface Language'}</div>
                <div className="text-slate-400">{isRtl ? 'اختر اللغة المفضلة للواجهة والمحادثة' : 'Select preferred language'}</div>
              </div>
              <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    language === 'ar' ? 'bg-emerald-500/20 text-[#22C55E] font-bold' : 'text-slate-400'
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    language === 'en' ? 'bg-emerald-500/20 text-[#22C55E] font-bold' : 'text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div>
                <div className="font-semibold text-slate-200">{isRtl ? 'حذف سجل الفحص المحلي' : 'Clear Local Scan Audit Log'}</div>
                <div className="text-slate-400">
                  {isRtl ? `لديك ${analysisHistory.length} تحليلات مسجلة في المتصفح` : `${analysisHistory.length} analyses currently stored in browser`}
                </div>
              </div>
              <button
                onClick={clearHistory}
                disabled={analysisHistory.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors disabled:opacity-40"
              >
                {t('clearHistoryBtn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
