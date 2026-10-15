import { ThreatIndicator, URLAnalysisResult, RiskLevel, IndicatorSeverity } from '../src/types/cyber.ts';

// Known popular URL shortener hostnames
const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'goo.gl', 'ow.ly', 'buff.ly',
  'cutt.ly', 'rb.gy', 'bl.ink', 'shorturl.at', 'tiny.cc', 'rebrand.ly',
  'soo.gd', 's.id', 'clck.ru', 'v.gd', 'tr.ee', 'linktr.ee'
]);

// Suspicious / high-abuse TLDs frequently seen in bulk automated spam/phishing
const SUSPICIOUS_TLDS = new Set([
  'cfd', 'top', 'rest', 'buzz', 'icu', 'cam', 'work', 'click', 'live',
  'fit', 'casa', 'tk', 'ml', 'ga', 'cf', 'gq', 'sbs', 'bond', 'quest'
]);

// Target brand list for impersonation detection
const TARGET_BRANDS: Record<string, string[]> = {
  paypal: ['paypal.com'],
  microsoft: ['microsoft.com', 'live.com', 'office.com', 'outlook.com', 'msn.com', 'azure.com'],
  apple: ['apple.com', 'icloud.com'],
  google: ['google.com', 'gmail.com', 'youtube.com'],
  netflix: ['netflix.com'],
  amazon: ['amazon.com', 'aws.amazon.com'],
  binance: ['binance.com'],
  facebook: ['facebook.com', 'meta.com'],
  instagram: ['instagram.com'],
  coinbase: ['coinbase.com'],
  metamask: ['metamask.io'],
  chase: ['chase.com'],
  dhl: ['dhl.com'],
  fedex: ['fedex.com'],
  steam: ['steampowered.com', 'steamcommunity.com'],
  discord: ['discord.com', 'discord.gg'],
  telegram: ['telegram.org', 't.me'],
  whatsapp: ['whatsapp.com']
};

// Security-sensitive deceptive keywords
const DECEPTIVE_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'verification', 'secure', 'security',
  'account-update', 'billing', 'support', 'wallet', 'claim', 'airdrop', 'recover',
  'recovery', '2fa', 'otp', 'auth', 'passcode', 'credential', 'suspended', 'unlock'
];

// Dangerous file extensions
const DANGEROUS_EXTENSIONS = [
  '.exe', '.scr', '.bat', '.cmd', '.ps1', '.vbs', '.iso', '.img', '.apk',
  '.dmg', '.hta', '.jar', '.msi', '.dll', '.wsf', '.pif', '.reg'
];

// Cyrillic / Greek lookalikes map for homograph detection
const HOMOGLYPHS: Record<string, string> = {
  '\u0430': 'a', // Cyrillic small letter a
  '\u0441': 'c', // Cyrillic small letter es
  '\u0435': 'e', // Cyrillic small letter ie
  '\u043E': 'o', // Cyrillic small letter o
  '\u0440': 'p', // Cyrillic small letter er
  '\u0445': 'x', // Cyrillic small letter ha
  '\u0443': 'y', // Cyrillic small letter u
  '\u0456': 'i', // Cyrillic small letter byelorussian-ukrainian i
  '\u0458': 'j', // Cyrillic small letter je
  '\u0455': 's', // Cyrillic small letter dze
  '\u0410': 'A',
  '\u0412': 'B',
  '\u0421': 'C',
  '\u0415': 'E',
  '\u041D': 'H',
  '\u041E': 'O',
  '\u0420': 'P',
  '\u0422': 'T',
  '\u0425': 'X',
  '\u03B1': 'a', // Greek alpha
  '\u03BF': 'o', // Greek omicron
  '\u03C1': 'p', // Greek rho
  '\u03BD': 'v'  // Greek nu
};

// Calculate Shannon entropy of string
export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const len = str.length;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

// Check if string is an IPv4 or IPv6 address
export function isIpAddress(host: string): boolean {
  // Strip bracket for IPv6
  const cleanHost = host.replace(/^\[|\]$/g, '');
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipv4Regex.test(cleanHost) || ipv6Regex.test(cleanHost);
}

