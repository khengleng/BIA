import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';
import { ai } from '../utils/ai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic Claude AI
const router = Router();

// Initialize Anthropic
// Note: ANTHROPIC_API_KEY should be set in .env
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;
const MODEL_NAME = "claude-haiku-4-5-20251001";
const PLATFORM_UPDATE_DATE = "2026-02-17";

const PLATFORM_FEATURE_CONTEXT = `
Platform Capabilities (${PLATFORM_UPDATE_DATE}):
- Role-based platform for SMEs, Investors, Advisors, Admins, and Super Admins with RBAC enforcement.
- Core modules: Deals, Dataroom, Due Diligence, Syndicates, Community, Messaging, Calendar, Reports, and Advisory.
- Admin modules: Dashboard, Users, Audit, Business Ops, Billing Ops, and Operations.
- Operations readiness includes subscription/invoice workflows, support ticket operations, and escalation endpoints.
- Security controls include CSRF protection, security headers, session management, login throttling, and account lockout protections.
- Active session management supports device/session listing and revocation.

Security Notes (${PLATFORM_UPDATE_DATE}):
- Auth lockout is account-centric (email) to reduce shared-IP disruption.
- Login throttling remains active to limit abuse attempts.
- Production smoke security and ATO baseline checks were validated successfully in recent verification runs.
`;

// Helper to get platform context
async function getPlatformContext(tenantId: string, isSuperAdmin: boolean) {
    try {
        const scope = isSuperAdmin ? {} : { tenantId };
        const [investorCount, smeCount, advisorCount, dealCount] = await Promise.all([
            prisma.investor.count({ where: scope }),
            prisma.sME.count({ where: scope }),
            prisma.advisor.count({ where: scope }),
            prisma.deal.count({ where: scope })
        ]);

        // Fetch highlights
        const topInvestors = await prisma.investor.findMany({
            take: 3,
            where: scope,
            select: { name: true, type: true }
        });
        const topSMEs = await prisma.sME.findMany({
            take: 3,
            where: scope,
            select: { name: true, sector: true, stage: true }
        });
        const topAdvisors = await prisma.advisor.findMany({
            take: 3,
            where: scope,
            select: { name: true, specialization: true }
        });

        // Safe context string
        return `
Platform Overview:
- Total Investors: ${investorCount}
- Total SMEs: ${smeCount}
- Total Advisors: ${advisorCount}
- Active Deals: ${dealCount}

Sample Investors: ${topInvestors.map(i => `${i.name} (${i.type})`).join(', ')}
Sample SMEs: ${topSMEs.map(s => `${s.name} (${s.sector} - ${s.stage})`).join(', ')}
Sample Advisors: ${topAdvisors.map(a => `${a.name} (${Array.isArray(a.specialization) ? a.specialization.join('/') : a.specialization})`).join(', ')}

${PLATFORM_FEATURE_CONTEXT}
        `;
    } catch (e) {
        console.error("Context fetch error:", e);
        return `Platform data currently limited.\n\n${PLATFORM_FEATURE_CONTEXT}`;
    }
}

