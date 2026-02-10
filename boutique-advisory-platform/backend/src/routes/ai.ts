import { Router, Response } from 'express';
import { AuthenticatedRequest, authorize } from '../middleware/authorize';
import { prisma } from '../database';
import { ai } from '../utils/ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

// Helper to get platform context
async function getPlatformContext() {
    try {
        const [investorCount, smeCount, advisorCount, dealCount] = await Promise.all([
            prisma.investor.count(),
            prisma.sME.count(),
            prisma.advisor.count(),
            prisma.deal.count()
        ]);

        // Fetch highlights
        const topInvestors = await prisma.investor.findMany({
            take: 3,
            select: { name: true, type: true }
        });
        const topSMEs = await prisma.sME.findMany({
            take: 3,
            select: { name: true, sector: true, stage: true }
        });
        const topAdvisors = await prisma.advisor.findMany({
            take: 3,
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
        `;
    } catch (e) {
        console.error("Context fetch error:", e);
        return "Platform data currently limited.";
    }
}

// General Platform Chatbot
router.post('/chat', authorize('ai.chat'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message required" });

        if (!model) {
            // Mock response if no API key for dev/test
            return res.json({
                response: "I am the AI Assistant. Please configure GEMINI_API_KEY to enable real intelligence. I see you are asking about: " + message
            });
        }

        const context = await getPlatformContext();

        const prompt = `
You are the AI Assistant for the Boutique Advisory Platform.
Your role is to help users (Investors, SMEs, Advisors) navigate the platform, understand the ecosystem, and find matches.

Context Data:
${context}

User Query: "${message}"

Instructions:
- Provide a helpful, professional answer based on the context.
- If asking about specific people not in the summary, encourage them to use the search feature.
- Be concise (max 3 sentences unless detailed info is requested).
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return res.json({ response: text });
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return res.status(500).json({ error: "AI Service Error: " + (error as any).message });
    }
});

// Generate AI summary for a deal
router.post('/analyze/:dealId', authorize('deal.read'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { dealId } = req.params;

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { sme: true }
        });

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        // Use new Gemini logic if available, else fallback
        if (model) {
            const prompt = `Analyze this deal: ${deal.title} (${deal.sme.name}). Summary: ${deal.description || 'No description'}. Sector: ${deal.sme.sector}. Key risks and strengths?`;
            const result = await model.generateContent(prompt);
            return res.json({ summary: result.response.text(), riskAnalysis: "AI Generated" });
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

        const documents = await prisma.document.findMany({
            where: { dealId }
        });

        // Use Gemini if available
        if (model && documents.length > 0) {
            // Simplified RAG: Just list doc names for now as we can't ingest files easily here without storage access
            const docList = documents.map(d => d.name).join(', ');
            const prompt = `User asks about deal ${dealId}. Docs available: ${docList}. Query: ${query}. Answer based on this.`;
            const result = await model.generateContent(prompt);
            return res.json({ answer: result.response.text() });
        }

        const answer = await ai.chatWithDataroom(query, documents);

        return res.json({ answer });
    } catch (error) {
        console.error('AI Chat Route Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
