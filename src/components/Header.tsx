import React from 'react';
import { Menu, Sparkles, Plus } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    t,
    isRtl,
    currentAnalysis,
    setChatAttachedAnalysis,
    setMobileMenuOpen
  } = useCyber();

  const getModuleTitle = () => {
    switch (activeTab) {
      case 'chat': return t('aiChat');
      case 'scanner': return t('urlScanner');
      case 'domain': return t('domainIntel');
      case 'history': return t('history');
      case 'knowledge': return t('knowledge');
      case 'settings': return t('settings');
      case 'about': return t('about');
      default: return '4T-LINK';
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#080B12]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 shrink-0 select-none z-20">
      {/* Zone 1: Mobile Hamburger & Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2.5 truncate">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ms-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-400 truncate">
          <span className="text-slate-100 font-bold tracking-wider whitespace-nowrap">4T-LINK</span>
          <span className="text-slate-600">/</span>
          <span className="text-[#38BDF8] font-medium truncate">{getModuleTitle()}</span>
        </div>
      </div>

      {/* Zone 2 & 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {currentAnalysis && activeTab !== 'chat' && (
          <button
            onClick={() => {
              setChatAttachedAnalysis(currentAnalysis);
              setActiveTab('chat');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#38BDF8] bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRtl ? 'استشر 4T-LINK' : 'Discuss with 4T-LINK'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-950 bg-[#22C55E] hover:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{t('newAnalysis')}</span>
          <span className="xs:hidden">{isRtl ? 'فحص' : 'Scan'}</span>
        </button>
      </div>
    </header>
  );
};