// General Platform Chatbot
router.post('/chat', authorize('ai.chat'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message, language = 'en' } = req.body;
        if (!message) return res.status(400).json({ error: "Message required" });
        const tenantId = req.user?.tenantId || 'default';
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (!anthropic) {
            const noAiMessage: { [key: string]: string } = {
                en: "I am the AI Assistant (Claude). Please configure ANTHROPIC_API_KEY to enable real intelligence.",
                km: "ខ្ញុំគឺជាជំនួយការ AI (Claude)។ សូមកំណត់ ANTHROPIC_API_KEY ដើម្បីបើកដំណើរការភាពវៃឆ្លាតពិតប្រាកដ។",
                zh: "我是 AI 助手 (Claude)。请配置 ANTHROPIC_API_KEY 以启用真正的智能。"
            };
            return res.json({
                response: (noAiMessage[language] || noAiMessage['en']) + " \n[dev note: API Key missing]"
            });
        }

        const context = await getPlatformContext(tenantId, isSuperAdmin);

        // Language-specific system prompt instructions
        const langInstructions: { [key: string]: string } = {
            en: "Respond in English.",
            km: "Respond in Khmer (Cambodian language). Use formal and professional Khmer.",
            zh: "Respond in Simplified Chinese (Mandarin). Use professional business terminology."
        };

        const systemPrompt = `
You are the AI Assistant for the Boutique Advisory Platform.
Your role is to help users (Investors, SMEs, Advisors) navigate the platform, understand the ecosystem, and find matches.
Context Data:
${context}
Instructions:
- ${langInstructions[language] || "Respond in English."}
- Provide a helpful, professional answer based on the context.
- If asking about specific people not in the summary, encourage them to use the search feature.
- When describing capabilities, reflect the latest platform update date and avoid claiming unavailable features.
- If uncertain about tenant-specific configuration, ask the user to verify with their admin.
- Be concise (max 3 sentences unless detailed info is requested).
        `;

        const msg = await anthropic.messages.create({
            model: MODEL_NAME,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                { role: "user", content: message }
            ]
        });

        // Extract text response
        const textBlock = msg.content[0];
        const text = textBlock.type === 'text' ? textBlock.text : "No response text";

        return res.json({ response: text });
    } catch (error) {
        console.error("Claude Chat Error:", error);
        return res.status(500).json({ error: "AI Service Error: " + (error as any).message });
    }
});

// AI Investment-Readiness Coach — assesses the authenticated SME's investment
// readiness from its profile + optional self-assessment answers, and returns a
// structured, localized analysis (score, per-dimension breakdown, strengths,
// gaps, prioritized actions) generated by Claude.
router.post('/readiness', authorize('sme.read', { getOwnerId: (req) => req.user?.id }), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const language = (req.body?.language as string) || 'en';

        if (!anthropic) {
            const configure: { [k: string]: string } = {
                en: 'AI readiness coaching is not configured. Set ANTHROPIC_API_KEY to enable it.',
                km: 'ការណែនាំ AI មិនទាន់បានកំណត់រចនាសម្ព័ន្ធទេ។ សូមកំណត់ ANTHROPIC_API_KEY ដើម្បីបើកដំណើរការ។',
                zh: 'AI 准备度辅导尚未配置。请设置 ANTHROPIC_API_KEY 以启用。'
            };
            return res.json({ configured: false, message: configure[language] || configure.en });
        }

        const sme = await prisma.sME.findFirst({
            where: { userId },
            include: { documents: true, deals: true }
        });
        if (!sme) {
            return res.status(404).json({ error: 'SME profile not found. Complete your SME profile before running a readiness assessment.' });
        }

        const profile = {
            name: sme.name,
            sector: sme.sector,
            stage: sme.stage,
            fundingRequired: sme.fundingRequired,
            description: sme.description || '(none provided)',
            location: sme.location || '(none provided)',
            hasWebsite: Boolean(sme.website),
            certified: sme.certified,
            status: sme.status,
            documentsUploaded: sme.documents.length,
            activeDeals: sme.deals.length,
            currentScore: sme.score ?? 0
        };
        const answers = (req.body?.answers && typeof req.body.answers === 'object') ? req.body.answers : {};

        const langInstruction: { [k: string]: string } = {
            en: 'Respond in English.',
            km: 'Respond in formal, professional Khmer (Cambodian).',
            zh: 'Respond in professional Simplified Chinese.'
        };

        const systemPrompt = `You are an investment-readiness coach for SMEs in Cambodia and the wider ASEAN region seeking equity or growth capital. Assess how ready this SME is to attract investors.

${langInstruction[language] || langInstruction.en}

Score five dimensions 0-100: "Financials", "Governance", "Market & Traction", "Team", "Documentation & Compliance". Base the assessment on the profile provided; where data is missing, treat it as a gap and score conservatively. Be specific and practical for a Cambodian SME context.

Return ONLY valid minified JSON (no markdown, no commentary) with EXACTLY this shape:
{"overallScore":<0-100 integer>,"readinessLevel":"<Early|Developing|Approaching|Investment-Ready>","summary":"<2 sentences>","dimensions":[{"name":"<dimension>","score":<0-100>,"comment":"<1 sentence>"}],"strengths":["<up to 3>"],"gaps":["<up to 3>"],"actionItems":[{"priority":"<High|Medium|Low>","title":"<short>","detail":"<1 sentence>"}]}`;

        const userContent = `SME profile: ${JSON.stringify(profile)}\nSelf-assessment answers: ${JSON.stringify(answers)}\nProduce the readiness assessment JSON now.`;

        const msg = await anthropic.messages.create({
            model: MODEL_NAME,
            max_tokens: 1500,
            system: systemPrompt,
            messages: [{ role: 'user', content: userContent }]
        });

        const block = msg.content[0];
        const text = block && block.type === 'text' ? block.text : '';

        let analysis: any;
        try {
            // Strip any accidental code fences before parsing.
            analysis = JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim());
        } catch {
            analysis = {
                overallScore: Math.round(sme.score ?? 0),
                readinessLevel: 'Developing',
                summary: text.slice(0, 400) || 'Assessment could not be structured; please try again.',
                dimensions: [],
                strengths: [],
                gaps: [],
                actionItems: []
            };
        }

        return res.json({ configured: true, smeName: sme.name, generatedAt: new Date().toISOString(), analysis });
    } catch (error) {
        console.error('AI Readiness Error:', error);
        return res.status(500).json({ error: 'Failed to generate readiness assessment' });
    }
});

