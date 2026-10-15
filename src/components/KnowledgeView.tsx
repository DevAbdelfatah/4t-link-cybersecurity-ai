import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, Terminal, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useCyber } from '../context/CyberContext.tsx';

export const KnowledgeView: React.FC = () => {
  const { isRtl, t } = useCyber();
  const [openSection, setOpenSection] = useState<string>('phishing');

  const guides = [
    {
      id: 'phishing',
      title: isRtl ? 'تشريح هجمات التصيد الاحتيالي وتضليل الروابط' : 'Anatomy of Phishing & URL Deception',
      content: isRtl ? (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            تعتمد أكثر من 85% من هجمات التصيد الإلكتروني على تضليل المستخدم لفتح صفحة تحاكي الخدمات الموثوقة لسرقة بيانات الدخول أو رموز التحقق (OTP/2FA).
          </p>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-2">
            <div className="font-bold text-[#38BDF8]">1. حيلة النطاقات الفرعية العميقة (Deep Subdomains):</div>
            <p className="text-slate-400">
              المهاجم يمتلك نطاقًا رخيصًا مثل <code className="text-rose-400 font-mono">evil-portal.xyz</code>، ثم ينشئ نطاقًا فرعيًا باسم <code className="text-amber-400 font-mono">login.microsoft.com.evil-portal.xyz</code>. في متصفح الهاتف، يتم اقتصاص شريط العنوان ليظهر للمستخدم كلمة <code className="text-slate-200 font-mono">login.microsoft.com</code> فقط!
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-2">
            <div className="font-bold text-[#38BDF8]">2. خديعة رمز @ في الروابط (RFC 3986 Userinfo):</div>
            <p className="text-slate-400">
              وفق مواصفات الويب، يُعامل ما قبل رمز @ كاسم مستخدم. لذا فالرابط <code className="text-amber-400 font-mono">https://google.com@attacker.com</code> سيوجه المتصفح في الحقيقة إلى <code className="text-rose-400 font-mono">attacker.com</code> وليس جوجل!
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-2">
            <div className="font-bold text-[#38BDF8]">3. أسطورة أمان القفل الأخضر (HTTPS Fallacy):</div>
            <p className="text-slate-400">
              بروتوكول HTTPS يعني تشفير قناة الاتصال أثناء النقل فقط، ولا يضمن أبدًا هوية أو نوايا مالك الموقع. أكثر من 80% من صفحات التصيد النشطة تستخدم شهادات SSL مجانية صادرة من Let's Encrypt أو Cloudflare.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Over 85% of credential harvesting operations rely on deceiving users with fraudulent interfaces masquerading as legitimate portals to steal session tokens, passwords, and 2FA secrets.
          </p>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-2">
            <div className="font-bold text-[#38BDF8]">1. Deep Subdomain Brand Masquerading:</div>
            <p className="text-slate-400">
              An adversary controls an arbitrary domain like <code className="text-rose-400 font-mono">auth-gateway.cfd</code> and crafts subdomains such as <code className="text-amber-400 font-mono">login.paypal.com.auth-gateway.cfd</code>. On mobile devices with narrow URL bars, the trailing attacker domain is visually truncated.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-2">
            <div className="font-bold text-[#38BDF8]">2. RFC 3986 Userinfo '@' Confusion:</div>
            <p className="text-slate-400">
              In standard URL syntax, characters before the '@' sign are treated as user credentials. The link <code className="text-amber-400 font-mono">https://trusted-bank.com@evil-site.net</code> lands on <code className="text-rose-400 font-mono">evil-site.net</code>, completely ignoring the trusted brand prefix.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-2">
            <div className="font-bold text-[#38BDF8]">3. The HTTPS Encryption Myth:</div>
            <p className="text-slate-400">
              HTTPS only validates encrypted transit between client and host; it does NOT authenticate site legitimacy. Modern automated phishing toolkits provision free TLS certificates via ACME protocols in seconds.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'homograph',
      title: isRtl ? 'هجمات الهوموغراف (Homoglyphs & IDN Spoofing)' : 'Homograph Attacks & IDN Spoofing',
      content: isRtl ? (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            هجوم الهوموغراف يستغل ميزة أسماء النطاقات الدولية (IDN) لعرض أحرف من أبجديات مختلفة (كالكريلية أو اليونانية) تتطابق شكليًا بنسبة 100% مع الأحرف اللاتينية الإنجليزية.
          </p>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="text-slate-400">الحرف الإنجليزي 'a' (U+0061) مقابل الحرف الكريلي 'а' (U+0430):</div>
            <div className="text-[#22C55E]">Latin 'apple.com' vs Cyrillic 'аpple.com'</div>
            <div className="text-amber-400">Punycode الفعلي للنطاق الكريلي: xn--pple-43d.com</div>
          </div>
          <p className="text-slate-400">
            تكتشف 4T-LINK هذه الهجمات عبر فحص محارف اليونيكود مباشرة والتحقق من بادئة Punycode (<code className="text-[#38BDF8] font-mono">xn--</code>) لكشف أي محاولة انتحال هجين.
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Internationalized Domain Names (IDN) allow domains in native scripts. Adversaries exploit homoglyphs—glyphs from foreign character sets (e.g. Cyrillic, Greek) that look identical to ASCII characters.
          </p>
          <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="text-slate-400">Comparison of ASCII 'a' (U+0061) vs Cyrillic 'а' (U+0430):</div>
            <div className="text-[#22C55E]">ASCII: apple.com</div>
            <div className="text-rose-400">Cyrillic spoof: аpple.com</div>
            <div className="text-amber-400">Underlying Punycode wire format: xn--pple-43d.com</div>
          </div>
          <p className="text-slate-400">
            4T-LINK identifies these threats by parsing Punycode prefixes (<code className="text-[#38BDF8] font-mono">xn--</code>) and checking character codepoints against cross-script homoglyph tables.
          </p>
        </div>
      )
    },
    {
      id: 'incident',
      title: isRtl ? 'دليل الاستجابة للحوادث عند النقر على رابط مشبوه' : 'Incident Response Playbook: Suspicious Link Clicks',
      content: isRtl ? (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="font-bold text-rose-400">المرحلة 1: العزل والاحتواء الفوري</span>
              <p className="text-slate-400 mt-1">
                افصل الجهاز فورًا عن الشبكة السلكية واللاسلكية (Wi-Fi/Ethernet) لمنع الانتشار الجانبي (Lateral Movement) أو الاتصال بخوادم التحكم C2.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="font-bold text-amber-400">المرحلة 2: إبطال الهوية والجلسات</span>
              <p className="text-slate-400 mt-1">
                من جهاز نظيف منفصل، قم بتسجيل الخروج من كافة الجلسات النشطة (Revoke Active Sessions)، وتغيير كلمات المرور وإعادة تهيئة مفاتيح المصادقة الثنائية 2FA.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="font-bold text-[#38BDF8]">المرحلة 3: التحقيق الجنائي والأدلة الرقمية</span>
              <p className="text-slate-400 mt-1">
                افحص مجلد التنزيلات والذاكرة المؤقتة للبحث عن أي ملفات تنفيذية محملة. استخرج عنوان النطاق والـ IP وأضفهما إلى قائمة الحظر في جدار الحماية وDNS Sinkhole.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="font-bold text-rose-400">Phase 1: Immediate Network Containment</span>
              <p className="text-slate-400 mt-1">
                Immediately sever Wi-Fi and Ethernet network connections on the endpoint to halt lateral movement, beaconing, and C2 callback traffic.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="font-bold text-amber-400">Phase 2: Identity & Session Revocation</span>
              <p className="text-slate-400 mt-1">
                From an uncompromised administrative machine, terminate all active OAuth/SAML session tokens, force password resets, and rotate multi-factor authentication (MFA) devices.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#080B12] border border-slate-800">
              <span className="font-bold text-[#38BDF8]">Phase 3: Digital Forensics & Perimeter Blocking</span>
              <p className="text-slate-400 mt-1">
                Inspect browser download directories and memory buffers. Submit observed IOCs (domain, IP, URL hashes) to enterprise firewall blocklists and DNS Sinkhole policies.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ssrf',
      title: isRtl ? 'حماية خوادم الفحص من هجمات SSRF و DNS Rebinding' : 'SSRF Mitigation & Defensive Crawler Security',
      content: isRtl ? (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            عند بناء نظام لفحص الروابط، يمثل جلب صفحات الويب (HTTP Fetching) خطرًا أمنيًا كبيرًا يُعرف بـ Server-Side Request Forgery (SSRF).
          </p>
          <ul className="list-disc ms-4 text-slate-400 space-y-1">
            <li><strong>حظر نطاقات IP الخاصة:</strong> منع الاتصال التام بعناوين 127.0.0.1، 10.0.0.0/8، 192.168.0.0/16 وعناوين البيانات السحابية (169.254.169.254).</li>
            <li><strong>الوقاية من DNS Rebinding:</strong> التحقق من الـ IP الناتج بعد حل DNS مباشرة، وقبل إجراء أي اتصال فعلي.</li>
            <li><strong>التحليل الساكن أولاً:</strong> تطبيق الفحص الهيكلي الآمن (Static Heuristics) دون الحاجة لتحميل أكواد JavaScript أو وسائط الموقع المشبوه.</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Automated URL scanning engines face acute risks of Server-Side Request Forgery (SSRF) when fetching user-supplied links.
          </p>
          <ul className="list-disc ms-4 text-slate-400 space-y-1">
            <li><strong>Strict IP Allowlisting / Denylisting:</strong> Strictly reject private ranges (RFC 1918), loopback (127.0.0.0/8), and cloud metadata endpoints (169.254.169.254).</li>
            <li><strong>DNS Rebinding Defense:</strong> Resolve DNS and validate the destination IP immediately before initiating the TCP socket handshake.</li>
            <li><strong>Static Inspection Priority:</strong> Perform structural heuristic and DNS analysis first without blindly executing untrusted remote JavaScript.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B12] text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl bg-[#0E1522] border border-slate-800 p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-[#22C55E]" />
            <span>{t('knowledge')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isRtl
              ? 'أدلة إرشادية متخصصة ومفاهيم فنية تشرح آليات التهديدات السيبرانية وكيفية الوقاية منها.'
              : 'Defensive engineering playbooks, threat modeling guides, and incident response checklists.'}
          </p>
        </div>

        {/* Guides List */}
        <div className="space-y-4">
          {guides.map((g) => {
            const isOpen = openSection === g.id;
            return (
              <div
                key={g.id}
                className="rounded-xl bg-[#0E1522] border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenSection(isOpen ? '' : g.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-start hover:bg-slate-800/40 transition-colors"
                >
                  <span className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                    <span>{g.title}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-slate-800/80">
                    {g.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
