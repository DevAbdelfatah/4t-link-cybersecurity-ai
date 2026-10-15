import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  Server,
  Globe,
  Lock,
  Unlock,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Activity,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';
import { URLAnalysisResult, RiskLevel, IndicatorSeverity } from '../types/cyber.ts';

export const ScannerView: React.FC = () => {
  const {
    currentAnalysis,
    setCurrentAnalysis,
    isAnalyzing,
    setIsAnalyzing,
    saveAnalysisToHistory,
    setChatAttachedAnalysis,
    setActiveTab,
    setPrintingAnalysis,
    isRtl,
    t
  } = useCyber();

  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safe pre-configured sample links for testing
  const sampleLinks = [
    {
      label: isRtl ? 'نطاق سليم موثوق' : 'Benign Standard Domain',
      url: 'https://example.com',
      badge: isRtl ? 'سليم' : 'Clean'
    },
    {
      label: isRtl ? 'انتحال علامة تجارية + TLD مشبوه' : 'Brand Spoof + High-Abuse TLD',
      url: 'https://apple-id-verify.cfd/auth/login.php',
      badge: isRtl ? 'تصيد' : 'Phishing'
    },
    {
      label: isRtl ? 'عنوان IP محلي (خطر SSRF)' : 'Local IP / SSRF Threat',
      url: 'http://192.168.1.1:8080/admin',
      badge: 'SSRF'
    },
    {
      label: isRtl ? 'خدمة اختصار روابط' : 'URL Shortener Concealment',
      url: 'https://bit.ly/security-notice-2026',
      badge: isRtl ? 'مختصر' : 'Shortener'
    },
    {
      label: isRtl ? 'حمولة برمجية تنفيذية (.exe)' : 'Executable File Drop (.exe)',
      url: 'https://updates-cloud-cdn.top/secure_invoice.pdf.exe',
      badge: isRtl ? 'ملف تنفيذي' : 'Payload'
    },
    {
      label: isRtl ? 'نطاق دولي Punycode (IDN)' : 'Punycode IDN Homograph',
      url: 'https://xn--pple-43d.com/login',
      badge: 'Punycode'
    }
  ];

  const handleAnalyze = async (targetUrl?: string) => {
    const urlToTest = targetUrl || inputUrl;
    if (!urlToTest.trim() || isAnalyzing) return;

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error ${res.status}`);
      }

      const result: URLAnalysisResult = await res.json();
      setCurrentAnalysis(result);
      saveAnalysisToHistory(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err?.message || (isRtl ? 'فشل تشغيل فحص الرابط' : 'Failed to analyze URL'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadgeStyles = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      case 'High':
        return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'Low':
        return 'bg-emerald-500/15 text-[#22C55E] border border-emerald-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border border-slate-700';
    }
  };

  const getSeverityBadge = (severity: IndicatorSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Critical</span>;
      case 'high':
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">High</span>;
      case 'medium':
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">Medium</span>;
      default:
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Info</span>;
    }
  };

  const exportToJson = () => {
    if (!currentAnalysis) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentAnalysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `4tlink_analysis_${currentAnalysis.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B12] text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Scanner Hero Box */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#22C55E]" />
              <span>{isRtl ? 'وحدة فحص الروابط وتقييم التهديدات' : 'URL Threat Analysis Engine'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isRtl
                ? 'فحص هيكلي شامل للروابط، وكشف النطاقات المزيفة، ومحاولات التحايل البصري، وتكامل السمعة الأمنية.'
                : 'Heuristic security verification: domain spoofing, homographs, SSRF indicators, and threat intelligence status.'}
            </p>
          </div>

          {/* Input Form */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder={t('scanInputPlaceholder')}
                  className="w-full bg-[#080B12] border border-slate-700/80 rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#22C55E]/60 font-mono"
                />
                {inputUrl && (
                  <button
                    onClick={() => setInputUrl('')}
                    className="absolute end-3 top-3 text-xs text-slate-500 hover:text-slate-300"
                  >
                    {isRtl ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>
              <button
                onClick={() => handleAnalyze()}
                disabled={!inputUrl.trim() || isAnalyzing}
                className={`px-5 py-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                  inputUrl.trim() && !isAnalyzing
                    ? 'bg-[#22C55E] text-slate-950 hover:bg-emerald-400 shadow-xs'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t('analyzingText')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t('analyzeButton')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Test Samples */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isRtl ? 'عينات اختبار سريعة للتحقق الدفاعي:' : 'Pre-configured Test Cases:'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleLinks.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputUrl(sample.url);
                      handleAnalyze(sample.url);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[#080B12] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
                  >
                    <span className="font-mono text-[11px] text-slate-400">{sample.url}</span>
                    <span className="text-[10px] text-[#38BDF8] bg-[#38BDF8]/10 px-1 py-0.2 rounded font-sans">
                      {sample.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Progress State */}
        {isAnalyzing && (
          <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-8 text-center space-y-4">
            <Activity className="w-8 h-8 text-[#22C55E] animate-spin mx-auto" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-200">
                {isRtl ? 'جاري تشغيل محرك الفحص الأمني المتعدد...' : 'Running Multi-Stage Heuristic Engine...'}
              </div>
              <div className="text-xs text-slate-400">
                {isRtl
                  ? 'التحقق من RFC 3986 · فحص النطاقات المتشابهة · كشف SSRF · استعلام DNS وRDAP الآمن'
                  : 'Validating RFC 3986 syntax · Homoglyph scanner · SSRF filter · Safe DNS & RDAP lookup'}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {currentAnalysis && !isAnalyzing && (
          <div className="space-y-6">
            {/* Header Summary Card */}
            <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-slate-400">ANALYSIS ID: {currentAnalysis.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(currentAnalysis.analyzedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-mono font-bold text-slate-100 break-all">
                    {currentAnalysis.inputUrl}
                  </div>
                </div>

                {/* Score & Risk Badge */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-end">
                    <div className="text-[11px] text-slate-400 uppercase font-mono">{t('riskScore')}</div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-100">
                      {currentAnalysis.riskScore}
                      <span className="text-xs text-slate-500 font-normal"> / 100</span>
                    </div>
                  </div>

                  <div className={`px-3 py-2 rounded-lg text-xs font-bold uppercase font-mono text-center ${getRiskBadgeStyles(currentAnalysis.riskLevel)}`}>
                    <div className="text-[10px] opacity-80">{t('riskLevel')}</div>
                    <div className="text-sm font-extrabold">{currentAnalysis.riskLevel}</div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-semibold">{isRtl ? 'البروتوكول:' : 'Protocol:'}</span> {currentAnalysis.protocol.toUpperCase()} ·{' '}
                  <span className="text-slate-300 font-semibold">{isRtl ? 'المنفذ:' : 'Port:'}</span> {currentAnalysis.port || 'Default'} ·{' '}
                  <span className="text-slate-300 font-semibold">{isRtl ? 'المؤشرات:' : 'Indicators:'}</span> {currentAnalysis.indicators.length}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setChatAttachedAnalysis(currentAnalysis);
                      setActiveTab('chat');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#38BDF8] bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('consultAi')}</span>
                  </button>

                  <button
                    onClick={exportToJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title={t('exportJson')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={() => setPrintingAnalysis(currentAnalysis)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title={t('printReport')}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('printReport')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Observed Indicators & Defensive Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Threat Indicators */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{t('observedIndicators')} ({currentAnalysis.indicators.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">WEIGHTED HEURISTICS</span>
                </div>

                {currentAnalysis.indicators.length === 0 ? (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {isRtl
                        ? 'لم يتم رصد أي مؤشرات تهديد شكلية أو خصائص انتحال خلال الفحص الساكن الأولي.'
                        : 'No static threat indicators or deception patterns observed in initial inspection.'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentAnalysis.indicators.map((ind) => (
                      <div
                        key={ind.id}
                        className="p-3 rounded-lg bg-[#080B12] border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-200">
                            {isRtl ? ind.titleAr : ind.title}
                          </span>
                          {getSeverityBadge(ind.severity)}
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                          {isRtl ? ind.descriptionAr : ind.description}
                        </p>
                        {ind.evidence && (
                          <div className="text-[10px] font-mono text-[#38BDF8] bg-slate-900 px-2 py-0.5 rounded inline-block truncate max-w-full">
                            Evidence: {ind.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Passed Checks */}
                {currentAnalysis.passedChecks.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>{t('passedChecks')}</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-400">
                      {currentAnalysis.passedChecks.map((chk, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-[#22C55E] shrink-0">✓</span>
                          <span>
                            <strong className="text-slate-300">{isRtl ? chk.titleAr : chk.title}:</strong> {chk.details}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Recommendations & Action Plan */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <span>{t('recommendations')}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">INCIDENT PROTOCOL</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="font-semibold text-slate-200 mb-1">
                    {isRtl ? 'الملخص الإرشادي:' : 'Executive Summary:'}
                  </div>
                  <div>{isRtl ? currentAnalysis.recommendations.summaryAr : currentAnalysis.recommendations.summary}</div>
                </div>

                {/* Immediate User Actions */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    {isRtl ? 'الإجراءات الوقائية الفورية للمستخدم:' : 'Immediate User Precautions:'}
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {(isRtl ? currentAnalysis.recommendations.actionsAr : currentAnalysis.recommendations.actions).map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0 font-bold">›</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical SOC Guidance */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300">
                    {isRtl ? 'التوجيهات الفنية لمسؤولي الأمن والشبكات (SOC):' : 'Technical Guidance for SOC / Network Admins:'}
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {(isRtl ? currentAnalysis.recommendations.technicalGuidanceAr : currentAnalysis.recommendations.technicalGuidance).map((gui, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#38BDF8] shrink-0 font-bold">›</span>
                        <span>{gui}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unchecked Data Sources Note */}
                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('uncheckedSources')}</span>
                  </div>
                  {currentAnalysis.uncheckedSources.map((u, i) => (
                    <div key={i} className="leading-snug">
                      • <strong className="text-slate-400">{u.source}:</strong> {isRtl ? u.reasonAr : u.reason}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Threat Intelligence Providers & Domain Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* External Threat Providers Status */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#38BDF8]" />
                    <span>{t('providersTitle')}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">BACKEND INTEGRATIONS</span>
                </div>

                <div className="space-y-2">
                  {currentAnalysis.providers.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#080B12] border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{p.name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            p.status === 'clean'
                              ? 'bg-emerald-500/20 text-[#22C55E]'
                              : p.status === 'malicious'
                              ? 'bg-rose-500/20 text-rose-400'
                              : p.status === 'unconfigured'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl ? p.messageAr : p.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain & Infrastructure Intelligence */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>{t('domainDetails')}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">DNS & WHOIS</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isRtl ? 'اسم النطاق:' : 'Domain Host:'}</span>
                    <span className="font-mono text-slate-200">{currentAnalysis.domainIntel.domain}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isRtl ? 'النطاق الأساسي (Root):' : 'Root Domain:'}</span>
                    <span className="font-mono text-slate-200">{currentAnalysis.domainIntel.rootDomain}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isRtl ? 'عمر النطاق:' : 'Domain Age:'}</span>
                    <span className="font-mono text-slate-200">
                      {currentAnalysis.domainIntel.domainAgeDays !== undefined
                        ? `${currentAnalysis.domainIntel.domainAgeDays} days (${currentAnalysis.domainIntel.registeredDate?.split('T')[0] || ''})`
                        : (isRtl ? 'غير متوفر / غير مسجل في RDAP' : 'Not available in RDAP')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isRtl ? 'المسجل (Registrar):' : 'Registrar:'}</span>
                    <span className="text-slate-200 truncate max-w-[200px]">
                      {currentAnalysis.domainIntel.registrar || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">{isRtl ? 'عشوائية شانون (Entropy):' : 'Shannon Entropy:'}</span>
                    <span className="font-mono tabular-nums text-slate-200">{currentAnalysis.domainIntel.entropy}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isRtl ? 'عناوين IP المحلولة:' : 'Resolved IPs:'}</span>
                    <span className="font-mono text-[11px] text-[#38BDF8] truncate max-w-[200px]">
                      {currentAnalysis.domainIntel.ipAddresses?.join(', ') || (isRtl ? 'لا يوجد' : 'None')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800/90 text-xs text-slate-500 leading-relaxed text-center">
              {isRtl ? currentAnalysis.disclaimerAr : currentAnalysis.disclaimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
