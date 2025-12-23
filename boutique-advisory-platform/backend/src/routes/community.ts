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
