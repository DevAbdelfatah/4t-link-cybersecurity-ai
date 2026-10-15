import React from 'react';
import { ShieldCheck, UserCheck, Terminal, AlertTriangle, Code, Cpu, ExternalLink } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';
import { OFFICIAL_IDENTITY_AR, OFFICIAL_IDENTITY_EN } from '../../server/gemini.ts';

export const AboutView: React.FC = () => {
  const { isRtl } = useCyber();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B12] text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner with 4T-LINK Identity */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-6">
          <img
            src="/src/assets/images/debo_cyber_shield_emblem_1792082042416.jpg"
            alt="4T-LINK Shield"
            className="w-20 h-20 rounded-xl object-cover border border-[#22C55E]/40 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="text-center sm:text-start">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-wider flex items-center justify-center sm:justify-start gap-2">
              4T<span className="text-[#22C55E]">-LINK</span>
            </div>
            <div className="text-xs text-[#38BDF8] font-mono mt-1 font-semibold">
              AI-Powered Cybersecurity Analysis Platform & Defensive Assistant
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              {isRtl
                ? 'نموذج ومنصة ذكاء اصطناعي متخصصة في الأمن السيبراني وتحليل الروابط المشبوهة واكتشاف مؤشرات التصيد الاحتيالي وفهم التهديدات الرقمية.'
                : 'AI model and cybersecurity platform specializing in threat analysis, suspicious URL verification, phishing detection, and digital defense.'}
            </p>
          </div>
        </div>

        {/* Official Identity Statement Box */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            <UserCheck className="w-4 h-4 text-[#22C55E]" />
            <span>{isRtl ? 'بيان الهوية الرسمي ونسب التطوير' : 'Official Identity Statement & Attribution'}</span>
          </div>

          <div className="p-4 rounded-lg bg-[#080B12] border border-slate-800 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div>
              <div className="text-[11px] font-mono text-[#38BDF8] uppercase font-semibold mb-1">
                {isRtl ? 'الهوية الرسمية بالعربية:' : 'Official Statement (Arabic):'}
              </div>
              <p className="font-medium text-slate-200">
                "{OFFICIAL_IDENTITY_AR}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-[#38BDF8] uppercase font-semibold mb-1">
                {isRtl ? 'الهوية الرسمية بالإنجليزية:' : 'Official Statement (English):'}
              </div>
              <p className="font-medium text-slate-200">
                "{OFFICIAL_IDENTITY_EN}"
              </p>
            </div>
          </div>
        </div>

        {/* Developer Attribution Card */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Code className="w-4 h-4 text-[#38BDF8]" />
            <span>{isRtl ? 'عن المطور والمبرمج' : 'About Developer & Programmer'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#080B12] border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-mono">{isRtl ? 'الاسم الكامل:' : 'Full Name:'}</div>
              <div className="text-sm font-bold text-slate-100">{isRtl ? 'عبدالفتاح عبدالحميد' : 'Abdelfatah Abdelhamid'}</div>
              <div className="text-xs text-[#22C55E] font-semibold">{isRtl ? 'المعروف باسم: ديبو (Debo)' : 'Known as: Debo'}</div>
              <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                {isRtl
                  ? 'مهندس برمجيات ومطور ذكاء اصطناعي وأمن سيبراني، قام ببرمجة وتدريب وتخصيص نموذج 4T-LINK لخدمة المجتمع التقني العربي والعالمي في تحليل التهديدات.'
                  : 'Software engineer and cybersecurity AI architect who developed, trained, and customized 4T-LINK for real-time defensive threat analysis.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#080B12] border border-slate-800 space-y-1.5">
              <div className="text-[11px] text-slate-400 font-mono">{isRtl ? 'نطاق التخصص:' : 'Specialization:'}</div>
              <div className="text-sm font-bold text-slate-100">{isRtl ? 'الدفاع السيبراني والتحليل الأمني' : 'Defensive Cybersecurity & AI'}</div>
              <ul className="text-slate-400 text-[11px] space-y-1 pt-1 list-disc ms-4">
                <li>{isRtl ? 'فحص الروابط وكشف هجمات الهوموغراف' : 'URL heuristics & homoglyph detection'}</li>
                <li>{isRtl ? 'حماية الخوادم ضد ثغرات SSRF' : 'SSRF mitigation & safe crawlers'}</li>
                <li>{isRtl ? 'استخبارات النطاقات عبر DNS و RDAP' : 'Domain intelligence via DNS & RDAP'}</li>
                <li>{isRtl ? 'خطط الاستجابة لحوادث التصيد الاحتيالي' : 'Incident response for phishing clicks'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>{isRtl ? 'المبادئ الأساسية لـ 4T-LINK' : 'Core Operating Principles'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 space-y-1">
              <div className="font-bold text-[#38BDF8]">{isRtl ? '1. المصداقية وعدم اختلاق النتائج' : '1. Grounded Authenticity'}</div>
              <p className="text-slate-400 leading-relaxed">
                {isRtl
                  ? 'لا تدّعي المنصة فحص الرابط عبر أي أداة خارجية (مثل VirusTotal أو Safe Browsing) ما لم يتم الاستعلام الحقيقي من الخادم وتأكيد النتيجة.'
                  : 'The system never claims a URL was verified by external vendors unless the backend confirms the scan query completed successfully.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 space-y-1">
              <div className="font-bold text-[#22C55E]">{isRtl ? '2. مناعة قصوى ضد ثغرات SSRF' : '2. SSRF & Crawler Hardening'}</div>
              <p className="text-slate-400 leading-relaxed">
                {isRtl
                  ? 'تمنع المنصة محاولات استهداف العناوين المحلية والخاصة (RFC 1918) وعناوين الميتا داتا السحابية لمنع استغلال الخادم في استطلاع الأنظمة الداخلية.'
                  : 'Private and link-local IP addresses are blocked to prevent Server-Side Request Forgery and unauthorized intranet reconnaissance.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 space-y-1">
              <div className="font-bold text-amber-400">{isRtl ? '3. التمييز بين الحقائق والتقدير الإرشادي' : '3. Heuristics vs Absolute Guarantees'}</div>
              <p className="text-slate-400 leading-relaxed">
                {isRtl
                  ? 'درجة الخطورة (Risk Score) هي تقدير شكلي إرشادي. لا تصنف المنصة أي رابط بأنه آمن 100% اعتمادًا على سلامة مؤشراته الشكلية وحدها.'
                  : 'Risk scores represent heuristic threat estimates. A clean static score never guarantees that a compromised trusted site is risk-free.'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080B12] border border-slate-800 space-y-1">
              <div className="font-bold text-purple-400">{isRtl ? '4. التوجه الدفاعي الصارم' : '4. Strictly Defensive Scope'}</div>
              <p className="text-slate-400 leading-relaxed">
                {isRtl
                  ? 'المنصة مصممة للدفاع السيبراني والتحليل الوقائي فقط، ولا توفر أدوات هجومية أو برمجيات استغلال ضد أي جهة.'
                  : 'Exclusively built for authorized defensive security, incident response, and cybersecurity awareness.'}
              </p>
            </div>
          </div>
        </div>

        {/* Functional Boundaries */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{isRtl ? 'حدود الوظيفة والمسؤولية الأمنية' : 'Operational Boundaries & Disclaimer'}</span>
          </div>
          <p>
            {isRtl
              ? 'تعتبر 4T-LINK أداة مساعدة للفرز الأولي وتقييم المخاطر، وليست بديلاً شاملاً عن أنظمة حماية النقاط الطرفية (EDR)، أو مراكز مراقبة العمليات الأمنية (SIEM/SOC)، أو بيئات العزل الديناميكية (Sandboxes).'
              : '4T-LINK is an initial triage and risk estimation assistant. It is not an enterprise replacement for active EDR agents, SIEM correlation engines, or isolated malware detestation sandboxes.'}
          </p>
        </div>
      </div>
    </div>
  );
};