// Check if IP is private/local/reserved (SSRF hazard)
export function isPrivateIp(ip: string): boolean {
  const cleanIp = ip.replace(/^\[|\]$/g, '');
  if (cleanIp === 'localhost' || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === '0.0.0.0') {
    return true;
  }
  const parts = cleanIp.split('.').map(Number);
  if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link Local / AWS Metadata 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
  }
  // IPv6 ULA (fc00::/7) or Link-local (fe80::/10)
  if (/^f[cd][0-9a-f]{2}:/i.test(cleanIp) || /^fe80:/i.test(cleanIp)) {
    return true;
  }
  return false;
}

// Parse domain components accurately
export function parseDomainParts(hostname: string): { rootDomain: string; subdomain: string; tld: string } {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 1) {
    return { rootDomain: hostname, subdomain: '', tld: '' };
  }
  // Handle two-part TLDs like .co.uk, .com.br, .gov.eg, .org.sa
  const twoPartTLDs = new Set([
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'net.au', 'org.au',
    'co.jp', 'com.br', 'gov.eg', 'com.eg', 'org.eg', 'com.sa', 'org.sa',
    'gov.sa', 'edu.sa', 'co.za', 'com.tr', 'gov.tr'
  ]);
  const lastTwo = parts.slice(-2).join('.');
  let tld = '';
  let rootDomain = '';
  let subdomain = '';

  if (parts.length >= 3 && twoPartTLDs.has(lastTwo)) {
    tld = lastTwo;
    rootDomain = parts.slice(-3).join('.');
    subdomain = parts.slice(0, -3).join('.');
  } else {
    tld = parts[parts.length - 1];
    rootDomain = parts.slice(-2).join('.');
    subdomain = parts.slice(0, -2).join('.');
  }

  return { rootDomain, subdomain, tld };
}

