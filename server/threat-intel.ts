import { ProviderResult } from '../src/types/cyber.ts';

// Threat intelligence provider abstraction interface
export interface ThreatIntelligenceProvider {
  name: string;
  providerId: 'virustotal' | 'google_safe_browsing' | 'rdap' | 'cloudflare_doh';
  isConfigured(): boolean;
  checkUrl(url: string, domain: string): Promise<ProviderResult>;
}

// 1. VirusTotal API v3 integration
export class VirusTotalProvider implements ThreatIntelligenceProvider {
  name = 'VirusTotal Intelligence API';
  providerId = 'virustotal' as const;

  isConfigured(): boolean {
    return Boolean(process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY.trim().length > 0);
  }

  async checkUrl(url: string): Promise<ProviderResult> {
    const queriedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        provider: this.providerId,
        name: this.name,
        status: 'unconfigured',
        message: 'VirusTotal API key not configured in environment (VIRUSTOTAL_API_KEY). External scan omitted.',
        messageAr: 'مفتاح VirusTotal API غير مهيأ في متغيرات البيئة. تم تجاوز الفحص الخارجي.',
        queriedAt
      };
    }

    try {
      // VirusTotal URL ID is base64 without padding (or URL identifier)
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY!.trim(),
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'not_found',
          message: 'URL has not been submitted or observed in VirusTotal database yet.',
          messageAr: 'لم يسبق تسجيل أو فحص هذا الرابط في قاعدة بيانات VirusTotal من قبل.',
          queriedAt
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'error',
          message: 'VirusTotal API authentication failed (invalid API key).',
          messageAr: 'فشل التحقق من مفتاح VirusTotal API (المفتاح غير صالح).',
          queriedAt
        };
      }

      if (res.status === 429) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'error',
          message: 'VirusTotal API rate limit exceeded.',
          messageAr: 'تم تجاوز حد الاستعلامات المسموح به في VirusTotal API.',
          queriedAt
        };
      }

      if (!res.ok) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'error',
          message: `VirusTotal returned HTTP ${res.status}`,
          messageAr: `استجابت خدمة VirusTotal برمز الخطأ ${res.status}`,
          queriedAt
        };
      }

      const json: any = await res.json();
      const stats = json?.data?.attributes?.last_analysis_stats;
      const maliciousCount = Number(stats?.malicious || 0);
      const suspiciousCount = Number(stats?.suspicious || 0);
      const harmlessCount = Number(stats?.harmless || 0);

      let status: 'clean' | 'suspicious' | 'malicious' = 'clean';
      if (maliciousCount > 0) status = 'malicious';
      else if (suspiciousCount > 0) status = 'suspicious';

      return {
        provider: this.providerId,
        name: this.name,
        status,
        message: `${maliciousCount} security vendors flagged this URL as malicious (${suspiciousCount} suspicious, ${harmlessCount} harmless).`,
        messageAr: `${maliciousCount} محرك أمني صنف هذا الرابط كخبيث (${suspiciousCount} مشبوه، ${harmlessCount} سليم).`,
        details: {
          malicious: maliciousCount,
          suspicious: suspiciousCount,
          harmless: harmlessCount,
          undetected: Number(stats?.undetected || 0),
          lastAnalysisDate: json?.data?.attributes?.last_analysis_date
        },
        queriedAt
      };
    } catch (err: any) {
      return {
        provider: this.providerId,
        name: this.name,
        status: 'error',
        message: err?.name === 'AbortError' ? 'VirusTotal query timed out.' : (err?.message || 'Failed to connect to VirusTotal'),
        messageAr: err?.name === 'AbortError' ? 'انتهت مهلة الاتصال بـ VirusTotal.' : 'تعذر الاتصال بخدمة VirusTotal.',
        queriedAt
      };
    }
  }
}

