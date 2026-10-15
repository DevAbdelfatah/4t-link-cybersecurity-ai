import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { inspectUrlHeuristics } from './server/analyzer.ts';
import { enrichDomainIntel, safeResolveDns, queryRdap } from './server/dns-rdap.ts';
import { threatProviders } from './server/threat-intel.ts';
import { ask4TLinkAi } from './server/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// 1. Analyze URL Endpoint
app.post('/api/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'A valid URL or hostname string is required.' });
    }

    // 1. Static heuristic inspection
    const analysis = inspectUrlHeuristics(url);

    // 2. Real DNS & RDAP enrichment (if valid domain and not private IP)
    if (!analysis.domainIntel.isPrivateIp && analysis.domainIntel.domain) {
      try {
        const enriched = await enrichDomainIntel(analysis.domainIntel.domain, analysis.domainIntel);
        analysis.domainIntel = enriched.intel;
        analysis.indicators.push(...enriched.extraIndicators);

        // Adjust risk score if RDAP or DNS rebinding added new indicators
        for (const ind of enriched.extraIndicators) {
          analysis.riskScore = Math.min(100, analysis.riskScore + ind.scoreContribution);
        }

        if (analysis.riskScore >= 75) analysis.riskLevel = 'Critical';
        else if (analysis.riskScore >= 50) analysis.riskLevel = 'High';
        else if (analysis.riskScore >= 25) analysis.riskLevel = 'Medium';
      } catch (dnsErr) {
        analysis.uncheckedSources.push({
          source: 'Live DNS / RDAP Query',
          reason: 'DNS or RDAP query encountered an error or network timeout.',
          reasonAr: 'واجه استعلام DNS أو RDAP خطأً أو انتهاء مهلة الاتصال.'
        });
      }

      // 3. Threat Intelligence integrations
      const providerPromises = threatProviders.map(p =>
        p.checkUrl(analysis.normalizedUrl, analysis.domainIntel.domain)
      );
      const providerResults = await Promise.allSettled(providerPromises);

      for (const pr of providerResults) {
        if (pr.status === 'fulfilled') {
          analysis.providers.push(pr.value);
          // If external provider confirmed malicious
          if (pr.value.status === 'malicious') {
            analysis.riskScore = Math.max(analysis.riskScore, 90);
            analysis.riskLevel = 'Critical';
            analysis.indicators.push({
              id: `provider-flag-${pr.value.provider}`,
              category: 'reputation',
              title: `Flagged Malicious by ${pr.value.name}`,
              titleAr: `تم التصنيف كتهديد خبيث من قبل ${pr.value.name}`,
              description: pr.value.message,
              descriptionAr: pr.value.messageAr,
              severity: 'critical',
              scoreContribution: 50
            });
          }
        }
      }
    }

    res.json(analysis);
  } catch (err: any) {
    console.error('Error analyzing URL:', err);
    res.status(500).json({ error: err?.message || 'Internal analysis engine error.' });
  }
});

// 2. Gemini AI Cybersecurity Analyst Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userQuestion, history, attachedAnalysis, language } = req.body;
    if (!userQuestion || typeof userQuestion !== 'string') {
      return res.status(400).json({ error: 'User question is required.' });
    }

    const reply = await ask4TLinkAi({
      userQuestion,
      history,
      attachedAnalysis,
      language: language === 'ar' ? 'ar' : 'en'
    });

    res.json({ reply });
  } catch (err: any) {
    console.error('Error generating AI answer:', err);
    res.status(500).json({ error: err?.message || 'AI Assistant service unavailable.' });
  }
});

// 3. Domain Intelligence Endpoint
app.post('/api/domain-intel', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'Domain string is required.' });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//i, '').split('/')[0];
    const [dnsResult, rdapResult] = await Promise.allSettled([
      safeResolveDns(cleanDomain),
      queryRdap(cleanDomain)
    ]);

    res.json({
      domain: cleanDomain,
      dns: dnsResult.status === 'fulfilled' ? dnsResult.value : { error: 'DNS resolution failed' },
      rdap: rdapResult.status === 'fulfilled' ? rdapResult.value : { error: 'RDAP query failed' },
      queriedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error resolving domain intelligence:', err);
    res.status(500).json({ error: err?.message || 'Domain intelligence lookup failed' });
  }
});

// 4. Provider Configuration Status Endpoint
app.get('/api/providers/status', (_req, res) => {
  const virustotalConfigured = Boolean(process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY.trim().length > 0);
  const safeBrowsingConfigured = Boolean(process.env.GOOGLE_SAFE_BROWSING_API_KEY && process.env.GOOGLE_SAFE_BROWSING_API_KEY.trim().length > 0);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  res.json({
    virustotalConfigured,
    safeBrowsingConfigured,
    geminiConfigured,
    rdapActive: true,
    dohActive: true
  });
});

// 5. Mount Vite in Dev or Serve Static in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[4T-LINK AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[4T-LINK AI] Failed to start server:', err);
  process.exit(1);
});