// Main static heuristic inspection engine
export function inspectUrlHeuristics(rawInput: string): URLAnalysisResult {
  const id = 'analysis_' + Math.random().toString(36).substring(2, 10);
  const analyzedAt = new Date().toISOString();

  let trimmed = rawInput.trim();
  // Strip control chars
  trimmed = trimmed.replace(/[\x00-\x1F\x7F]/g, '');

  let urlObj: URL | null = null;
  let protocol: 'https' | 'http' | 'other' = 'other';
  let port: string | undefined = undefined;

  // Normalize protocol
  if (!/^https?:\/\//i.test(trimmed)) {
    try {
      urlObj = new URL('https://' + trimmed);
      protocol = 'https';
    } catch {
      // Invalid format
    }
  } else {
    try {
      urlObj = new URL(trimmed);
      protocol = urlObj.protocol.replace(':', '').toLowerCase() as any;
    } catch {
      // Invalid format
    }
  }

  if (!urlObj) {
    return {
      id,
      analyzedAt,
      inputUrl: rawInput,
      normalizedUrl: rawInput,
      protocol: 'other',
      riskScore: 60,
      riskLevel: 'Unknown',
      domainIntel: {
        domain: rawInput,
        rootDomain: rawInput,
        subdomain: '',
        tld: '',
        isIpAddress: false,
        entropy: 0,
        isPunycode: false,
        rdapQueried: false
      },
      indicators: [
        {
          id: 'invalid-url-format',
          category: 'protocol',
          title: 'Malformed URL Syntax',
          titleAr: 'بنية الرابط غير صالحة أو غير متوافقة مع RFC 3986',
          description: 'The supplied string could not be parsed as a compliant web URL.',
          descriptionAr: 'تعذر تحليل السلسلة المدخلة كرابط ويب صالح وفق معايير RFC 3986.',
          severity: 'medium',
          scoreContribution: 40
        }
      ],
      passedChecks: [],
      uncheckedSources: [
        { source: 'External Reputation', reason: 'Malformed URL could not be parsed for query.', reasonAr: 'الرابط غير صالح للبحث في قواعد السمعة.' }
      ],
      providers: [],
      recommendations: {
        summary: 'Cannot verify safety due to malformed link syntax.',
        summaryAr: 'لا يمكن التحقق من سلامة الرابط بسبب عدم صحة بنيته.',
        actions: ['Do not click or open malformed or obfuscated links.'],
        actionsAr: ['تجنب النقر على الروابط المشوهة أو غير الصالحة بنيويًا.'],
        technicalGuidance: ['Inspect original email headers or message context to retrieve the authentic destination.'],
        technicalGuidanceAr: ['افحص ترويسة الرسالة أو السياق الأصلي لاستخراج العنوان الصحيح المقصود.']
      },
      disclaimer: 'Heuristic evaluation only. Malformed URLs often attempt parser confusion attacks.',
      disclaimerAr: 'تقييم إرشادي فقط. الروابط المشوهة غالبًا ما تحاول إرباك أنظمة التحليل.'
    };
  }

  const hostname = urlObj.hostname.toLowerCase();
  port = urlObj.port || (protocol === 'https' ? '443' : '80');
  const path = urlObj.pathname + urlObj.search + urlObj.hash;
  const { rootDomain, subdomain, tld } = parseDomainParts(hostname);
  const entropy = calculateEntropy(rootDomain.replace('.' + tld, ''));
  const indicators: ThreatIndicator[] = [];
  const passedChecks: { title: string; titleAr: string; details: string }[] = [];

  // Check 1: Protocol Security (HTTP vs HTTPS)
  if (protocol === 'http') {
    indicators.push({
      id: 'unencrypted-http',
      category: 'protocol',
      title: 'Unencrypted HTTP Transport',
      titleAr: 'بروتوكول HTTP غير مشفر',
      description: 'Communication is transmitted in plain text, making it vulnerable to interception, manipulation, or credential theft.',
      descriptionAr: 'يتم إرسال البيانات كنص واضح دون تشفير، مما يعرضها للاعتراض والتلاعب أو سرقة بيانات الاعتماد.',
      severity: 'medium',
      scoreContribution: 20
    });
  } else if (protocol === 'https') {
    passedChecks.push({
      title: 'HTTPS Encryption Enabled',
      titleAr: 'تشفير HTTPS مفعّل',
      details: 'Transport is TLS encrypted. Note: HTTPS does not guarantee the site is non-malicious, as over 80% of modern phishing sites use free SSL certificates.'
    });
  }

  // Check 2: Direct IP Address Usage (SSRF & Host concealment)
  const isHostAnIp = isIpAddress(hostname);
  const isPrivate = isHostAnIp ? isPrivateIp(hostname) : false;

  if (isHostAnIp) {
    if (isPrivate) {
      indicators.push({
        id: 'private-internal-ip',
        category: 'ip',
        title: 'Private/Local IP Address (SSRF Risk)',
        titleAr: 'عنوان IP خاص أو محلي (مخاطر SSRF)',
        description: `URL points to a private or reserved network address (${hostname}). In production, fetching this could trigger Server-Side Request Forgery or internal network reconnaissance.`,
        descriptionAr: `الرابط يشير إلى عنوان شبكة خاص أو محلي (${hostname}). محاولة جلبه قد تؤدي إلى هجمات SSRF واستهداف الأنظمة الداخلية.`,
        severity: 'critical',
        scoreContribution: 45,
        evidence: `IP: ${hostname}`
      });
    } else {
      indicators.push({
        id: 'raw-public-ip',
        category: 'ip',
        title: 'Raw Public IP Hostname',
        titleAr: 'استخدام عنوان IP رقمي مباشر بدل اسم النطاق',
        description: 'Attackers commonly use raw IP addresses to bypass domain reputation blocks and avoid domain registration oversight.',
        descriptionAr: 'يستخدم المهاجمون عناوين IP مباشرة لتجاوز آليات حظر النطاقات وتفادي مراقبة سجلات تسجيل أسماء النطاقات.',
        severity: 'high',
        scoreContribution: 30,
        evidence: `Direct IP: ${hostname}`
      });
    }
  } else {
    passedChecks.push({
      title: 'Standard Domain Name Host',
      titleAr: 'اسم نطاق قياسي وليس عنوان IP مباشر',
      details: `Target uses registered domain name structure: ${hostname}`
    });
  }

  // Check 3: URL Shortener
  if (SHORTENER_DOMAINS.has(hostname) || SHORTENER_DOMAINS.has(rootDomain)) {
    indicators.push({
      id: 'url-shortener-service',
      category: 'shortener',
      title: 'URL Shortener Detected',
      titleAr: 'اكتشاف استخدام خدمة اختصار روابط',
      description: `Domain (${hostname}) is a known link shortening service. This hides the final destination URL and prevents immediate inspection.`,
      descriptionAr: `النطاق (${hostname}) يتبع خدمة اختصار روابط معروفة. هذا يخفي الوجهة النهائية الحقيقية للرابط ويمنع فحصها المباشر.`,
      severity: 'medium',
      scoreContribution: 25,
      evidence: `Shortener host: ${hostname}`
    });
  }

  // Check 4: Suspicious URL Obfuscation & Encoded Characters
  if (/%25/i.test(rawInput)) {
    indicators.push({
      id: 'double-percent-encoding',
      category: 'obfuscation',
      title: 'Double Percent-Encoding Detected',
      titleAr: 'اكتشاف ترميز مكرر (Double Percent-Encoding)',
      description: 'The URL contains %25 sequences, commonly used to bypass web application firewalls and URL filters.',
      descriptionAr: 'يحتوي الرابط على تسلسل %25 للترميز المزدوج، وهو أسلوب شائع لمحاولة تجاوز جدران الحماية WAF وفلاتر الروابط.',
      severity: 'high',
      scoreContribution: 25
    });
  }

  if (/%2f|%5c|%2e%2e/i.test(rawInput)) {
    indicators.push({
      id: 'encoded-path-delimiters',
      category: 'obfuscation',
      title: 'Encoded Path Traversal Characters',
      titleAr: 'محارف مسار مشفرة أو محاولات Path Traversal',
      description: 'The URL contains encoded slashes (%2F, %5C) or directory dots (%2E%2E) that may attempt directory traversal or WAF evasion.',
      descriptionAr: 'يحتوي الرابط على فواصل مسار مشفرة أو محاولات تخطي الدلائل لاختبار ثغرات السيرفر.',
      severity: 'high',
      scoreContribution: 25
    });
  }

  // Check 5: Embedded Credentials (@ Trick)
  if (rawInput.includes('@') && !rawInput.startsWith('mailto:')) {
    indicators.push({
      id: 'at-symbol-login-trick',
      category: 'obfuscation',
      title: 'Embedded Credentials / @ Redirection Trick',
      titleAr: 'استخدام رمز @ للتضليل أو بيانات اعتماد مضمنة',
      description: 'The URL contains an "@" character. In RFC 3986, text before the "@" is treated as user credentials, redirecting users to the domain following the "@". This is a classic phishing deception technique.',
      descriptionAr: 'يحتوي الرابط على محرف @. وفق مواصفات RFC 3986، يُعامل ما قبل @ كبيانات دخول بينما النطاق الفعلي هو ما بعد @، وهو أسلوب كلاسيكي لخداع المستخدمين.',
      severity: 'critical',
      scoreContribution: 40,
      evidence: rawInput
    });
  }

  // Check 6: Homograph & Punycode (IDN) Attack Detection
  const isPunycode = hostname.includes('xn--');
  let hasHomoglyph = false;
  const detectedHomoglyphs: string[] = [];

  for (let i = 0; i < hostname.length; i++) {
    const char = hostname[i];
    if (HOMOGLYPHS[char]) {
      hasHomoglyph = true;
      detectedHomoglyphs.push(`'${char}' (mimics Latin '${HOMOGLYPHS[char]}')`);
    }
  }

  if (isPunycode) {
    indicators.push({
      id: 'punycode-international-domain',
      category: 'homograph',
      title: 'Punycode Internationalized Domain (IDN)',
      titleAr: 'نطاق دولي بنظام Punycode (IDN)',
      description: `Domain contains 'xn--' prefix (${hostname}). While valid for non-Latin languages, it is frequently leveraged to visually impersonate trusted brands using identical-looking glyphs.`,
      descriptionAr: `النطاق يحتوي على بادئة 'xn--' (${hostname}). رغم أنها مشروعة للغات غير اللاتينية، إلا أنها تستغل بكثرة لانتحال النطاقات الشهيرة بأحرف متطابقة شكليًا.`,
      severity: 'high',
      scoreContribution: 30,
      evidence: `Host: ${hostname}`
    });
  }

  if (hasHomoglyph) {
    indicators.push({
      id: 'homoglyph-attack-detected',
      category: 'homograph',
      title: 'Homograph Attack (Visual Lookalike Characters)',
      titleAr: 'هجوم هوموغراف (أحرف متشابهة بصريًا)',
      description: `Domain contains Unicode characters visually resembling standard Latin characters: ${detectedHomoglyphs.join(', ')}. This is a strong indicator of targeted domain spoofing.`,
      descriptionAr: `النطاق يحتوي على أحرف يونيكود تشبه بصريًا الأحرف اللاتينية: ${detectedHomoglyphs.join(', ')}. هذا مؤشر قوي على محاولة انتحال بصري.`,
      severity: 'critical',
      scoreContribution: 40,
      evidence: detectedHomoglyphs.join('; ')
    });
  }

  // Check 7: Brand Impersonation & Deceptive Subdomains
  const lowerUrl = rawInput.toLowerCase();
  for (const [brand, officialDomains] of Object.entries(TARGET_BRANDS)) {
    const isBrandMentioned = lowerUrl.includes(brand);
    if (isBrandMentioned) {
      const isOfficial = officialDomains.some(d => rootDomain === d || hostname === d || hostname.endsWith('.' + d));
      if (!isOfficial) {
        indicators.push({
          id: `brand-spoof-${brand}`,
          category: 'brand',
          title: `Brand Impersonation Target: ${brand.toUpperCase()}`,
          titleAr: `انتحال علامة تجارية معروفة: ${brand.toUpperCase()}`,
          description: `The URL references '${brand}', but the root domain '${rootDomain}' is NOT owned by ${brand} (official domains: ${officialDomains.join(', ')}).`,
          descriptionAr: `يشير الرابط إلى '${brand}'، لكن النطاق الأساسي '${rootDomain}' ليس مملوكًا رسميًا للعلامة (${officialDomains.join(', ')}).`,
          severity: 'critical',
          scoreContribution: 45,
          evidence: `Mentioned: ${brand} on unofficial domain: ${rootDomain}`
        });
        break; // Match first major brand
      }
    }
  }

  // Check 8: Deceptive Security Keywords in Subdomain or Path
  const deceptiveMatches = DECEPTIVE_KEYWORDS.filter(kw => hostname.includes(kw) || path.toLowerCase().includes(kw));
  if (deceptiveMatches.length > 0 && indicators.some(i => i.category === 'brand' || i.category === 'homograph')) {
    indicators.push({
      id: 'deceptive-credential-keywords',
      category: 'brand',
      title: 'Phishing Credential Keywords Present',
      titleAr: 'كلمات مفتاحية خاصة بتصيد بيانات الحسابات',
      description: `URL includes high-risk security keywords (${deceptiveMatches.slice(0, 4).join(', ')}) combined with suspicious domain context.`,
      descriptionAr: `يتضمن الرابط كلمات اصطياد أمنية حساسة (${deceptiveMatches.slice(0, 4).join(', ')}) متزامنة مع نطاق مشبوه.`,
      severity: 'high',
      scoreContribution: 25,
      evidence: `Matched: ${deceptiveMatches.join(', ')}`
    });
  }

  // Check 9: Excessive Subdomain Depth
  const subParts = subdomain ? subdomain.split('.').filter(Boolean) : [];
  if (subParts.length >= 3) {
    indicators.push({
      id: 'excessive-subdomains',
      category: 'domain',
      title: 'Excessive Subdomain Depth',
      titleAr: 'تعدد مريب في النطاقات الفرعية (Subdomains)',
      description: `Domain contains ${subParts.length} subdomain tiers (${subdomain}). Phishers often nest brand names into deep subdomains to mislead mobile users whose browser address bar is truncated.`,
      descriptionAr: `يحتوي النطاق على ${subParts.length} مستويات نطاقات فرعية. يلجأ المهاجمون لهذا الأسلوب لإخفاء النطاق الحقيقي خاصة في شاشات الهواتف.`,
      severity: 'medium',
      scoreContribution: 20,
      evidence: `Subdomains: ${subdomain}`
    });
  }

  // Check 10: Dangerous Executable / Script Extensions in Path
  const lowerPath = path.toLowerCase();
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (lowerPath.endsWith(ext) || lowerPath.includes(ext + '?') || lowerPath.includes(ext + '#')) {
      indicators.push({
        id: `dangerous-file-extension-${ext.replace('.', '')}`,
        category: 'path',
        title: `Executable / Script Download Payload (${ext})`,
        titleAr: `ملف تنفيذي أو برمجي خبيث محتمل (${ext})`,
        description: `URL points directly to an executable or scriptable file (${ext}) commonly leveraged for malware drop, drive-by download, or ransomware execution.`,
        descriptionAr: `يشير الرابط مباشرة إلى ملف تنفيذي أو برمجي (${ext}) يرتبط عادةً بنشر البرمجيات الخبيثة وبرامج الفدية.`,
        severity: 'critical',
        scoreContribution: 45,
        evidence: `Extension: ${ext}`
      });
      break;
    }
  }

  // Check 11: Non-standard Port
  if (port && port !== '80' && port !== '443') {
    indicators.push({
      id: 'non-standard-web-port',
      category: 'protocol',
      title: `Non-Standard Web Port (:${port})`,
      titleAr: `منفذ اتصال غير قياسي (:${port})`,
      description: `Web traffic is directed to port ${port} instead of 80 (HTTP) or 443 (HTTPS). Malicious C2 panels, proxy relays, and phishing kits often host on custom ports to bypass inspection.`,
      descriptionAr: `حركة الويب موجهة للمنفذ ${port} بدلاً من 80 أو 443. غالبًا ما تستخدم خوادم التحكم C2 وبوابات الوساطة منافذ مخصصة لتجاوز الفحص.`,
      severity: 'medium',
      scoreContribution: 20,
      evidence: `Port: ${port}`
    });
  }

  // Check 12: High Entropy Domain Name (DGA / Burner indicator)
  if (entropy > 3.8 && rootDomain.length > 12 && !isHostAnIp) {
    indicators.push({
      id: 'high-domain-entropy',
      category: 'entropy',
      title: 'High Domain Randomness / Possible DGA',
      titleAr: 'عشوائية عالية في اسم النطاق (اشتباه DGA)',
      description: `Domain has high Shannon entropy (${entropy}), suggesting an algorithmically generated (DGA) or machine-randomized burner domain.`,
      descriptionAr: `اسم النطاق يمتلك عشوائية شانون عالية (${entropy})، مما يشير إلى نطاق مولّد خوارزميًا (DGA) أو مؤقت للاستخدام السريع.`,
      severity: 'medium',
      scoreContribution: 20,
      evidence: `Entropy: ${entropy}`
    });
  }

  // Check 13: High-Abuse TLD
  if (SUSPICIOUS_TLDS.has(tld)) {
    indicators.push({
      id: `high-abuse-tld-${tld}`,
      category: 'domain',
      title: `High-Abuse Top Level Domain (.${tld})`,
      titleAr: `نطاق علوي مرتفع الخطورة وسجلات الاحتيال (.${tld})`,
      description: `The .${tld} TLD has documented statistical correlation with disposable phishing domains and spam campaigns due to cheap or unverified registration policies.`,
      descriptionAr: `النطاق .${tld} يسجل إحصائيًا معدلات عالية من حملات الاحتيال والرسائل المزعجة بسبب تدني كلفة التسجيل وضعف التحقق.`,
      severity: 'low',
      scoreContribution: 15,
      evidence: `TLD: .${tld}`
    });
  }

  // Calculate Aggregated Risk Score
  let rawScore = 0;
  for (const ind of indicators) {
    rawScore += ind.scoreContribution;
  }
  // Cap at 100
  const riskScore = Math.min(100, Math.max(0, rawScore));

  let riskLevel: RiskLevel = 'Low';
  if (riskScore >= 75) {
    riskLevel = 'Critical';
  } else if (riskScore >= 50) {
    riskLevel = 'High';
  } else if (riskScore >= 25) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'Low';
  }

  // Prepare recommendations
  let summary = '';
  let summaryAr = '';
  const actions: string[] = [];
  const actionsAr: string[] = [];
  const technicalGuidance: string[] = [];
  const technicalGuidanceAr: string[] = [];

  if (riskLevel === 'Critical' || riskLevel === 'High') {
    summary = `High probability of malicious intent or deceptive spoofing detected (${indicators.length} threat indicators observed).`;
    summaryAr = `احتمالية عالية لوجود خداع أو نية خبيثة بناءً على المؤشرات المرصودة (${indicators.length} مؤشر).`;
    actions.push('Do NOT open the link, enter credentials, or download attachments.');
    actions.push('Report the link to your organization’s SOC / Security team immediately.');
    actions.push('If opened recently, disconnect the machine, purge browser session tokens, and change credentials.');
    actionsAr.push('لا تفتح الرابط مطلقًا، وتجنب إدخال أي كلمات مرور أو تنزيل ملفات منه.');
    actionsAr.push('بلّغ فريق أمن المعلومات SOC أو مسؤول تقنية المعلومات فورًا.');
    actionsAr.push('إذا تم فتحه مؤخرًا، افصل الجهاز وافحص الجلسات وقم بتغيير كلمات المرور.');
    technicalGuidance.push('Blacklist host/IP on DNS Sinkhole and perimeter EDR/Firewall rules.');
    technicalGuidance.push('Search proxy logs (SIEM) for other internal endpoints that queried this hostname.');
    technicalGuidanceAr.push('أضف النطاق/الـ IP لقوائم الحظر عبر DNS Sinkhole وجدران الحماية EDR.');
    technicalGuidanceAr.push('ابحث في سجلات الوكيل (SIEM) عن أي أجهزة داخلية حاولت الاتصال بهذا النطاق.');
  } else if (riskLevel === 'Medium') {
    summary = `Suspicious characteristics observed. Exercise caution before trusting this destination.`;
    summaryAr = `تمت ملاحظة خصائص مشبوهة. يُرجى توخي الحذر الشديد قبل التعامل مع هذه الوجهة.`;
    actions.push('Inspect the link origin carefully; verify sender address if received via email or SMS.');
    actions.push('Never enter sensitive credentials or OTP codes on unverified pages.');
    actionsAr.push('تحقق من مصدر الرسالة بعناية سواء وردتك عبر البريد أو الرسائل القصيرة.');
    actionsAr.push('لا تُدخل أي بيانات حساسة أو رموز تحقق OTP في صفحات غير مؤكدة.');
    technicalGuidance.push('Inspect WHOIS registration age and examine sandbox behavior before whitelisting.');
    technicalGuidanceAr.push('تحقق من عمر تسجيل النطاق وافحصه في بيئة معزولة Sandbox قبل السماح به.');
  } else {
    summary = `No high-severity structural indicators were detected during static heuristic analysis.`;
    summaryAr = `لم تُرصد مؤشرات شكلية عالية الخطورة أثناء التحليل الإرشادي الأولي.`;
    actions.push('Continue standard safe browsing practices.');
    actions.push('Remember that clean static indicators do not guarantee zero risk on compromised legitimate sites.');
    actionsAr.push('واصل تطبيق ممارسات التصفح الآمن المعتادة.');
    actionsAr.push('تذكر أن سلامة المؤشرات الشكلية لا تعني الأمان المطلق في حال اختراق الموقع الموثوق.');
    technicalGuidance.push('Verify SSL certificate validity and monitor endpoint runtime network activity.');
    technicalGuidanceAr.push('تحقق من صحة شهادة SSL ومراقبة الاتصالات في الوقت الفعلي.');
  }

  const uncheckedSources = [
    {
      source: 'Full Live Page Crawl / DOM Inspection',
      reason: 'Live dynamic browser execution was intentionally not performed to protect against SSRF and drive-by malware exploits.',
      reasonAr: 'تم تعطيل الجلب التلقائي الكامل لحماية الخادم والمستخدم من هجمات SSRF وتنفيذ الأكواد الخبيثة.'
    }
  ];

  return {
    id,
    analyzedAt,
    inputUrl: rawInput,
    normalizedUrl: urlObj.toString(),
    protocol,
    port,
    riskScore,
    riskLevel,
    domainIntel: {
      domain: hostname,
      rootDomain,
      subdomain,
      tld,
      isIpAddress: isHostAnIp,
      isPrivateIp: isPrivate,
      entropy,
      isPunycode,
      unicodeDomain: isPunycode ? hostname : undefined,
      rdapQueried: false
    },
    indicators,
    passedChecks,
    uncheckedSources,
    providers: [],
    recommendations: {
      summary,
      summaryAr,
      actions,
      actionsAr,
      technicalGuidance,
      technicalGuidanceAr
    },
    disclaimer: 'Risk score is a heuristic estimation based on observed structural attributes. It is not an absolute statistical guarantee. Always apply layered defensive controls.',
    disclaimerAr: 'درجة الخطورة تقدير إرشادي قائم على الخصائص الشكلية المرصودة وليست احتمالاً إحصائيًا قاطعًا. اعتمد دائمًا على طبقات دفاعية متعددة.'
  };
}
