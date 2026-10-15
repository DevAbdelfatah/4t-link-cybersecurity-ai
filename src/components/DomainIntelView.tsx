import React, { useState } from 'react';
import { Globe, Search, Activity, Server, ShieldCheck, AlertCircle, Calendar, Hash, Mail } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';

export const DomainIntelView: React.FC = () => {
  const { isRtl, t } = useCyber();
  const [domainInput, setDomainInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (target?: string) => {
    const d = target || domainInput;
    if (!d.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/domain-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: d.trim() })
      });

      if (!res.ok) {
        throw new Error(`Failed to resolve domain intelligence (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || (isRtl ? 'حدث خطأ أثناء فحص النطاق' : 'Error querying domain intel'));
    } finally {
      setIsLoading(false);
    }
  };

  const sampleDomains = ['google.com', 'wikipedia.org', 'github.com', 'apple-id-verify.cfd'];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B12] text-slate-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Box */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
            <Globe className="w-6 h-6 text-[#38BDF8]" />
            <span>{isRtl ? 'استخبارات أسماء النطاقات (DNS & RDAP)' : 'Domain Intelligence & DNS Inspector'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            {isRtl
              ? 'استعلم عن سجلات DNS الفعلية (A, AAAA, MX, TXT, NS)، وتاريخ تسجيل النطاق، ومزود الخدمة عبر بروتوكول RDAP المعتمد من ICANN.'
              : 'Safely inspect live DNS records, WHOIS/RDAP registration dates, registrar information, and authoritative nameservers.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder={isRtl ? 'أدخل اسم النطاق (مثال: example.com)...' : 'Enter domain (e.g. example.com)...'}
              className="flex-1 bg-[#080B12] border border-slate-700/80 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#38BDF8] font-mono"
            />
            <button
              onClick={() => handleQuery()}
              disabled={!domainInput.trim() || isLoading}
              className={`px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                domainInput.trim() && !isLoading
                  ? 'bg-[#38BDF8] text-slate-950 hover:bg-sky-400'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isRtl ? 'استعلام' : 'Inspect Domain'}</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span>{isRtl ? 'أمثلة سريعة:' : 'Quick examples:'}</span>
            {sampleDomains.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  setDomainInput(d);
                  handleQuery(d);
                }}
                className="underline hover:text-slate-200 font-mono text-[11px]"
              >
                {d}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overview Strip */}
            <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                <div>
                  <div className="text-xs text-slate-400 font-mono">TARGET DOMAIN</div>
                  <div className="text-xl font-bold font-mono text-[#38BDF8]">{result.domain}</div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Queried at: {new Date(result.queriedAt).toLocaleTimeString()}
                </div>
              </div>

              {/* RDAP Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{isRtl ? 'تاريخ التسجيل' : 'Registered Date'}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200">
                    {result.rdap?.registeredDate?.split('T')[0] || (isRtl ? 'غير متوفر' : 'Unavailable')}
                  </div>
                  {result.rdap?.domainAgeDays !== undefined && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      Age: <span className="text-[#22C55E] font-bold tabular-nums">{result.rdap.domainAgeDays}</span> days
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{isRtl ? 'جهة التسجيل (Registrar)' : 'Registrar'}</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-200 truncate">
                    {result.rdap?.registrar || (isRtl ? 'غير متوفر' : 'Unknown')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">ICANN Accredited</div>
                </div>

                <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
                  <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'تاريخ الانتهاء' : 'Expires Date'}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200">
                    {result.rdap?.expiresDate?.split('T')[0] || (isRtl ? 'غير متوفر' : 'Unavailable')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Renewal tracking</div>
                </div>
              </div>
            </div>

            {/* DNS Records Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* A & AAAA Records */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{isRtl ? 'سجلات A و AAAA (عناوين IP)' : 'A & AAAA IP Records'}</span>
                  </span>
                  <span className="font-mono text-slate-500">{(result.dns?.ipAddresses || []).length} found</span>
                </div>
                {(result.dns?.ipAddresses || []).length === 0 ? (
                  <div className="text-xs text-slate-500">{isRtl ? 'لا توجد سجلات A محلولة' : 'No A records resolved'}</div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {result.dns.ipAddresses.map((ip: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-[#080B12] text-slate-200 flex justify-between">
                        <span>{ip}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{ip.includes(':') ? 'IPv6' : 'IPv4'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MX Mail Records */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{isRtl ? 'سجلات البريد (MX Records)' : 'MX Mail Exchangers'}</span>
                  </span>
                  <span className="font-mono text-slate-500">{(result.dns?.mxRecords || []).length} found</span>
                </div>
                {(result.dns?.mxRecords || []).length === 0 ? (
                  <div className="text-xs text-slate-500">{isRtl ? 'لا توجد سجلات MX' : 'No MX records found'}</div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {result.dns.mxRecords.map((mx: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-[#080B12] text-slate-200 truncate">
                        {mx}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Authoritative Nameservers (NS) */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'خوادم الأسماء (Nameservers)' : 'Authoritative Nameservers'}</span>
                  </span>
                  <span className="font-mono text-slate-500">{(result.dns?.nsRecords || []).length} found</span>
                </div>
                {(result.dns?.nsRecords || []).length === 0 ? (
                  <div className="text-xs text-slate-500">{isRtl ? 'لا توجد خوادم NS' : 'No NS records found'}</div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {result.dns.nsRecords.map((ns: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-[#080B12] text-slate-200 truncate">
                        {ns}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TXT Verification & SPF / DMARC Records */}
              <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isRtl ? 'سجلات TXT (SPF, DKIM, DMARC)' : 'TXT Records (SPF & Security)'}</span>
                  </span>
                  <span className="font-mono text-slate-500">{(result.dns?.txtRecords || []).length} found</span>
                </div>
                {(result.dns?.txtRecords || []).length === 0 ? (
                  <div className="text-xs text-slate-500">{isRtl ? 'لا توجد سجلات TXT' : 'No TXT records found'}</div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {result.dns.txtRecords.map((txt: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-[#080B12] text-slate-300 break-all text-[11px]">
                        {txt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
