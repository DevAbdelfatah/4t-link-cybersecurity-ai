import React, { useState } from 'react';
import { History, Search, Download, Trash2, ArrowUpRight, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';
import { RiskLevel } from '../types/cyber.ts';

export const HistoryView: React.FC = () => {
  const {
    analysisHistory,
    clearHistory,
    setCurrentAnalysis,
    setActiveTab,
    setChatAttachedAnalysis,
    isRtl,
    t
  } = useCyber();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<RiskLevel | 'All'>('All');

  const filteredHistory = analysisHistory.filter((item) => {
    const matchesSearch = item.inputUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.domainIntel.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || item.riskLevel === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const exportAllHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysisHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `4tlink_cyber_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRiskBadgeStyles = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      case 'High': return 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
      case 'Medium': return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'Low': return 'bg-emerald-500/20 text-[#22C55E] border border-emerald-500/40';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B12] text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-[#0E1522] border border-slate-800 p-5">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-[#22C55E]" />
              <span>{t('history')}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isRtl
                ? 'سجل تدقيق محلي للروابط التي تم فحصها مع درجات الخطورة المرصودة.'
                : 'Local client audit trail of inspected URLs and evaluated threat levels.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {analysisHistory.length > 0 && (
              <>
                <button
                  onClick={exportAllHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('exportJson')}</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clearHistoryBtn')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRtl ? 'البحث في السجل بواسطة الرابط أو النطاق...' : 'Search history by URL or domain...'}
              className="w-full bg-[#0E1522] border border-slate-800 rounded-lg ps-9 pe-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-slate-700 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#0E1522] p-1 rounded-lg border border-slate-800 text-xs shrink-0 overflow-x-auto">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedFilter === lvl
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        {filteredHistory.length === 0 ? (
          <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-8 text-center text-slate-500 text-xs">
            {searchTerm || selectedFilter !== 'All'
              ? (isRtl ? 'لا توجد نتائج تطابق معايير البحث الحالية.' : 'No analyses match the current search filters.')
              : t('noHistory')}
          </div>
        ) : (
          <div className="rounded-xl bg-[#0E1522] border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 truncate flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${getRiskBadgeStyles(item.riskLevel)}`}>
                      {item.riskLevel}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{new Date(item.analyzedAt).toLocaleString()}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{item.indicators.length} {isRtl ? 'مؤشرات' : 'indicators'}</span>
                  </div>
                  <div className="font-mono text-slate-200 truncate font-semibold">
                    {item.inputUrl}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Domain: <span className="text-slate-300">{item.domainIntel.domain}</span> · Score: <span className="font-mono tabular-nums text-[#22C55E]">{item.riskScore}/100</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setChatAttachedAnalysis(item);
                      setActiveTab('chat');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#38BDF8] hover:bg-[#38BDF8]/10 rounded-md transition-colors"
                    title={t('consultAi')}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'استشارة' : 'Ask AI'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setActiveTab('scanner');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                  >
                    <span>{isRtl ? 'عرض التقرير' : 'View Report'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
