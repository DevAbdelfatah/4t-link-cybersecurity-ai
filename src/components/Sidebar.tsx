import React from 'react';
import {
  MessageSquare,
  ShieldAlert,
  Globe,
  History,
  BookOpen,
  Settings,
  Info,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Code
} from 'lucide-react';
import { useCyber, ActiveTab } from '../context/CyberContext.tsx';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    t,
    isRtl,
    language,
    setLanguage,
    analysisHistory,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useCyber();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: t('aiChat'), icon: <MessageSquare className="w-4 h-4 shrink-0" /> },
    { id: 'scanner', label: t('urlScanner'), icon: <ShieldAlert className="w-4 h-4 shrink-0" /> },
    { id: 'domain', label: t('domainIntel'), icon: <Globe className="w-4 h-4 shrink-0" /> },
    { id: 'history', label: t('history'), icon: <History className="w-4 h-4 shrink-0" /> },
    { id: 'knowledge', label: t('knowledge'), icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4 shrink-0" /> },
    { id: 'about', label: t('about'), icon: <Info className="w-4 h-4 shrink-0" /> },
  ];

  const highRiskCount = analysisHistory.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length;

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A0E17] select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <div
          onClick={() => handleNavClick('chat')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden group"
        >
          <img
            src="/src/assets/images/debo_cyber_shield_emblem_1792082042416.jpg"
            alt="4T-LINK"
            className="w-8 h-8 rounded-md object-cover border border-[#22C55E]/40 shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          {(!collapsed || mobileMenuOpen) && (
            <div className="truncate">
              <div className="text-base font-extrabold tracking-wider text-slate-100 flex items-center gap-1.5 font-mono">
                4T<span className="text-[#22C55E]">-LINK</span>
              </div>
              <div className="text-[10px] text-[#38BDF8] truncate font-medium">
                AI Cyber Analyst · by Debo
              </div>
            </div>
          )}
        </div>

        {/* Close button for mobile, collapse toggle for desktop */}
        {mobileMenuOpen ? (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800/60 transition-colors shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isRtl ? (
              collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => handleNavClick('scanner')}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#22C55E] border border-emerald-500/30 transition-all ${
            collapsed && !mobileMenuOpen ? 'px-0' : ''
          }`}
          title={t('newAnalysis')}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {(!collapsed || mobileMenuOpen) && <span className="whitespace-nowrap">{t('newAnalysis')}</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[40px] ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              } ${collapsed && !mobileMenuOpen ? 'justify-center px-0' : ''}`}
              title={collapsed && !mobileMenuOpen ? item.label : undefined}
            >
              <span className={isActive ? 'text-[#38BDF8]' : 'text-slate-400'}>
                {item.icon}
              </span>
              {(!collapsed || mobileMenuOpen) && <span>{item.label}</span>}
              {(!collapsed || mobileMenuOpen) && item.id === 'history' && analysisHistory.length > 0 && (
                <span className="ms-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono tabular-nums">
                  {analysisHistory.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Developer Credit & Real Usage Stats */}
      {(!collapsed || mobileMenuOpen) && (
        <div className="mx-3 my-2 space-y-2">
          {/* Developer Attribution Card */}
          <div className="p-2.5 rounded-lg bg-[#080B12] border border-slate-800 text-xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1 mb-1">
              <Code className="w-3 h-3 text-[#38BDF8]" />
              <span>{isRtl ? 'المطور والمبرمج' : 'Creator / Developer'}</span>
            </div>
            <div className="font-semibold text-slate-200 text-xs">
              {isRtl ? 'عبدالفتاح عبدالحميد (ديبو)' : 'Abdelfatah Abdelhamid (Debo)'}
            </div>
            <div className="text-[10px] text-slate-400">
              Cybersecurity AI Architect
            </div>
          </div>

          {/* Session Scan Stats */}
          <div className="p-2.5 rounded-lg bg-[#080B12] border border-slate-800 text-xs">
            <div className="text-[10px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
              <span>{isRtl ? 'إحصاءات الجلسة' : 'Session Scans'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 py-0.5 text-[11px]">
              <span className="text-slate-400">{isRtl ? 'الروابط المفحوصة' : 'Analyzed URLs'}:</span>
              <span className="font-mono tabular-nums font-bold text-slate-200">{analysisHistory.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 py-0.5 text-[11px]">
              <span className="text-slate-400">{isRtl ? 'عالية الخطورة' : 'High/Critical'}:</span>
              <span className={`font-mono tabular-nums font-bold ${highRiskCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {highRiskCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Language Switcher Footer */}
      <div className="p-3 border-t border-slate-800/80">
        {(!collapsed || mobileMenuOpen) ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400">
              {isRtl ? 'اللغة' : 'Language'}
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-800">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  language === 'ar'
                    ? 'bg-emerald-500/20 text-[#22C55E] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  language === 'en'
                    ? 'bg-emerald-500/20 text-[#22C55E] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-full text-center text-xs font-mono text-slate-400 hover:text-slate-200 p-1"
            title="Toggle Language"
          >
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-800/80 transition-all duration-200 z-30 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 ${isRtl ? 'ms-auto' : 'me-auto'}`}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
