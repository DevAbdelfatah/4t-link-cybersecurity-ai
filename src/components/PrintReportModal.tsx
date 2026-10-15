import React from 'react';
import { X, Printer, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';
import { URLAnalysisResult } from '../types/cyber.ts';

export const PrintReportModal: React.FC = () => {
  const { printingAnalysis, setPrintingAnalysis, isRtl } = useCyber();

  if (!printingAnalysis) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0F19] border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-0 print:shadow-none print:max-w-none print:w-full print:bg-white print:text-black">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 bg-[#101722] border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#22C55E]" />
            <span>{isRtl ? 'معاينة تقرير التدقيق الأمني للطباعة' : 'Printable Security Audit Report Preview'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22C55E] text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRtl ? 'طباعة التقرير (Print / PDF)' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={() => setPrintingAnalysis(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-200 print:text-black print:p-0">
          {/* Header */}
          <div className="border-b border-slate-700 print:border-black pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold font-mono tracking-wider text-slate-100 print:text-black">
                  4T-LINK AI CYBERSECURITY
                </div>
                <div className="text-xs text-slate-400 print:text-gray-600">
                  URL Threat Analysis & Incident Triage Report · by Abdelfatah Abdelhamid (Debo)
                </div>
              </div>
              <div className="text-end text-xs font-mono text-slate-400 print:text-gray-600">
                <div>REF: {printingAnalysis.id}</div>
                <div>{new Date(printingAnalysis.analyzedAt).toUTCString()}</div>
              </div>
            </div>
          </div>

          {/* Target URL & Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div className="sm:col-span-2">
              <div className="text-[11px] font-mono uppercase text-slate-400 print:text-gray-600">INSPECTED TARGET URL</div>
              <div className="text-sm font-mono font-bold text-slate-100 print:text-black break-all">
                {printingAnalysis.inputUrl}
              </div>
              <div className="text-xs text-slate-400 print:text-gray-700 mt-1">
                Domain: <span className="font-semibold">{printingAnalysis.domainIntel.domain}</span> ({printingAnalysis.protocol.toUpperCase()})
              </div>
            </div>
            <div className="text-end">
              <div className="text-[11px] font-mono uppercase text-slate-400 print:text-gray-600">EVALUATED RISK</div>
              <div className="text-2xl font-extrabold font-mono text-[#22C55E] print:text-black">
                {printingAnalysis.riskScore}/100
              </div>
              <div className="text-xs font-bold uppercase tracking-wider font-mono">
                {printingAnalysis.riskLevel} Risk
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black border-b border-slate-800 print:border-gray-300 pb-1">
              {isRtl ? 'مؤشرات التهديد المرصودة' : 'Observed Threat Indicators'} ({printingAnalysis.indicators.length})
            </div>
            {printingAnalysis.indicators.length === 0 ? (
              <div className="text-xs text-slate-400 print:text-gray-600">
                {isRtl ? 'لم تسجل أي مؤشرات سلبية أثناء الفحص الساكن.' : 'No negative threat indicators recorded during static inspection.'}
              </div>
            ) : (
              <div className="space-y-2">
                {printingAnalysis.indicators.map((ind) => (
                  <div key={ind.id} className="p-3 rounded bg-slate-900/40 border border-slate-800 print:border-gray-300 text-xs">
                    <div className="flex justify-between font-bold text-slate-200 print:text-black">
                      <span>{isRtl ? ind.titleAr : ind.title}</span>
                      <span className="uppercase text-[10px] font-mono text-amber-400 print:text-black">[{ind.severity}]</span>
                    </div>
                    <div className="text-slate-400 print:text-gray-700 mt-0.5">
                      {isRtl ? ind.descriptionAr : ind.description}
                    </div>
                    {ind.evidence && (
                      <div className="text-[10px] font-mono text-sky-400 print:text-gray-800 mt-1">
                        Evidence: {ind.evidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-2 border-t border-slate-800 print:border-gray-300 pt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              {isRtl ? 'التوصيات الوقائية' : 'Defensive Recommendations'}
            </div>
            <div className="text-xs text-slate-300 print:text-black leading-relaxed">
              {isRtl ? printingAnalysis.recommendations.summaryAr : printingAnalysis.recommendations.summary}
            </div>
            <ul className="list-disc ms-4 text-xs text-slate-400 print:text-gray-700 space-y-1">
              {(isRtl ? printingAnalysis.recommendations.actionsAr : printingAnalysis.recommendations.actions).map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] text-slate-500 print:text-gray-500 border-t border-slate-800 print:border-gray-300 pt-3 text-center">
            {printingAnalysis.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
