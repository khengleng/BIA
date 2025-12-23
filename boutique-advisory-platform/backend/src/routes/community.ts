/**
 * Community Routes - Discussion Forum (like Wefunder)
 * 
 * Provides community features for SMEs, investors, and advisors
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// In-memory data (replace with Prisma in production)
let posts: any[] = [
    {
        id: 'post_1',
        tenantId: 'default',
        authorId: 'user_1',
        author: {
            id: 'user_1',
            name: 'John Smith',
            role: 'INVESTOR',
            avatar: null
        },
        title: 'Exciting investment opportunity in Cambodian fintech',
        content: `I've been researching the Cambodian fintech market and I'm very bullish on the growth potential. The country has one of the highest mobile phone penetration rates in Southeast Asia, and the banking infrastructure is still developing, creating huge opportunities for fintech solutions.

Some key metrics:
- 90% mobile phone penetration
- Only 22% banked population
- 70% smartphone users
- Strong government support for fintech innovation

What are your thoughts on this sector? Any specific companies you're watching?`,
        category: 'INVESTOR_INSIGHT',
        smeId: null,
        dealId: null,
        syndicateId: null,
        likes: 24,
        views: 156,
        isPinned: false,
        isAnnouncement: false,
        status: 'PUBLISHED',
        commentCount: 8,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
    },
    {
        id: 'post_2',
        tenantId: 'default',
        authorId: 'user_2',
        author: {
            id: 'user_2',
            name: 'Admin Team',
            role: 'ADMIN',
            avatar: null
        },
        title: 'Welcome to BIA Platform Community! 🎉',
        content: `We're excited to launch our community forum where investors, SMEs, and advisors can connect, share insights, and discuss opportunities.

**Community Guidelines:**
1. Be respectful and constructive
2. No spam or self-promotion without value
3. Share knowledge and experiences
4. Protect confidential information
5. Ask questions - there are no dumb questions!

Looking forward to building a vibrant community together!`,
        category: 'ANNOUNCEMENT',
        smeId: null,
        dealId: null,
        syndicateId: null,
        likes: 45,
        views: 320,
        isPinned: true,
        isAnnouncement: true,
        status: 'PUBLISHED',
        commentCount: 12,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'post_3',
        tenantId: 'default',
        authorId: 'user_3',
        author: {
            id: 'user_3',
            name: 'TechCorp Cambodia',
            role: 'SME',
            avatar: null
        },
        title: 'TechCorp reaches 100,000 active users milestone! 🚀',
        content: `Thrilled to announce that TechCorp has reached a major milestone - 100,000 active users on our platform!

Key achievements this quarter:
- 40% user growth
- Launched in 3 new provinces
- Partnered with 5 major banks
- Zero security incidents

Thank you to all our investors and supporters. This is just the beginning!`,
        category: 'SUCCESS_STORY',
        smeId: 'sme_1',
        dealId: null,
        syndicateId: null,
        likes: 67,
        views: 245,
        isPinned: false,
        isAnnouncement: false,
        status: 'PUBLISHED',
        commentCount: 15,
        createdAt: '2024-02-01T14:00:00Z',
        updatedAt: '2024-02-01T14:00:00Z'
    },
    {
        id: 'post_4',
        tenantId: 'default',
        authorId: 'user_4',
        author: {
            id: 'user_4',
            name: 'New Investor',
            role: 'INVESTOR',
            avatar: null
        },
        title: 'Question: Due diligence process for first-time investors?',
        content: `Hi everyone! I'm new to startup investing and would love to learn from the community.

What should I look for when conducting due diligence on an SME? What red flags should I watch out for?

Any advice would be greatly appreciated! 🙏`,
        category: 'QUESTION',
        smeId: null,
        dealId: null,
        syndicateId: null,
        likes: 12,
        views: 89,
        isPinned: false,
        isAnnouncement: false,
        status: 'PUBLISHED',
        commentCount: 6,
        createdAt: '2024-02-10T09:15:00Z',
        updatedAt: '2024-02-10T09:15:00Z'
    },
    {
        id: 'post_5',
        tenantId: 'default',
        authorId: 'user_2',
        author: {
            id: 'user_2',
            name: 'Admin Team',
            role: 'ADMIN',
            avatar: null
        },
        title: '🆕 New Features Released: Syndicates, Due Diligence Scores, Secondary Trading',
        content: `We're excited to announce several major new features on the BIA Platform!

**1. Investor Syndicates**
Pool your investments with other investors. Join syndicates led by experienced investors and access deals with lower minimums.

**2. Due Diligence Scores**
Comprehensive SME scoring system with detailed breakdowns across Financial, Team, Market, Product, Legal, and Operations categories.

**3. Community Forum**
You're already here! Connect with fellow investors, SMEs, and advisors.

**4. Secondary Trading**
Trade your investment shares on our secondary marketplace. Improve liquidity and discover new opportunities.

Check out the sidebar navigation to explore these new features!`,
        category: 'ANNOUNCEMENT',
        smeId: null,
        dealId: null,
        syndicateId: null,
        likes: 89,
        views: 456,
        isPinned: true,
        isAnnouncement: true,
        status: 'PUBLISHED',
        commentCount: 18,
        createdAt: '2024-12-20T08:00:00Z',
        updatedAt: '2024-12-20T08:00:00Z'
    },
    {
        id: 'post_6',
        tenantId: 'default',
        authorId: 'user_10',
        author: {
            id: 'user_10',
            name: 'David Tan',
            role: 'INVESTOR',
            avatar: null
        },
        title: 'My 2024 Cambodia Investment Portfolio Strategy',
        content: `After 3 years of investing in Cambodian startups, here's my portfolio allocation strategy for 2024:

**Sector Allocation:**
- Fintech: 40%
- Agriculture Tech: 25%
- E-commerce/Logistics: 20%
- Clean Energy: 15%

**Investment Size:**
- Seed rounds: $10K-25K per company
- Series A: $50K-100K per company
- Follow-on reserves: 30% of initial investment

**Key Learnings:**
1. Focus on companies with strong unit economics
2. Team quality is the #1 predictor of success
3. Regulatory relationships matter more in Cambodia
4. Patience is key - exits take longer here

Would love to hear other investors' strategies!`,
        category: 'INVESTOR_INSIGHT',
        smeId: null,
        dealId: null,
        syndicateId: null,
        likes: 56,
        views: 312,
        isPinned: false,
        isAnnouncement: false,
        status: 'PUBLISHED',
        commentCount: 14,
        createdAt: '2024-12-18T10:00:00Z',
        updatedAt: '2024-12-18T10:00:00Z'
    },
    {
        id: 'post_7',
        tenantId: 'default',
        authorId: 'user_11',
        author: {
            id: 'user_11',
            name: 'AgriSmart Solutions',
            role: 'SME',
            avatar: null
        },
        title: '[SME Update] AgriSmart Expands to 3 New Provinces',
        content: `Exciting news from the AgriSmart team!

We've officially launched operations in Battambang, Kampong Cham, and Siem Reap provinces. This expansion brings our total coverage to 8 provinces across Cambodia.

**Key Highlights:**
- 500+ new farming families onboarded
- 3 new distribution partnerships established
- Local support teams trained and deployed
- IoT sensors installed on 2,000+ hectares

**Impact Metrics:**
- Average yield increase: 23%
- Water usage reduction: 18%
- Farm income improvement: 31%

Thank you to our investors for making this possible! 🌾

*Investor update available in the Data Room*`,
        category: 'SME_NEWS',
        smeId: 'sme_2',
        dealId: null,
        syndicateId: null,
        likes: 78,
        views: 289,
        isPinned: false,
        isAnnouncement: false,
        status: 'PUBLISHED',
        commentCount: 11,
        createdAt: '2024-12-15T14:00:00Z',
        updatedAt: '2024-12-15T14:00:00Z'
    },
    {
        id: 'post_8',
        tenantId: 'default',
        authorId: 'user_7',
        author: {
            id: 'user_7',
            name: 'Expert Advisor',
            role: 'ADVISOR',
            avatar: null
        },
        title: 'Cambodia Startup Ecosystem Report 2024 - Key Insights',
        content: `Just finished analyzing the Cambodia startup ecosystem data for 2024. Here are the key findings:

**Funding Trends:**
- Total VC funding: $45M (up 35% YoY)
- Average deal size: $1.2M
- Number of deals: 38

**Top Sectors by Funding:**
1. Fintech: $18M (40%)
2. E-commerce: $9M (20%)
3. AgriTech: $7M (16%)
4. EdTech: $5M (11%)
5. Others: $6M (13%)

**Notable Trends:**
- Increasing interest from regional VCs
- More B2B focused startups emerging
- Government launching tech park initiative
- Banking regulations becoming more startup-friendly

**Challenges:**
- Talent shortage remains critical
- Limited Series B+ opportunities
- Exit cycle still unclear

Happy to discuss any of these points in more detail!`,
        category: 'INVESTOR_INSIGHT',
        smeId: null,
        dealId: null,
        syndicateId: null,
        likes: 134,
        views: 567,
        isPinned: false,
        isAnnouncement: false,
        status: 'PUBLISHED',
        commentCount: 22,
        createdAt: '2024-12-10T09:30:00Z',
        updatedAt: '2024-12-10T09:30:00Z'
    }
];

let comments: any[] = [
    {
        id: 'comment_1',
        postId: 'post_1',
        authorId: 'user_5',
        author: { id: 'user_5', name: 'Sarah Chen', role: 'INVESTOR' },
        content: 'Great analysis! I agree the fintech sector in Cambodia is very promising. I have already invested in two companies in this space.',
        parentId: null,
        likes: 5,
        createdAt: '2024-01-15T11:00:00Z'
    },
    {
        id: 'comment_2',
        postId: 'post_1',
        authorId: 'user_6',
        author: { id: 'user_6', name: 'Mike Johnson', role: 'ADVISOR' },
        content: 'Important consideration: regulatory landscape. The National Bank of Cambodia has been quite supportive of fintech innovation.',
        parentId: null,
        likes: 8,
        createdAt: '2024-01-15T12:30:00Z'
    },
    {
        id: 'comment_3',
        postId: 'post_4',
        authorId: 'user_7',
        author: { id: 'user_7', name: 'Expert Advisor', role: 'ADVISOR' },
        content: `Welcome! Here are my top tips for first-time investors:

1. **Team**: Look at the founders' track record and experience
2. **Market**: Is the market large enough? Growing?
3. **Product**: Does it solve a real problem?
4. **Financials**: Revenue growth, burn rate, unit economics
5. **Legal**: Clean cap table, proper documentation

Happy to discuss more!`,
        parentId: null,
        likes: 15,
        createdAt: '2024-02-10T10:00:00Z'
    },
    {
        id: 'comment_4',
        postId: 'post_3',
        authorId: 'user_1',
        author: { id: 'user_1', name: 'John Smith', role: 'INVESTOR' },
        content: 'Congratulations TechCorp! This validates our investment thesis. Looking forward to your next milestones!',
        parentId: null,
        likes: 12,
        createdAt: '2024-02-01T15:00:00Z'
    },
    {
        id: 'comment_5',
        postId: 'post_3',
        authorId: 'user_8',
        author: { id: 'user_8', name: 'Cambodia Tech News', role: 'SME' },
        content: 'Amazing achievement! Would love to feature this on our platform. DM sent!',
        parentId: null,
        likes: 4,
        createdAt: '2024-02-01T16:30:00Z'
    },
    {
        id: 'comment_6',
        postId: 'post_4',
        authorId: 'user_5',
        author: { id: 'user_5', name: 'Sarah Chen', role: 'INVESTOR' },
        content: 'Great question! I also recommend joining syndicates as a way to learn. You can invest smaller amounts while learning from experienced lead investors.',
        parentId: null,
        likes: 7,
        createdAt: '2024-02-10T11:30:00Z'
    },
    {
        id: 'comment_7',
        postId: 'post_5',
        authorId: 'user_6',
        author: { id: 'user_6', name: 'Mike Johnson', role: 'ADVISOR' },
        content: 'The new features look promising! Secondary trading will be a game-changer for liquidity in this market.',
        parentId: null,
        likes: 9,
        createdAt: '2024-12-20T09:00:00Z'
    },
    {
        id: 'comment_8',
        postId: 'post_6',
        authorId: 'user_1',
        author: { id: 'user_1', name: 'John Smith', role: 'INVESTOR' },
        content: 'Very comprehensive strategy. How are you planning to handle forex risk given the heavy USD exposure?',
        parentId: null,
        likes: 6,
        createdAt: '2024-12-18T11:00:00Z'
    },
    {
        id: 'comment_9',
        postId: 'post_6',
        authorId: 'user_9',
        author: { id: 'user_9', name: 'Dr. Anika Patel', role: 'INVESTOR' },
        content: "Interesting allocation. Have you considered the healthcare sector? Cambodia's healthtech space is relatively underfunded but growing rapidly.",
        parentId: 'comment_8',
        likes: 3,
        createdAt: '2024-12-18T14:00:00Z'
    }
];

// Get all posts
router.get('/posts', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { category, isPinned, authorId, search, page = 1, limit = 20 } = req.query;
        let filtered = [...posts].filter(p => p.status === 'PUBLISHED');

        // Filter by category
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        // Filter pinned posts
        if (isPinned === 'true') {
            filtered = filtered.filter(p => p.isPinned);
        }

        // Filter by author
        if (authorId) {
            filtered = filtered.filter(p => p.authorId === authorId);
        }

        // Search in title and content
        if (search) {
            const searchLower = (search as string).toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchLower) ||
                p.content.toLowerCase().includes(searchLower)
            );
        }

        // Sort: pinned first, then by date
        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const paginatedPosts = filtered.slice(startIndex, startIndex + Number(limit));

        res.json({
            posts: paginatedPosts,
            total: filtered.length,
            page: Number(page),
            totalPages: Math.ceil(filtered.length / Number(limit))
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get post by ID
router.get('/posts/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        if (postIndex === -1) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        // Increment views
        posts[postIndex].views += 1;

        // Get comments for this post
        const postComments = comments.filter(c => c.postId === req.params.id);

        res.json({
            ...posts[postIndex],
            comments: postComments
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create new post
router.post('/posts', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { title, content, category, smeId, dealId, syndicateId } = req.body;

        const newPost = {
            id: `post_${Date.now()}`,
            tenantId: req.user?.tenantId || 'default',
            authorId: req.user?.id,
            author: {
                id: req.user?.id,
                name: req.user?.email?.split('@')[0],
                role: req.user?.role,
                avatar: null
            },
            title,
            content,
            category: category || 'GENERAL',
            smeId,
            dealId,
            syndicateId,
            likes: 0,
            views: 0,
            isPinned: false,
            isAnnouncement: false,
            status: 'PUBLISHED',
            commentCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        posts.push(newPost);
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Update post
router.put('/posts/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const index = posts.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        // Check ownership (author or admin)
        if (posts[index].authorId !== req.user?.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role || '')) {
            res.status(403).json({ error: 'Not authorized to edit this post' });
            return;
        }

        const { title, content, category, isPinned, isAnnouncement, status } = req.body;

        if (title) posts[index].title = title;
        if (content) posts[index].content = content;
        if (category) posts[index].category = category;
        if (isPinned !== undefined) posts[index].isPinned = isPinned;
        if (isAnnouncement !== undefined) posts[index].isAnnouncement = isAnnouncement;
        if (status) posts[index].status = status;
        posts[index].updatedAt = new Date().toISOString();

        res.json(posts[index]);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Like a post
router.post('/posts/:id/like', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const index = posts.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        posts[index].likes += 1;
        res.json({ likes: posts[index].likes });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Create comment
router.post('/posts/:id/comments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const post = posts.find(p => p.id === req.params.id);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        const { content, parentId } = req.body;

        const newComment = {
            id: `comment_${Date.now()}`,
            postId: req.params.id,
            authorId: req.user?.id,
            author: {
                id: req.user?.id,
                name: req.user?.email?.split('@')[0],
                role: req.user?.role
            },
            content,
            parentId: parentId || null,
            likes: 0,
            createdAt: new Date().toISOString()
        };

        comments.push(newComment);

        // Update comment count
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        posts[postIndex].commentCount += 1;

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Get comments for a post
router.get('/posts/:id/comments', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const postComments = comments.filter(c => c.postId === req.params.id);

        // Sort by date (newest first) and organize by parent
        const topLevel = postComments.filter(c => !c.parentId);
        const withReplies = topLevel.map(comment => ({
            ...comment,
            replies: postComments.filter(c => c.parentId === comment.id)
        }));

        res.json(withReplies);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Like a comment
router.post('/comments/:id/like', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const index = comments.findIndex(c => c.id === req.params.id);
        if (index === -1) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        comments[index].likes += 1;
        res.json({ likes: comments[index].likes });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'Failed to like comment' });
    }
});

// Get community stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');
        const categoryDistribution = {
            GENERAL: publishedPosts.filter(p => p.category === 'GENERAL').length,
            ANNOUNCEMENT: publishedPosts.filter(p => p.category === 'ANNOUNCEMENT').length,
            INVESTOR_INSIGHT: publishedPosts.filter(p => p.category === 'INVESTOR_INSIGHT').length,
            SME_NEWS: publishedPosts.filter(p => p.category === 'SME_NEWS').length,
            QUESTION: publishedPosts.filter(p => p.category === 'QUESTION').length,
            SUCCESS_STORY: publishedPosts.filter(p => p.category === 'SUCCESS_STORY').length
        };

        res.json({
            totalPosts: publishedPosts.length,
            totalComments: comments.length,
            totalViews: publishedPosts.reduce((sum, p) => sum + p.views, 0),
            totalLikes: publishedPosts.reduce((sum, p) => sum + p.likes, 0),
            categoryDistribution,
            mostActiveAuthors: getMostActiveAuthors(publishedPosts),
            trendingPosts: getTrendingPosts(publishedPosts)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

function getMostActiveAuthors(posts: any[]): any[] {
    const authorCounts = posts.reduce((acc: any, post) => {
        const authorId = post.authorId;
        if (!acc[authorId]) {
            acc[authorId] = { author: post.author, postCount: 0 };
        }
        acc[authorId].postCount += 1;
        return acc;
    }, {});

    return Object.values(authorCounts)
        .sort((a: any, b: any) => b.postCount - a.postCount)
        .slice(0, 5);
}

function getTrendingPosts(posts: any[]): any[] {
    return [...posts]
        .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
        .slice(0, 5)
        .map(p => ({
            id: p.id,
            title: p.title,
            views: p.views,
            likes: p.likes,
            author: p.author
        }));
}

export default router;
