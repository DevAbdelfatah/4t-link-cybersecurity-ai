import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Paperclip,
  X,
  ShieldAlert,
  ArrowRight,
  Terminal,
  StopCircle,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';
import { ChatMessage } from '../types/cyber.ts';

export const ChatView: React.FC = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    isChatLoading,
    setIsChatLoading,
    chatAttachedAnalysis,
    setChatAttachedAnalysis,
    currentAnalysis,
    language,
    isRtl,
    t,
    setActiveTab
  } = useCyber();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  // Suggested starter prompts including identity discovery
  const suggestions = isRtl
    ? [
        { title: 'من هو 4T-LINK ومن المطور؟', prompt: 'انت مين بالظبط ومين اللي برمجك وطورك؟' },
        { title: 'تحليل رابط مشبوه واكتشاف التصيد', prompt: 'كيف أكتشف أن هذا الرابط يحاول سرقة حسابي أو به انتحال هوموغراف؟' },
        { title: 'خطة استجابة طارئة لنقر رابط', prompt: 'قام أحد موظفينا بالنقر على رابط مشبوه وأدخل كلمة المرور، ما هي خطوات الاستجابة الفورية؟' },
        { title: 'فهم ثغرات SSRF و DNS Rebinding', prompt: 'اشرح لي مفهوم هجوم SSRF وكيف تحمي الخوادم نفسها عند فحص الروابط.' }
      ]
    : [
        { title: 'Who is 4T-LINK & who created you?', prompt: 'Who are you and who developed and programmed this AI model?' },
        { title: 'Analyze suspicious link indicators', prompt: 'What are the most dangerous indicators of brand spoofing and phishing in a URL?' },
        { title: 'Immediate incident response protocol', prompt: 'A corporate user entered credentials into a suspected phishing page. What are the immediate SOC containment steps?' },
        { title: 'Explain SSRF & Homograph attacks', prompt: 'How do IDN homoglyphs and Server-Side Request Forgery vulnerabilities work?' }
      ];

  const handleSend = async (overridePrompt?: string) => {
    const question = overridePrompt || input;
    if (!question.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedAnalysis: chatAttachedAnalysis || undefined
    };

    addChatMessage(userMessage);
    setInput('');
    setIsChatLoading(true);

    // Abort controller for cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = chatMessages
        .filter(m => !m.isError)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: question,
          history,
          attachedAnalysis: chatAttachedAnalysis || undefined,
          language
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: data.reply || (isRtl ? 'عذرًا، تعذر الحصول على رد من النموذج.' : 'Sorry, no reply returned.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addChatMessage(assistantMessage);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat generation aborted by user.');
        return;
      }
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: isRtl
          ? `⚠️ حدث خطأ أثناء الاتصال بالمساعد الذكي 4T-LINK: ${err?.message || 'خطأ غير متوقع'}. يرجى إعادة المحاولة.`
          : `⚠️ Error contacting 4T-LINK AI Analyst: ${err?.message || 'Unexpected error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      addChatMessage(errorMessage);
    } finally {
      setIsChatLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsChatLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const fullCode = codeBuffer.join('\n');
          const blockId = `code_${index}`;
          elements.push(
            <div key={blockId} className="my-3 rounded-lg overflow-hidden border border-slate-700/80 bg-[#06080F]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span>{codeLang || 'Code'}</span>
                <button
                  onClick={() => copyToClipboard(fullCode, blockId)}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  {copiedId === blockId ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === blockId ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-w-full">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h4 key={index} className="text-base font-bold text-slate-100 mt-3 mb-1.5">{line.replace('### ', '')}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={index} className="text-lg font-bold text-slate-100 mt-4 mb-2">{line.replace('## ', '')}</h3>);
      } else if (line.startsWith('# ')) {
        elements.push(<h2 key={index} className="text-xl font-bold text-slate-100 mt-4 mb-2">{line.replace('# ', '')}</h2>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.substring(2);
        elements.push(
          <li key={index} className="text-xs sm:text-sm text-slate-300 ml-4 rtl:mr-4 list-disc my-1 leading-relaxed">
            {formatInlineText(itemText)}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="text-xs sm:text-sm text-slate-200 leading-relaxed my-1">
            {formatInlineText(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-800 text-[#38BDF8] px-1.5 py-0.5 rounded text-xs font-mono break-all">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080B12] overflow-hidden">
      {/* Top Banner / Disclaimer */}
      <div className="bg-[#101722]/90 border-b border-slate-800/80 px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <ShieldAlert className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
          <span className="truncate">{t('disclaimerBanner')}</span>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">{t('newChat')}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 max-w-4xl ${isUser ? 'ms-auto flex-row-reverse' : 'me-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-700 text-slate-200'
                    : msg.isError
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-emerald-500/10 text-[#22C55E] border border-emerald-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-xl p-3 sm:p-4 transition-all text-xs sm:text-sm ${
                  isUser
                    ? 'bg-slate-800 text-slate-100 max-w-[85vw] sm:max-w-xl border border-slate-700/60'
                    : 'bg-[#101722] text-slate-200 border border-slate-800/90 shadow-xs max-w-full sm:max-w-3xl flex-1'
                }`}
              >
                {/* Attached Analysis Card in User Message */}
                {isUser && msg.attachedAnalysis && (
                  <div className="mb-3 p-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 flex items-center gap-1 font-mono truncate">
                        <Terminal className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                        <span className="truncate">{msg.attachedAnalysis.inputUrl}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-200 shrink-0">
                        {msg.attachedAnalysis.riskLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Score: <span className="font-mono tabular-nums text-[#22C55E]">{msg.attachedAnalysis.riskScore}/100</span> · Indicators: {msg.attachedAnalysis.indicators.length}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="leading-relaxed break-words overflow-hidden">
                  {renderFormattedContent(msg.content)}
                </div>

                {/* Footer with Timestamp and Copy */}
                <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{msg.timestamp}</span>
                  {!isUser && !msg.isError && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#22C55E]" />
                          <span className="text-[#22C55E]">{t('copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t('copy')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isChatLoading && (
          <div className="flex gap-2.5 sm:gap-3 max-w-3xl me-auto items-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-[#22C55E] border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-xl p-3 sm:p-4 bg-[#101722] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#22C55E] animate-ping shrink-0" />
              <span>{isRtl ? '4T-LINK يقوم بتحليل السياق وإعداد الرد الدفاعي...' : '4T-LINK analyzing threat context & generating response...'}</span>
            </div>
          </div>
        )}

        {/* Suggestions Grid (shown when messages count is low) */}
        {chatMessages.length <= 2 && !isChatLoading && (
          <div className="mt-6 sm:mt-8 max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{t('quickShortcuts')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.prompt)}
                  className="p-3 text-start rounded-lg bg-[#101722] hover:bg-slate-800/80 border border-slate-800/90 hover:border-slate-700 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-[#38BDF8] flex items-center justify-between mb-1">
                    <span>{s.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#38BDF8] rtl:rotate-180 transition-transform shrink-0" />
                  </div>
                  <div className="text-[11px] sm:text-[12px] text-slate-400 line-clamp-2 leading-snug">
                    {s.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800/80 bg-[#0A0E17] p-2.5 sm:p-4 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Active Attached Analysis Banner if present */}
          {chatAttachedAnalysis ? (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <div className="flex items-center gap-2 truncate">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span className="font-semibold whitespace-nowrap">{t('activeAnalysisAttached')}</span>
                <span className="font-mono text-slate-200 truncate">{chatAttachedAnalysis.inputUrl}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-[#22C55E] uppercase font-mono shrink-0">
                  {chatAttachedAnalysis.riskLevel} ({chatAttachedAnalysis.riskScore}/100)
                </span>
              </div>
              <button
                onClick={() => setChatAttachedAnalysis(null)}
                className="text-slate-400 hover:text-slate-200 p-1 shrink-0"
                title={t('detachAnalysis')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : currentAnalysis ? (
            <div className="flex items-center justify-between px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="truncate">{isRtl ? `لديك فحص نشط للرابط (${currentAnalysis.domainIntel.domain})` : `Active scan available: ${currentAnalysis.domainIntel.domain}`}</span>
              <button
                onClick={() => setChatAttachedAnalysis(currentAnalysis)}
                className="text-[#38BDF8] hover:underline flex items-center gap-1 font-medium shrink-0 ms-2"
              >
                <Paperclip className="w-3 h-3" />
                <span>{t('attachAnalysis')}</span>
              </button>
            </div>
          ) : null}

          {/* Textarea and Send button */}
          <div className="relative flex items-end gap-2 bg-[#101722] rounded-xl border border-slate-800 focus-within:border-emerald-500/50 p-2 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('chatInputPlaceholder')}
              rows={2}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm resize-none focus:outline-hidden p-1.5 leading-relaxed"
            />
            <div className="flex items-center gap-1.5 shrink-0 pb-1">
              {isChatLoading ? (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-lg font-medium bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                  title="Stop generation"
                >
                  <StopCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={`p-2 rounded-lg font-medium transition-all ${
                    input.trim()
                      ? 'bg-[#22C55E] text-slate-950 hover:bg-emerald-400 shadow-xs'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title={t('send')}
                >
                  <Send className="w-4 h-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
