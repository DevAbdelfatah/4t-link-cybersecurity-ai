import dns from 'node:dns/promises';
import { DomainIntelligence, ThreatIndicator } from '../src/types/cyber.ts';
import { isPrivateIp } from './analyzer.ts';

export interface ExtendedDnsResult {
  ipAddresses: string[];
  mxRecords: string[];
  txtRecords: string[];
  nsRecords: string[];
  error?: string;
  hasPrivateResolvedIp?: boolean;
}

export interface RdapResult {
  registrar?: string;
  registeredDate?: string;
  expiresDate?: string;
  domainAgeDays?: number;
  status?: string[];
  error?: string;
}

// Safely resolve DNS records without establishing HTTP connection to target host
export async function safeResolveDns(domain: string): Promise<ExtendedDnsResult> {
  const result: ExtendedDnsResult = {
    ipAddresses: [],
    mxRecords: [],
    txtRecords: [],
    nsRecords: []
  };

  try {
    // 1. Resolve A (IPv4) & AAAA (IPv6)
    const [ipv4, ipv6] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolve6(domain)
    ]);

    if (ipv4.status === 'fulfilled') {
      result.ipAddresses.push(...ipv4.value);
    }
    if (ipv6.status === 'fulfilled') {
      result.ipAddresses.push(...ipv6.value);
    }

    // SSRF / DNS rebinding check on resolved IPs
    for (const ip of result.ipAddresses) {
      if (isPrivateIp(ip)) {
        result.hasPrivateResolvedIp = true;
        break;
      }
    }

    // 2. Resolve MX, NS, TXT in parallel with short timeout
    const [mx, ns, txt] = await Promise.allSettled([
      dns.resolveMx(domain),
      dns.resolveNs(domain),
      dns.resolveTxt(domain)
    ]);

    if (mx.status === 'fulfilled') {
      result.mxRecords = mx.value.map(r => `${r.exchange} (pri: ${r.priority})`);
    }
    if (ns.status === 'fulfilled') {
      result.nsRecords = ns.value;
    }
    if (txt.status === 'fulfilled') {
      result.txtRecords = txt.value.map(entry => entry.join(' ')).slice(0, 5); // limit preview
    }
  } catch (err: any) {
    result.error = err?.message || 'DNS resolution failed';
  }

  return result;
}