// Generate AI summary for a deal
router.post('/analyze/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const tenantId = req.user?.tenantId || 'default';
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const deal = await prisma.deal.findFirst({
            where: isSuperAdmin ? { id: dealId } : { id: dealId, tenantId },
            include: { sme: true }
        });

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        // Use Claude if available
        if (anthropic) {
            const prompt = `Analyze this deal: ${deal.title} (${deal.sme.name}). Summary: ${deal.description || 'No description'}. Sector: ${deal.sme.sector}. Key risks and strengths?`;
            const msg = await anthropic.messages.create({
                model: MODEL_NAME,
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }]
            });
            const textBlock = msg.content[0];
            const text = textBlock.type === 'text' ? textBlock.text : "";
            return res.json({ summary: text, riskAnalysis: "AI Generated by Claude" });
        }

        const [summary, riskAnalysis] = await Promise.all([
            ai.generateDealSummary({ deal, sme: deal.sme }),
            ai.analyzeDealRisks({ deal, sme: deal.sme })
        ]);

        return res.json({ summary, riskAnalysis });
    } catch (error) {
        console.error('AI Analysis Route Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Chat with Dataroom AI
router.post('/chat/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const { query } = req.body;
        const tenantId = req.user?.tenantId || 'default';
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const deal = await prisma.deal.findFirst({
            where: isSuperAdmin ? { id: dealId } : { id: dealId, tenantId },
            select: { id: true, tenantId: true }
        });
        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        const documents = await prisma.document.findMany({
            where: isSuperAdmin ? { dealId } : { dealId, tenantId: deal.tenantId }
        });

        // Use Claude if available
        if (anthropic && documents.length > 0) {
            const docList = documents.map(d => d.name).join(', ');
            const prompt = `User asks about deal ${dealId}. Docs available: ${docList}. Query: ${query}. Answer based on this.`;
            const msg = await anthropic.messages.create({
                model: MODEL_NAME,
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }]
            });
            const textBlock = msg.content[0];
            return res.json({ answer: textBlock.type === 'text' ? textBlock.text : "" });
        }

        const answer = await ai.chatWithDataroom(query, documents);

        return res.json({ answer });
    } catch (error) {
        console.error('AI Chat Route Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