// 2. Google Safe Browsing API v4 integration
export class GoogleSafeBrowsingProvider implements ThreatIntelligenceProvider {
  name = 'Google Safe Browsing API';
  providerId = 'google_safe_browsing' as const;

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_SAFE_BROWSING_API_KEY && process.env.GOOGLE_SAFE_BROWSING_API_KEY.trim().length > 0);
  }

  async checkUrl(url: string): Promise<ProviderResult> {
    const queriedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        provider: this.providerId,
        name: this.name,
        status: 'unconfigured',
        message: 'Google Safe Browsing API key not configured in environment (GOOGLE_SAFE_BROWSING_API_KEY).',
        messageAr: 'مفتاح Google Safe Browsing API غير مهيأ في متغيرات البيئة.',
        queriedAt
      };
    }

    try {
      const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY!.trim();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const requestBody = {
        client: {
          clientId: '4t-link-cyber-ai',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      };

      const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'error',
          message: `Safe Browsing API returned HTTP ${res.status}`,
          messageAr: `استجابت خدمة Safe Browsing برمز الخطأ ${res.status}`,
          queriedAt
        };
      }

      const json: any = await res.json();
      const matches = json?.matches || [];

      if (matches.length > 0) {
        const types = matches.map((m: any) => m.threatType).join(', ');
        return {
          provider: this.providerId,
          name: this.name,
          status: 'malicious',
          message: `Flagged as malicious threat by Google Safe Browsing (${types}).`,
          messageAr: `تم تصنيف الرابط كتهديد خبيث بواسطة Google Safe Browsing (${types}).`,
          details: { matches },
          queriedAt
        };
      }

      return {
        provider: this.providerId,
        name: this.name,
        status: 'clean',
        message: 'No matches found in Google Safe Browsing threat lists.',
        messageAr: 'لم يتم العثور على أي تطابقات في قوائم تهديدات Google Safe Browsing.',
        queriedAt
      };
    } catch (err: any) {
      return {
        provider: this.providerId,
        name: this.name,
        status: 'error',
        message: err?.name === 'AbortError' ? 'Safe Browsing query timed out.' : (err?.message || 'Safe Browsing query error'),
        messageAr: err?.name === 'AbortError' ? 'انتهت مهلة استعلام Safe Browsing.' : 'حدث خطأ أثناء فحص Safe Browsing.',
        queriedAt
      };
    }
  }
}

// 3. Cloudflare DNS-over-HTTPS (DoH) verification (No key required)
export class CloudflareDnsProvider implements ThreatIntelligenceProvider {
  name = 'Cloudflare 1.1.1.1 DoH Resolver';
  providerId = 'cloudflare_doh' as const;

  isConfigured(): boolean {
    return true; // Publicly accessible without secrets
  }

  async checkUrl(_url: string, domain: string): Promise<ProviderResult> {
    const queriedAt = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
        headers: { 'Accept': 'application/dns-json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'error',
          message: `DoH resolver returned HTTP ${res.status}`,
          messageAr: `استجاب خادم DoH برمز ${res.status}`,
          queriedAt
        };
      }

      const json: any = await res.json();
      const answers = json?.Answer || [];
      const status = json?.Status; // 0 = NOERROR, 3 = NXDOMAIN

      if (status === 3) {
        return {
          provider: this.providerId,
          name: this.name,
          status: 'suspicious',
          message: 'NXDOMAIN: Domain does not exist in public global DNS hierarchy.',
          messageAr: 'NXDOMAIN: اسم النطاق غير موجود في شجرة DNS العامة العالمية.',
          details: { dnsStatus: 'NXDOMAIN' },
          queriedAt
        };
      }

      const ips = answers.filter((a: any) => a.type === 1).map((a: any) => a.data);

      return {
        provider: this.providerId,
        name: this.name,
        status: 'clean',
        message: `Successfully resolved via global 1.1.1.1 DoH (${ips.length} A records found).`,
        messageAr: `تم حل النطاق بنجاح عبر خدمة 1.1.1.1 DoH العالمية (${ips.length} عنوان A).`,
        details: { ips, dnsStatus: 'NOERROR' },
        queriedAt
      };
    } catch (err: any) {
      return {
        provider: this.providerId,
        name: this.name,
        status: 'error',
        message: 'Cloudflare DoH lookup timed out or failed.',
        messageAr: 'تعذر إتمام استعلام DoH عبر Cloudflare.',
        queriedAt
      };
    }
  }
}

// Registry of all providers
export const threatProviders: ThreatIntelligenceProvider[] = [
  new VirusTotalProvider(),
  new GoogleSafeBrowsingProvider(),
  new CloudflareDnsProvider()
];