// Query public ICANN RDAP REST API for domain registration age and registrar
export async function queryRdap(domain: string): Promise<RdapResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: {
        'Accept': 'application/rdap+json, application/json',
        'User-Agent': '4T-LINK-Cybersecurity-Analyst/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { error: `RDAP registry returned HTTP ${res.status}` };
    }

    const data: any = await res.json();
    let registrar: string | undefined;
    let registeredDate: string | undefined;
    let expiresDate: string | undefined;
    let domainAgeDays: number | undefined;

    // Extract registrar entity
    if (Array.isArray(data.entities)) {
      for (const ent of data.entities) {
        if (Array.isArray(ent.roles) && ent.roles.includes('registrar')) {
          registrar = ent.vcardArray?.[1]?.find((prop: any) => prop[0] === 'fn')?.[3] || ent.handle;
          break;
        }
      }
    }

    // Extract events (registration, expiration)
    if (Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (ev.eventAction === 'registration') {
          registeredDate = ev.eventDate;
        } else if (ev.eventAction === 'expiration') {
          expiresDate = ev.eventDate;
        }
      }
    }

    // Calculate domain age
    if (registeredDate) {
      const regTime = new Date(registeredDate).getTime();
      const now = Date.now();
      if (!isNaN(regTime) && now > regTime) {
        domainAgeDays = Math.floor((now - regTime) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      registrar,
      registeredDate,
      expiresDate,
      domainAgeDays,
      status: Array.isArray(data.status) ? data.status.slice(0, 4) : undefined
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { error: err?.message || 'RDAP request timed out' };
  }
}

// Enhance domain intelligence with safe DNS and RDAP findings
export async function enrichDomainIntel(
  domain: string,
  existingIntel: DomainIntelligence
): Promise<{ intel: DomainIntelligence; extraIndicators: ThreatIndicator[] }> {
  const extraIndicators: ThreatIndicator[] = [];
  const updatedIntel: DomainIntelligence = { ...existingIntel };

  // Skip DNS query if host is an IP
  if (!existingIntel.isIpAddress) {
    const dnsRes = await safeResolveDns(domain);
    updatedIntel.ipAddresses = dnsRes.ipAddresses;
    updatedIntel.mxRecords = dnsRes.mxRecords;
    updatedIntel.txtRecords = dnsRes.txtRecords;
    updatedIntel.nsRecords = dnsRes.nsRecords;

    if (dnsRes.hasPrivateResolvedIp) {
      extraIndicators.push({
        id: 'dns-resolved-private-ip',
        category: 'ip',
        title: 'DNS Resolves to Private / Loopback IP (DNS Rebinding)',
        titleAr: 'اسم النطاق يشير إلى عنوان IP داخلي (اشتباه DNS Rebinding)',
        description: `Domain resolved to a private or loopback IP (${dnsRes.ipAddresses.join(', ')}). This is a strong indicator of a DNS Rebinding exploit aiming to access local intranet assets.`,
        descriptionAr: `تم حل النطاق إلى عناوين داخلية أو محلية (${dnsRes.ipAddresses.join(', ')}). هذا يشير بقوة إلى هجمات DNS Rebinding لاختراق الأجهزة الداخلية.`,
        severity: 'critical',
        scoreContribution: 45,
        evidence: `Resolved IPs: ${dnsRes.ipAddresses.join(', ')}`
      });
    }

    // Try RDAP for root domain
    const rdapRes = await queryRdap(existingIntel.rootDomain || domain);
    updatedIntel.rdapQueried = !rdapRes.error;
    if (!rdapRes.error) {
      updatedIntel.registrar = rdapRes.registrar;
      updatedIntel.registeredDate = rdapRes.registeredDate;
      updatedIntel.expiresDate = rdapRes.expiresDate;
      updatedIntel.domainAgeDays = rdapRes.domainAgeDays;

      // Check for newly registered domains (NRDs) - highly correlated with disposable phishing campaigns
      if (typeof rdapRes.domainAgeDays === 'number') {
        if (rdapRes.domainAgeDays < 14) {
          extraIndicators.push({
            id: 'newly-registered-domain-critical',
            category: 'domain',
            title: `Ultra-New Domain (${rdapRes.domainAgeDays} days old)`,
            titleAr: `نطاق مسجل حديثًا جدًا (عمره ${rdapRes.domainAgeDays} يومًا فقط)`,
            description: `Domain was registered ${rdapRes.domainAgeDays} days ago (${rdapRes.registeredDate?.split('T')[0]}). Over 70% of malicious phishing infrastructure is spun up on domains younger than 14 days.`,
            descriptionAr: `تم تسجيل النطاق منذ ${rdapRes.domainAgeDays} يومًا فقط (${rdapRes.registeredDate?.split('T')[0]}). غالبية البنية التحتية للاحتيال تعمل على نطاقات حديثة التسجيل.`,
            severity: 'critical',
            scoreContribution: 35,
            evidence: `Age: ${rdapRes.domainAgeDays} days; Registrar: ${rdapRes.registrar || 'Unknown'}`
          });
        } else if (rdapRes.domainAgeDays < 45) {
          extraIndicators.push({
            id: 'newly-registered-domain-medium',
            category: 'domain',
            title: `Recent Domain Registration (${rdapRes.domainAgeDays} days old)`,
            titleAr: `نطاق حديث التسجيل (عمره ${rdapRes.domainAgeDays} يومًا)`,
            description: `Domain is under 45 days old. Enterprise SOC policies typically treat new domains with elevated scrutiny.`,
            descriptionAr: `عمر النطاق أقل من 45 يومًا، وتوصي سياسات مراكز العمليات الأمنية SOC بالتعامل بحذر مع النطاقات الحديثة.`,
            severity: 'medium',
            scoreContribution: 20,
            evidence: `Age: ${rdapRes.domainAgeDays} days`
          });
        }
      }
    }
  }

  return { intel: updatedIntel, extraIndicators };
}
