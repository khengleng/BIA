import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { prisma, connectDatabase } from './database';
import {
  checkMigrationStatus,
  performMigration,
  getMigrationStatus,
  switchToDatabase,
  fallbackToInMemory,
  shouldUseDatabase
} from './migration-manager';

// Load environment variables
dotenv.config();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize in-memory storage (temporary until migration is complete)
// const prisma = new PrismaClient();

// Test users for role-based testing
const users: any[] = [
  {
    id: 'admin_1',
    email: 'admin@boutique-advisory.com',
    password: '$2a$12$TV8iqAD8TbH4/eDTMZ9wgO87jhuWw5BZTxvBuIuhH1IXR42TzvuXe', // password: admin123
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    tenantId: 'default',
    createdAt: new Date()
  },
  {
    id: 'advisor_1',
    email: 'advisor@boutique-advisory.com',
    password: '$2a$12$vdD2HhKM6g23LYMz/bVB8OBpRoOoEubLLG6E526dSa0R4NEgLUbcO', // password: advisor123
    role: 'ADVISOR',
    firstName: 'Sarah',
    lastName: 'Johnson',
    tenantId: 'default',
    createdAt: new Date()
  },
  {
    id: 'investor_1',
    email: 'investor@boutique-advisory.com',
    password: '$2a$12$QsfpQ02y0Rr9SJ3rqEsV7.ggGUNw97v3a5A.YwIAnknTBCvSxI8Ru', // password: investor123
    role: 'INVESTOR',
    firstName: 'John',
    lastName: 'Smith',
    tenantId: 'default',
    createdAt: new Date()
  },
  {
    id: 'sme_1',
    email: 'sme@boutique-advisory.com',
    password: '$2a$12$NJCImGBHObs/GtaqkBXr/unG24iEOmWJWykAGitdO79dm4LWCrPvq', // password: sme123
    role: 'SME',
    firstName: 'Tech',
    lastName: 'Startup',
    tenantId: 'default',
    createdAt: new Date()
  }
];

// Test SMEs data
const smes: any[] = [
  {
    id: 'sme_1',
    userId: 'sme_1',
    tenantId: 'default',
    name: 'Tech Startup A',
    sector: 'Technology',
    stage: 'Series A',
    fundingRequired: 500000,
    description: 'Innovative fintech solution for digital payments and financial inclusion.',
    website: 'https://techstartupa.com',
    location: 'Phnom Penh, Cambodia',
    registrationNumber: 'TECH001',
    taxId: 'TAX123456',
    foundedDate: '2022-01-15',
    address: '123 Tech Street',
    city: 'Phnom Penh',
    province: 'Phnom Penh',
    postalCode: '12000',
    phone: '+855 12 345 678',
    email: 'contact@techstartupa.com',
    industry: 'Fintech',
    businessStage: 'Early Growth',
    employeeCount: '11-25',
    annualRevenue: '$200,000',
    currentAssets: '$150,000',
    currentLiabilities: '$50,000',
    totalRevenue: '$200,000',
    netProfit: '$30,000',
    valueProposition: 'Secure and affordable digital payment solutions',
    targetMarket: 'Small businesses and individuals in Cambodia',
    competitiveAdvantage: 'Local market expertise and regulatory compliance',
    businessPlan: null,
    financialStatements: null,
    legalDocuments: null,
    createdAt: new Date()
  },
  {
    id: 'sme_2',
    userId: 'advisor_1',
    tenantId: 'default',
    name: 'E-commerce Platform B',
    sector: 'E-commerce',
    stage: 'Seed',
    fundingRequired: 200000,
    description: 'Online marketplace connecting local artisans with global customers.',
    website: 'https://ecommerceb.com',
    location: 'Siem Reap, Cambodia',
    registrationNumber: 'ECOMM002',
    taxId: 'TAX789012',
    foundedDate: '2023-03-20',
    address: '456 Artisan Road',
    city: 'Siem Reap',
    province: 'Siem Reap',
    postalCode: '17252',
    phone: '+855 12 345 679',
    email: 'info@ecommerceb.com',
    industry: 'E-commerce',
    businessStage: 'Startup',
    employeeCount: '6-10',
    annualRevenue: '$80,000',
    currentAssets: '$60,000',
    currentLiabilities: '$20,000',
    totalRevenue: '$80,000',
    netProfit: '$15,000',
    valueProposition: 'Authentic Cambodian handicrafts for global markets',
    targetMarket: 'International tourists and online shoppers',
    competitiveAdvantage: 'Direct artisan partnerships and cultural authenticity',
    businessPlan: null,
    financialStatements: null,
    legalDocuments: null,
    createdAt: new Date()
  }
];

// Test Investors data with preferences for matching
const investors: any[] = [
  {
    id: 'investor_1',
    userId: 'investor_1',
    tenantId: 'default',
    name: 'John Smith',
    type: 'ANGEL',
    kycStatus: 'APPROVED',
    preferences: {
      sectors: ['Technology', 'Fintech', 'E-commerce'],
      stages: ['Seed', 'Series A', 'Growth'],
      minInvestment: 50000,
      maxInvestment: 500000,
      expectedROI: 20,
      investmentTimeline: '3-5 years',
      riskTolerance: 'Medium',
      geographicFocus: ['Cambodia', 'Southeast Asia']
    },
    createdAt: new Date()
  },
  {
    id: 'investor_2',
    userId: 'admin_1',
    tenantId: 'default',
    name: 'Sarah Chen',
    type: 'VENTURE_CAPITAL',
    kycStatus: 'APPROVED',
    preferences: {
      sectors: ['Technology', 'Healthcare', 'Green Energy'],
      stages: ['Series A', 'Series B', 'Expansion'],
      minInvestment: 500000,
      maxInvestment: 5000000,
      expectedROI: 30,
      investmentTimeline: '5-7 years',
      riskTolerance: 'High',
      geographicFocus: ['Cambodia', 'Vietnam', 'Thailand']
    },
    createdAt: new Date()
  },
  {
    id: 'investor_3',
    userId: 'advisor_1',
    tenantId: 'default',
    name: 'Michael Wong',
    type: 'PRIVATE_EQUITY',
    kycStatus: 'APPROVED',
    preferences: {
      sectors: ['Manufacturing', 'Agriculture', 'Real Estate'],
      stages: ['Expansion', 'Mature'],
      minInvestment: 1000000,
      maxInvestment: 10000000,
      expectedROI: 15,
      investmentTimeline: '7-10 years',
      riskTolerance: 'Low',
      geographicFocus: ['Cambodia']
    },
    createdAt: new Date()
  }
];

// Interests data for expressing interest between investors and SMEs
const interests: any[] = [
  {
    id: 'interest_1',
    investorId: 'investor_1',
    smeId: 'sme_1',
    type: 'INVESTOR_TO_SME',
    status: 'PENDING',
    message: 'Interested in discussing potential investment opportunity.',
    createdAt: new Date()
  }
];

// Test Deals data
const deals: any[] = [
  {
    id: 'deal_1',
    smeId: 'sme_1',
    investorId: 'investor_1',
    title: 'Tech Startup A Series A Funding',
    description: 'Series A funding round for Tech Startup A to expand their fintech platform',
    amount: 500000,
    equity: 15,
    status: 'ACTIVE',
    stage: 'DUE_DILIGENCE',
    createdBy: 'advisor_1', // Created by advisor for RBAC testing
    createdAt: new Date()
  }
];

// Test Documents data (temporary until migration is complete)
const documents: any[] = [
  {
    id: 'doc_1',
    name: 'Identification Document',
    type: 'PDF',
    size: '1.2 MB',
    uploaded: '2024-01-15',
    mimeType: 'application/pdf',
    dealId: null,
    userId: 'user_1'
  },
  {
    id: 'doc_2',
    name: 'Proof of Funds',
    type: 'PDF',
    size: '2.1 MB',
    uploaded: '2024-01-10',
    mimeType: 'application/pdf',
    dealId: null,
    userId: 'user_1'
  },
  {
    id: 'doc_3',
    name: 'Professional References',
    type: 'PDF',
    size: '0.8 MB',
    uploaded: '2024-01-05',
    mimeType: 'application/pdf',
    dealId: null,
    userId: 'user_1'
  },
  {
    id: 'doc_4',
    name: 'Term Sheet',
    type: 'PDF',
    size: '1.5 MB',
    uploaded: '2024-01-20',
    mimeType: 'application/pdf',
    dealId: 'deal_1',
    userId: 'user_1'
  },
  {
    id: 'doc_5',
    name: 'Financial Model',
    type: 'XLSX',
    size: '2.8 MB',
    uploaded: '2024-01-18',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dealId: 'deal_1',
    userId: 'user_1'
  },
  {
    id: 'doc_6',
    name: 'Due Diligence Report',
    type: 'PDF',
    size: '3.2 MB',
    uploaded: '2024-01-22',
    mimeType: 'application/pdf',
    dealId: 'deal_1',
    userId: 'user_1'
  }
];

// ============================================
// MESSAGING SYSTEM DATA
// ============================================
const conversations: any[] = [
  {
    id: 'conv_1',
    participants: ['investor_1', 'sme_1'],
    participantDetails: [
      { id: 'investor_1', type: 'INVESTOR', name: 'John Smith' },
      { id: 'sme_1', type: 'SME', name: 'Tech Startup A' }
    ],
    dealId: 'deal_1',
    lastMessage: 'Looking forward to our meeting next week!',
    lastMessageAt: new Date(),
    unreadCount: { investor_1: 0, sme_1: 1 },
    createdAt: new Date()
  }
];

const messages: any[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'investor_1',
    senderName: 'John Smith',
    senderType: 'INVESTOR',
    content: 'Hello! I am interested in learning more about your fintech platform.',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
  },
  {
    id: 'msg_2',
    conversationId: 'conv_1',
    senderId: 'sme_1',
    senderName: 'Tech Startup A',
    senderType: 'SME',
    content: 'Thank you for your interest! We would be happy to schedule a call to discuss our platform in detail.',
    read: true,
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: 'msg_3',
    conversationId: 'conv_1',
    senderId: 'investor_1',
    senderName: 'John Smith',
    senderType: 'INVESTOR',
    content: 'Looking forward to our meeting next week!',
    read: false,
    createdAt: new Date()
  }
];

// ============================================
// VIRTUAL DATA ROOM DATA
// ============================================
const dataRooms: any[] = [
  {
    id: 'dr_1',
    dealId: 'deal_1',
    name: 'Tech Startup A - Series A Due Diligence',
    status: 'ACTIVE',
    createdBy: 'advisor_1',
    accessList: ['investor_1', 'advisor_1', 'admin_1'],
    documents: [
      {
        id: 'drd_1',
        name: 'Executive Summary',
        category: 'Overview',
        size: '2.1 MB',
        uploadedBy: 'advisor_1',
        uploadedAt: new Date(Date.now() - 86400000 * 5),
        accessCount: 12,
        lastAccessedBy: 'investor_1',
        lastAccessedAt: new Date()
      },
      {
        id: 'drd_2',
        name: 'Financial Statements 2023',
        category: 'Financials',
        size: '4.5 MB',
        uploadedBy: 'advisor_1',
        uploadedAt: new Date(Date.now() - 86400000 * 4),
        accessCount: 8,
        lastAccessedBy: 'investor_1',
        lastAccessedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'drd_3',
        name: 'Business Plan',
        category: 'Strategy',
        size: '3.2 MB',
        uploadedBy: 'advisor_1',
        uploadedAt: new Date(Date.now() - 86400000 * 3),
        accessCount: 15,
        lastAccessedBy: 'investor_1',
        lastAccessedAt: new Date(Date.now() - 7200000)
      },
      {
        id: 'drd_4',
        name: 'Cap Table',
        category: 'Legal',
        size: '0.8 MB',
        uploadedBy: 'advisor_1',
        uploadedAt: new Date(Date.now() - 86400000 * 2),
        accessCount: 6,
        lastAccessedBy: 'investor_1',
        lastAccessedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'drd_5',
        name: 'Term Sheet Draft',
        category: 'Legal',
        size: '1.1 MB',
        uploadedBy: 'advisor_1',
        uploadedAt: new Date(Date.now() - 86400000),
        accessCount: 4,
        lastAccessedBy: 'investor_1',
        lastAccessedAt: new Date(Date.now() - 3600000 * 2)
      }
    ],
    activityLog: [
      { action: 'VIEWED', documentId: 'drd_1', userId: 'investor_1', timestamp: new Date() },
      { action: 'DOWNLOADED', documentId: 'drd_2', userId: 'investor_1', timestamp: new Date(Date.now() - 3600000) }
    ],
    createdAt: new Date(Date.now() - 86400000 * 7)
  }
];

// ============================================
// DEAL PIPELINE STAGES
// ============================================
const pipelineStages = [
  { id: 'stage_1', name: 'Initial Contact', order: 1, color: '#6366f1' },
  { id: 'stage_2', name: 'Term Sheet', order: 2, color: '#8b5cf6' },
  { id: 'stage_3', name: 'Due Diligence', order: 3, color: '#a855f7' },
  { id: 'stage_4', name: 'Legal Review', order: 4, color: '#d946ef' },
  { id: 'stage_5', name: 'Negotiation', order: 5, color: '#ec4899' },
  { id: 'stage_6', name: 'Closing', order: 6, color: '#f43f5e' },
  { id: 'stage_7', name: 'Completed', order: 7, color: '#22c55e' }
];

// Enhanced deals with pipeline info
const pipelineDeals: any[] = [
  {
    id: 'deal_1',
    title: 'Tech Startup A - Series A',
    smeId: 'sme_1',
    smeName: 'Tech Startup A',
    investorId: 'investor_1',
    investorName: 'John Smith',
    amount: 500000,
    stage: 'Due Diligence',
    stageOrder: 3,
    priority: 'HIGH',
    daysInStage: 5,
    expectedClose: new Date(Date.now() + 86400000 * 30),
    progress: 45,
    lastActivity: new Date()
  },
  {
    id: 'deal_2',
    title: 'Green Energy Co - Seed Round',
    smeId: 'sme_2',
    smeName: 'Green Energy Solutions',
    investorId: 'investor_2',
    investorName: 'Sarah Chen',
    amount: 250000,
    stage: 'Term Sheet',
    stageOrder: 2,
    priority: 'MEDIUM',
    daysInStage: 3,
    expectedClose: new Date(Date.now() + 86400000 * 45),
    progress: 25,
    lastActivity: new Date(Date.now() - 86400000)
  },
  {
    id: 'deal_3',
    title: 'HealthTech Inc - Series B',
    smeId: 'sme_3',
    smeName: 'HealthTech Inc',
    investorId: 'investor_3',
    investorName: 'Michael Wong',
    amount: 2000000,
    stage: 'Legal Review',
    stageOrder: 4,
    priority: 'HIGH',
    daysInStage: 7,
    expectedClose: new Date(Date.now() + 86400000 * 14),
    progress: 70,
    lastActivity: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: 'deal_4',
    title: 'AgriTech Startup - Seed',
    smeId: 'sme_4',
    smeName: 'AgriTech Solutions',
    investorId: 'investor_1',
    investorName: 'John Smith',
    amount: 150000,
    stage: 'Initial Contact',
    stageOrder: 1,
    priority: 'LOW',
    daysInStage: 2,
    expectedClose: new Date(Date.now() + 86400000 * 60),
    progress: 10,
    lastActivity: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'deal_5',
    title: 'EduTech Platform - Series A',
    smeId: 'sme_5',
    smeName: 'EduLearn Platform',
    investorId: 'investor_2',
    investorName: 'Sarah Chen',
    amount: 750000,
    stage: 'Closing',
    stageOrder: 6,
    priority: 'HIGH',
    daysInStage: 1,
    expectedClose: new Date(Date.now() + 86400000 * 7),
    progress: 90,
    lastActivity: new Date()
  }
];

// ============================================
// NOTIFICATIONS SYSTEM DATA
// ============================================
const notifications: any[] = [
  {
    id: 'notif_1',
    userId: 'admin_1',
    type: 'MATCH_FOUND',
    title: 'New High-Score Match!',
    message: 'Tech Startup A has a 85% compatibility score with Investor John Smith.',
    read: false,
    actionUrl: '/matchmaking',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'notif_2',
    userId: 'admin_1',
    type: 'INTEREST_RECEIVED',
    title: 'Interest Expressed',
    message: 'Investor Sarah Chen expressed interest in Green Energy Solutions.',
    read: false,
    actionUrl: '/matchmaking',
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'notif_3',
    userId: 'admin_1',
    type: 'DEAL_UPDATE',
    title: 'Deal Stage Changed',
    message: 'HealthTech Inc deal moved to Legal Review stage.',
    read: true,
    actionUrl: '/pipeline',
    createdAt: new Date(Date.now() - 14400000)
  },
  {
    id: 'notif_4',
    userId: 'admin_1',
    type: 'DOCUMENT_UPLOADED',
    title: 'New Document',
    message: 'Term Sheet uploaded to Tech Startup A data room.',
    read: true,
    actionUrl: '/dataroom',
    createdAt: new Date(Date.now() - 21600000)
  },
  {
    id: 'notif_5',
    userId: 'admin_1',
    type: 'MESSAGE_RECEIVED',
    title: 'New Message',
    message: 'You have a new message from John Smith.',
    read: false,
    actionUrl: '/messages',
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'notif_6',
    userId: 'admin_1',
    type: 'MEETING_REMINDER',
    title: 'Upcoming Meeting',
    message: 'Pitch session with Tech Startup A in 1 hour.',
    read: false,
    actionUrl: '/calendar',
    createdAt: new Date(Date.now() - 900000)
  }
];

// ============================================
// CALENDAR & SCHEDULING DATA
// ============================================
const calendarEvents: any[] = [
  {
    id: 'event_1',
    title: 'Pitch Session: Tech Startup A',
    description: 'Initial pitch presentation and Q&A session',
    type: 'PITCH_SESSION',
    startTime: new Date(Date.now() + 3600000), // 1 hour from now
    endTime: new Date(Date.now() + 7200000), // 2 hours from now
    location: 'Virtual - Zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    attendees: [
      { id: 'admin_1', name: 'Admin User', role: 'ADVISOR', status: 'ACCEPTED' },
      { id: 'investor_1', name: 'John Smith', role: 'INVESTOR', status: 'ACCEPTED' },
      { id: 'sme_1', name: 'Tech Startup A', role: 'SME', status: 'ACCEPTED' }
    ],
    dealId: 'deal_1',
    createdBy: 'admin_1',
    status: 'CONFIRMED',
    color: '#6366f1',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'event_2',
    title: 'Due Diligence Review: HealthTech Inc',
    description: 'Review of financial documents and legal compliance',
    type: 'DUE_DILIGENCE',
    startTime: new Date(Date.now() + 86400000), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000),
    location: 'Conference Room A',
    meetingLink: null,
    attendees: [
      { id: 'admin_1', name: 'Admin User', role: 'ADVISOR', status: 'ACCEPTED' },
      { id: 'investor_3', name: 'Michael Wong', role: 'INVESTOR', status: 'PENDING' }
    ],
    dealId: 'deal_3',
    createdBy: 'admin_1',
    status: 'PENDING',
    color: '#a855f7',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'event_3',
    title: 'Term Sheet Negotiation: Green Energy',
    description: 'Final term sheet discussion with investor',
    type: 'NEGOTIATION',
    startTime: new Date(Date.now() + 86400000 * 2), // Day after tomorrow
    endTime: new Date(Date.now() + 86400000 * 2 + 5400000),
    location: 'Virtual - Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { id: 'admin_1', name: 'Admin User', role: 'ADVISOR', status: 'ACCEPTED' },
      { id: 'investor_2', name: 'Sarah Chen', role: 'INVESTOR', status: 'ACCEPTED' },
      { id: 'sme_2', name: 'Green Energy Solutions', role: 'SME', status: 'PENDING' }
    ],
    dealId: 'deal_2',
    createdBy: 'admin_1',
    status: 'CONFIRMED',
    color: '#ec4899',
    createdAt: new Date()
  },
  {
    id: 'event_4',
    title: 'Closing Meeting: EduTech Platform',
    description: 'Final signing and closing ceremony',
    type: 'CLOSING',
    startTime: new Date(Date.now() + 86400000 * 5), // 5 days from now
    endTime: new Date(Date.now() + 86400000 * 5 + 7200000),
    location: 'Phnom Penh Office',
    meetingLink: null,
    attendees: [
      { id: 'admin_1', name: 'Admin User', role: 'ADVISOR', status: 'ACCEPTED' },
      { id: 'investor_2', name: 'Sarah Chen', role: 'INVESTOR', status: 'ACCEPTED' },
      { id: 'sme_5', name: 'EduLearn Platform', role: 'SME', status: 'ACCEPTED' }
    ],
    dealId: 'deal_5',
    createdBy: 'admin_1',
    status: 'CONFIRMED',
    color: '#22c55e',
    createdAt: new Date(Date.now() - 172800000)
  }
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xlsx|xls|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, XLSX, XLS, JPG, JPEG, PNG files are allowed'));
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      'https://frontend-production-deae.up.railway.app',
      process.env.FRONTEND_URL || 'https://frontend-production-deae.up.railway.app'
    ]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:1001'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Rate limiting configurations
// General API rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict rate limiter for auth endpoints - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
  skipSuccessfulRequests: true // Don't count successful logins
});

// Password reset limiter - 3 attempts per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many password reset attempts, please try again after 1 hour.' }
});

// Registration limiter - 3 registrations per hour per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, please try again after 1 hour.' }
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// CAPTCHA verification helper function
const verifyCaptcha = async (captchaToken: string): Promise<boolean> => {
  // If no CAPTCHA secret is configured, skip verification (for development)
  const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!captchaSecret) {
    console.log('⚠️ CAPTCHA verification skipped - RECAPTCHA_SECRET_KEY not configured');
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${captchaSecret}&response=${captchaToken}`
    });

    const data = await response.json() as { success: boolean; score?: number };

    // For reCAPTCHA v3, check score (0.0 - 1.0, higher is more likely human)
    if (data.score !== undefined) {
      return data.success && data.score >= 0.5;
    }

    // For reCAPTCHA v2
    return data.success;
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return false;
  }
};


// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // Check if we should use database or in-memory
    const useDatabase = await shouldUseDatabase();

    let user;
    if (useDatabase) {
      // Find user in database
      user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
    } else {
      // Fallback to in-memory
      user = users.find(u => u.id === decoded.userId);
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Resource ownership middleware
const authorizeResourceAccess = (resourceType: 'sme' | 'investor' | 'deal') => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceId = req.params.id;
    let resource: any = null;

    switch (resourceType) {
      case 'sme':
        resource = smes.find(s => s.id === resourceId);
        break;
      case 'investor':
        resource = investors.find(i => i.id === resourceId);
        break;
      case 'deal':
        resource = deals.find(d => d.id === resourceId);
        break;
    }

    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Admin can access all resources
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Users can only access their own resources
    if (resource.userId === req.user.id) {
      return next();
    }

    res.status(403).json({ error: 'Access denied' });
  };
};

// Migration management endpoints
app.get('/api/migration/status', async (req, res) => {
  try {
    const status = await checkMigrationStatus();
    res.json({
      ...status,
      message: status.completed ? 'Migration completed' : 'Migration needed'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/migration/perform', async (req, res) => {
  try {
    console.log('🔄 Migration requested via API...');
    const result = await performMigration();

    if (result.completed) {
      res.json({
        success: true,
        message: 'Migration completed successfully',
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Migration failed',
        ...result
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/migration/switch-to-database', (req, res) => {
  try {
    const success = switchToDatabase();
    if (success) {
      res.json({
        success: true,
        message: 'Switched to database mode successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Cannot switch to database mode - migration not completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to switch to database mode'
    });
  }
});

app.post('/api/migration/fallback-to-memory', (req, res) => {
  try {
    fallbackToInMemory();
    res.json({
      success: true,
      message: 'Fallback to in-memory mode successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fallback to in-memory mode'
    });
  }
});

// Test endpoint to get login tokens for testing
app.get('/api/test/tokens', (req, res) => {
  try {
    const tokens = {
      admin: jwt.sign(
        { userId: 'admin_1', email: 'admin@boutique-advisory.com', role: 'ADMIN' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      ),
      advisor: jwt.sign(
        { userId: 'advisor_1', email: 'advisor@boutique-advisory.com', role: 'ADVISOR' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      ),
      investor: jwt.sign(
        { userId: 'investor_1', email: 'investor@boutique-advisory.com', role: 'INVESTOR' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      ),
      sme: jwt.sign(
        { userId: 'sme_1', email: 'sme@boutique-advisory.com', role: 'SME' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      )
    };

    res.json({
      message: 'Test tokens generated successfully',
      tokens,
      testUsers: {
        admin: { email: 'admin@boutique-advisory.com', password: 'admin123' },
        advisor: { email: 'advisor@boutique-advisory.com', password: 'advisor123' },
        investor: { email: 'investor@boutique-advisory.com', password: 'investor123' },
        sme: { email: 'sme@boutique-advisory.com', password: 'sme123' }
      },
      rolePermissions: {
        ADMIN: {
          description: 'Full system access',
          permissions: ['View all SMEs', 'Create SMEs', 'Edit SMEs', 'Delete SMEs', 'View all Investors', 'Create Investors', 'Edit Investors', 'Delete Investors', 'View all Deals', 'Create Deals', 'Edit Deals', 'Delete Deals', 'Access Reports', 'Manage Users']
        },
        ADVISOR: {
          description: 'Advisory and management access',
          permissions: ['View all SMEs', 'Create SMEs', 'Edit SMEs', 'Delete SMEs', 'View all Investors', 'Create Investors', 'Edit Investors', 'Delete Investors', 'View all Deals', 'Create Deals', 'Edit Deals', 'Delete Deals', 'Access Reports']
        },
        INVESTOR: {
          description: 'Investment-focused access',
          permissions: ['View SMEs', 'View Investors', 'View Deals', 'Create Deals', 'Access Reports']
        },
        SME: {
          description: 'Limited access for SME users',
          permissions: ['View own SME profile', 'Edit own SME profile', 'View Investors', 'View Deals']
        }
      }
    });
  } catch (error) {
    console.error('Error generating test tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Simple health check without database
    res.json({
      service: 'boutique-advisory-platform',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'in-memory'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      service: 'boutique-advisory-platform',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

// Authentication endpoints
app.post('/api/auth/register', registrationLimiter, async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({
        error: 'Missing required fields: email, password, role, firstName, lastName'
      });
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      res.status(409).json({
        error: 'User already exists with this email'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      tenantId: 'default',
      createdAt: new Date()
    };

    users.push(user);

    // Create role-specific profile
    if (role === 'SME') {
      const sme = {
        id: `sme_${Date.now()}`,
        userId: user.id,
        tenantId: 'default',
        name: `${firstName} ${lastName}`,
        sector: 'Technology',
        stage: 'SEED',
        fundingRequired: 100000,
        description: 'New SME registration',
        createdAt: new Date()
      };
      smes.push(sme);
    } else if (role === 'INVESTOR') {
      const investor = {
        id: `investor_${Date.now()}`,
        userId: user.id,
        tenantId: 'default',
        name: `${firstName} ${lastName}`,
        type: 'ANGEL',
        kycStatus: 'PENDING',
        createdAt: new Date()
      };
      investors.push(investor);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required'
      });
      return;
    }

    // Check if we should use database or in-memory
    const useDatabase = await shouldUseDatabase();

    let user;
    if (useDatabase) {
      // Find user in database using tenantId_email compound unique constraint
      user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: 'default',
            email: email
          }
        }
      });
    } else {
      // Fallback to in-memory
      user = users.find(u => u.email === email);
    }

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password endpoint
app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if user exists (don't reveal if email exists for security)
    const user = users.find(u => u.email === email);

    // Always return success to prevent email enumeration attacks
    console.log(`Password reset requested for: ${email}, User exists: ${!!user}`);

    // In production, you would:
    // 1. Generate a secure token
    // 2. Store token with expiration in database
    // 3. Send email with reset link

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password endpoint
app.post('/api/auth/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { token, password, captchaToken } = req.body;

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        res.status(400).json({ error: 'CAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // In production, you would:
    // 1. Verify the reset token is valid and not expired
    // 2. Find the user associated with the token
    // 3. Hash and update the password
    // 4. Invalidate the token

    // For demo purposes, we'll return success
    console.log(`Password reset attempted with token: ${token.substring(0, 10)}...`);

    res.json({
      message: 'Password has been reset successfully.',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SME endpoints
app.get('/api/smes', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'INVESTOR', 'SME'), async (req, res) => {
  try {
    const smesWithUsers = smes.map(sme => ({
      ...sme,
      user: users.find(u => u.id === sme.userId)
    }));
    res.json(smesWithUsers);
  } catch (error) {
    console.error('Error fetching SMEs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/smes/:id', authenticateToken, async (req, res) => {
  try {
    const sme = smes.find(s => s.id === req.params.id);

    if (!sme) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    const smeWithUser = {
      ...sme,
      user: users.find(u => u.id === sme.userId)
    };

    res.json(smeWithUser);
  } catch (error) {
    console.error('Error fetching SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/smes', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const {
      companyName,
      registrationNumber,
      taxId,
      foundedDate,
      website,
      address,
      city,
      province,
      postalCode,
      phone,
      email,
      sector,
      industry,
      businessStage,
      employeeCount,
      annualRevenue,
      fundingRequired,
      currentAssets,
      currentLiabilities,
      totalRevenue,
      netProfit,
      businessDescription,
      valueProposition,
      targetMarket,
      competitiveAdvantage
    } = req.body;

    // Validate required fields
    if (!companyName || !sector || !businessDescription) {
      res.status(400).json({ error: 'Company name, sector, and business description are required' });
      return;
    }

    const sme = {
      id: `sme_${Date.now()}`,
      tenantId: 'default',
      userId: req.user!.id,
      name: companyName,
      sector,
      stage: businessStage || 'Startup',
      fundingRequired: fundingRequired ? parseFloat(fundingRequired.replace(/[^0-9.-]+/g, '')) : 0,
      description: businessDescription,
      website,
      location: `${address}, ${city}, ${province}`,
      // Additional fields
      registrationNumber,
      taxId,
      foundedDate,
      address,
      city,
      province,
      postalCode,
      phone,
      email,
      industry,
      employeeCount,
      annualRevenue,
      currentAssets,
      currentLiabilities,
      totalRevenue,
      netProfit,
      valueProposition,
      targetMarket,
      competitiveAdvantage,
      // File uploads (temporarily disabled for testing)
      businessPlan: null,
      financialStatements: null,
      legalDocuments: null,
      createdAt: new Date()
    };

    smes.push(sme);

    const smeWithUser = {
      ...sme,
      user: users.find(u => u.id === sme.userId)
    };

    res.status(201).json(smeWithUser);
  } catch (error) {
    console.error('Error creating SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/smes/:id', authenticateToken, async (req, res) => {
  try {
    const { name, sector, stage, fundingRequired, description, website, location } = req.body;

    const smeIndex = smes.findIndex(s => s.id === req.params.id);
    if (smeIndex === -1) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    // Check permissions: ADMIN/ADVISOR can edit all, or user must own the SME profile
    const sme = smes[smeIndex];
    const isOwner = sme.userId === req.user!.userId;
    const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

    if (!isOwner && !isAdminOrAdvisor) {
      res.status(403).json({ error: 'Permission denied. You can only edit your own SME profile.' });
      return;
    }

    smes[smeIndex] = {
      ...smes[smeIndex],
      name,
      sector,
      stage,
      fundingRequired: parseFloat(fundingRequired),
      description,
      website,
      location
    };

    const smeWithUser = {
      ...smes[smeIndex],
      user: users.find(u => u.id === smes[smeIndex].userId)
    };

    res.json(smeWithUser);
  } catch (error) {
    console.error('Error updating SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/smes/:id', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const smeIndex = smes.findIndex(s => s.id === req.params.id);
    if (smeIndex === -1) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    smes.splice(smeIndex, 1);

    res.json({ message: 'SME deleted successfully' });
  } catch (error) {
    console.error('Error deleting SME:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Investor endpoints
app.get('/api/investors', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'SME', 'INVESTOR'), async (req, res) => {
  try {
    const investorsWithUsers = investors.map(investor => ({
      ...investor,
      user: users.find(u => u.id === investor.userId)
    }));
    res.json(investorsWithUsers);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/investors/:id', authenticateToken, async (req, res) => {
  try {
    const investor = investors.find(i => i.id === req.params.id);

    if (!investor) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    const investorWithUser = {
      ...investor,
      user: users.find(u => u.id === investor.userId)
    };

    res.json(investorWithUser);
  } catch (error) {
    console.error('Error fetching investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/investors', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const { name, type, preferences } = req.body;

    const investor = {
      id: `investor_${Date.now()}`,
      tenantId: 'default',
      userId: req.user!.id,
      name,
      type,
      preferences: preferences || {},
      createdAt: new Date()
    };

    investors.push(investor);

    const investorWithUser = {
      ...investor,
      user: users.find(u => u.id === investor.userId)
    };

    res.status(201).json(investorWithUser);
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/investors/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, preferences } = req.body;

    const investorIndex = investors.findIndex(i => i.id === req.params.id);
    if (investorIndex === -1) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    // Check permissions: ADMIN/ADVISOR can edit all, or user must own the investor profile
    const investor = investors[investorIndex];
    const isOwner = investor.userId === req.user!.userId;
    const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

    if (!isOwner && !isAdminOrAdvisor) {
      res.status(403).json({ error: 'Permission denied. You can only edit your own investor profile.' });
      return;
    }

    investors[investorIndex] = {
      ...investors[investorIndex],
      name,
      type,
      preferences: preferences || {}
    };

    const investorWithUser = {
      ...investors[investorIndex],
      user: users.find(u => u.id === investors[investorIndex].userId)
    };

    res.json(investorWithUser);
  } catch (error) {
    console.error('Error updating investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/investors/:id', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const investorIndex = investors.findIndex(i => i.id === req.params.id);
    if (investorIndex === -1) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    investors.splice(investorIndex, 1);

    res.json({ message: 'Investor deleted successfully' });
  } catch (error) {
    console.error('Error deleting investor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deal endpoints
app.get('/api/deals', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'SME', 'INVESTOR'), async (req, res) => {
  try {
    const dealsWithRelations = deals.map(deal => ({
      ...deal,
      sme: smes.find(s => s.id === deal.smeId),
      documents: documents.filter(d => d.dealId === deal.id)
    }));
    res.json(dealsWithRelations);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const deal = deals.find(d => d.id === req.params.id);

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    const dealWithRelations = {
      ...deal,
      sme: smes.find(s => s.id === deal.smeId),
      documents: documents.filter(d => d.dealId === deal.id)
    };

    res.json(dealWithRelations);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/deals', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR', 'INVESTOR'), async (req, res) => {
  try {
    const { smeId, title, description, amount, equity, successFee, stage } = req.body;

    const deal = {
      id: `deal_${Date.now()}`,
      tenantId: 'default',
      smeId,
      title,
      description,
      amount: parseFloat(amount),
      equity: equity ? parseFloat(equity) : null,
      successFee: successFee ? parseFloat(successFee) : null,
      status: 'DRAFT',
      stage: stage || 'Initial Contact',
      createdBy: req.user!.userId,
      createdAt: new Date()
    };

    deals.push(deal);

    const dealWithRelations = {
      ...deal,
      sme: smes.find(s => s.id === deal.smeId)
    };

    res.status(201).json(dealWithRelations);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, amount, equity, status, successFee, stage } = req.body;

    const dealIndex = deals.findIndex(d => d.id === req.params.id);
    if (dealIndex === -1) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    // Check permissions: ADMIN/ADVISOR can edit all deals
    // INVESTOR can only edit deals they created
    // SME cannot edit deals
    const deal = deals[dealIndex];
    const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';
    const isInvestorOwner = req.user!.role === 'INVESTOR' && deal.createdBy === req.user!.userId;

    if (!isAdminOrAdvisor && !isInvestorOwner) {
      res.status(403).json({ error: 'Permission denied. Only ADMIN, ADVISOR, or the deal creator can edit this deal.' });
      return;
    }


    deals[dealIndex] = {
      ...deals[dealIndex],
      title,
      description,
      amount: parseFloat(amount),
      equity: equity ? parseFloat(equity) : null,
      status,
      stage,
      successFee: successFee ? parseFloat(successFee) : null
    };

    const dealWithRelations = {
      ...deals[dealIndex],
      sme: smes.find(s => s.id === deals[dealIndex].smeId)
    };

    res.json(dealWithRelations);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/deals/:id', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const dealIndex = deals.findIndex(d => d.id === req.params.id);
    if (dealIndex === -1) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    deals.splice(dealIndex, 1);

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Document endpoints
app.post('/api/documents', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { name, type, smeId, dealId } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const document = {
      id: `doc_${Date.now()}`,
      tenantId: 'default',
      name,
      type,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      smeId: smeId || null,
      dealId: dealId || null,
      uploadedBy: req.user!.id,
      createdAt: new Date()
    };

    documents.push(document);

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/:docName', async (req, res) => {
  try {
    // Check for token in Authorization header or query parameter
    const authHeader = req.headers['authorization'];
    const queryToken = req.query.token as string;
    const token = authHeader ? authHeader.split(' ')[1] : queryToken;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    } catch (error) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    const { docName } = req.params;
    const decodedDocName = decodeURIComponent(docName);

    const document = documents.find(d => d.name === decodedDocName);

    if (!document) {
      res.status(404).json({
        error: 'Document not found',
        message: `Document "${decodedDocName}" not found`
      });
      return;
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);

    // In production, you would serve the actual file from storage
    res.send(`Mock content for ${document.name}`);

  } catch (error) {
    console.error('Document viewing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/:docName/download', authenticateToken, async (req, res) => {
  try {
    const { docName } = req.params;
    const decodedDocName = decodeURIComponent(docName);

    const document = documents.find(d => d.name === decodedDocName);

    if (!document) {
      res.status(404).json({
        error: 'Document not found',
        message: `Document "${decodedDocName}" not found`
      });
      return;
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);

    // In production, you would serve the actual file from storage
    res.send(`Mock content for ${document.name} download`);

  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advisory services endpoints
app.get('/api/advisory/services', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would come from a database
    const services = [
      {
        id: 1,
        name: 'Business Strategy Consulting',
        category: 'Strategy',
        description: 'Comprehensive business strategy development and implementation',
        duration: '2-4 weeks',
        price: '$5,000 - $15,000',
        advisor: 'Dr. Sarah Johnson',
        rating: 4.8,
        reviews: 24,
        features: ['Market Analysis', 'Competitive Positioning', 'Growth Strategy', 'Implementation Plan']
      },
      {
        id: 2,
        name: 'Financial Planning & Analysis',
        category: 'Finance',
        description: 'Financial modeling, forecasting, and investment analysis',
        duration: '1-3 weeks',
        price: '$3,000 - $10,000',
        advisor: 'Michael Chen',
        rating: 4.9,
        reviews: 18,
        features: ['Financial Modeling', 'Forecasting', 'Investment Analysis', 'Risk Assessment']
      }
    ];

    res.json(services);
  } catch (error) {
    console.error('Error fetching advisory services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/advisory/book', authenticateToken, async (req, res) => {
  try {
    const { serviceId, serviceName, advisorName, preferredDate, notes } = req.body;

    // In a real implementation, this would create a booking record in the database
    const booking = {
      id: Date.now(),
      serviceId,
      serviceName,
      advisorName,
      preferredDate,
      notes,
      status: 'Pending',
      userId: req.user!.id,
      createdAt: new Date()
    };

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// MATCHMAKING ENGINE APIs
// ============================================

// Calculate match score between an investor and an SME
function calculateMatchScore(investor: any, sme: any): { score: number; factors: any } {
  let score = 0;
  const factors: any = {};

  // 1. Sector Match (max 30 points)
  const investorSectors = investor.preferences?.sectors || [];
  const smeSector = sme.sector || '';
  if (investorSectors.some((s: string) => smeSector.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(smeSector.toLowerCase()))) {
    score += 30;
    factors.sector = { score: 30, match: true, details: `${smeSector} matches investor preferences` };
  } else {
    factors.sector = { score: 0, match: false, details: `${smeSector} not in preferred sectors` };
  }

  // 2. Stage Match (max 25 points)
  const investorStages = investor.preferences?.stages || [];
  const smeStage = sme.stage || '';
  const stageMatch = investorStages.some((s: string) =>
    smeStage.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(smeStage.toLowerCase())
  );
  if (stageMatch) {
    score += 25;
    factors.stage = { score: 25, match: true, details: `${smeStage} matches investor stage preferences` };
  } else {
    factors.stage = { score: 0, match: false, details: `${smeStage} not in preferred stages` };
  }

  // 3. Investment Amount Match (max 25 points)
  const minInvestment = investor.preferences?.minInvestment || 0;
  const maxInvestment = investor.preferences?.maxInvestment || Infinity;
  const fundingRequired = sme.fundingRequired || 0;

  if (fundingRequired >= minInvestment && fundingRequired <= maxInvestment) {
    score += 25;
    factors.amount = { score: 25, match: true, details: `$${fundingRequired.toLocaleString()} is within investment range` };
  } else if (fundingRequired > 0) {
    // Partial score if close
    const midPoint = (minInvestment + maxInvestment) / 2;
    const distance = Math.abs(fundingRequired - midPoint);
    const partialScore = Math.max(0, 15 - Math.floor(distance / midPoint * 15));
    score += partialScore;
    factors.amount = { score: partialScore, match: false, details: `$${fundingRequired.toLocaleString()} outside preferred range ($${minInvestment.toLocaleString()} - $${maxInvestment.toLocaleString()})` };
  } else {
    factors.amount = { score: 0, match: false, details: 'Funding amount not specified' };
  }

  // 4. Geographic Match (max 10 points)
  const investorGeo = investor.preferences?.geographicFocus || [];
  const smeLocation = sme.location || '';
  const geoMatch = investorGeo.some((g: string) =>
    smeLocation.toLowerCase().includes(g.toLowerCase())
  );
  if (geoMatch) {
    score += 10;
    factors.geography = { score: 10, match: true, details: `Location matches investor focus` };
  } else {
    factors.geography = { score: 0, match: false, details: `Location not in preferred regions` };
  }

  // 5. SME Certification Bonus (max 10 points)
  if (sme.certified || sme.status === 'CERTIFIED') {
    score += 10;
    factors.certification = { score: 10, match: true, details: 'SME is certified' };
  } else {
    factors.certification = { score: 0, match: false, details: 'SME not yet certified' };
  }

  return { score: Math.min(score, 100), factors };
}

// Get matches for investor (shows matching SMEs)
app.get('/api/matches/investor/:investorId', authenticateToken, async (req, res) => {
  try {
    const { investorId } = req.params;
    const investor = investors.find(i => i.id === investorId);

    if (!investor) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    // Calculate match scores for all SMEs
    const matches = smes.map(sme => {
      const { score, factors } = calculateMatchScore(investor, sme);

      // Check if there's mutual interest
      const hasInvestorInterest = interests.some(i => i.investorId === investorId && i.smeId === sme.id);
      const hasSMEInterest = interests.some(i => i.smeId === sme.id && i.investorId === investorId && i.type === 'SME_TO_INVESTOR');
      const mutualInterest = hasInvestorInterest && hasSMEInterest;

      return {
        sme: {
          id: sme.id,
          name: sme.name,
          sector: sme.sector,
          stage: sme.stage,
          fundingRequired: sme.fundingRequired,
          description: sme.description,
          location: sme.location,
          certified: sme.certified || sme.status === 'CERTIFIED'
        },
        matchScore: score,
        matchFactors: factors,
        interestStatus: {
          investorExpressedInterest: hasInvestorInterest,
          smeExpressedInterest: hasSMEInterest,
          mutualInterest
        }
      };
    });

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      investor: { id: investor.id, name: investor.name },
      matches,
      totalMatches: matches.length,
      highMatches: matches.filter(m => m.matchScore >= 70).length,
      mutualInterests: matches.filter(m => m.interestStatus.mutualInterest).length
    });
  } catch (error) {
    console.error('Error getting investor matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get matches for SME (shows matching investors)
app.get('/api/matches/sme/:smeId', authenticateToken, async (req, res) => {
  try {
    const { smeId } = req.params;
    const sme = smes.find(s => s.id === smeId);

    if (!sme) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    // Calculate match scores for all investors
    const matches = investors.map(investor => {
      const { score, factors } = calculateMatchScore(investor, sme);

      // Check interest status
      const hasInvestorInterest = interests.some(i => i.investorId === investor.id && i.smeId === smeId);
      const hasSMEInterest = interests.some(i => i.smeId === smeId && i.investorId === investor.id && i.type === 'SME_TO_INVESTOR');
      const mutualInterest = hasInvestorInterest && hasSMEInterest;

      return {
        investor: {
          id: investor.id,
          name: investor.name,
          type: investor.type,
          preferences: investor.preferences
        },
        matchScore: score,
        matchFactors: factors,
        interestStatus: {
          investorExpressedInterest: hasInvestorInterest,
          smeExpressedInterest: hasSMEInterest,
          mutualInterest
        }
      };
    });

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      sme: { id: sme.id, name: sme.name, sector: sme.sector },
      matches,
      totalMatches: matches.length,
      highMatches: matches.filter(m => m.matchScore >= 70).length,
      mutualInterests: matches.filter(m => m.interestStatus.mutualInterest).length
    });
  } catch (error) {
    console.error('Error getting SME matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all matches (matchmaking dashboard)
app.get('/api/matches', authenticateToken, async (req, res) => {
  try {
    const allMatches: any[] = [];

    // Calculate all possible matches
    for (const investor of investors) {
      for (const sme of smes) {
        const { score, factors } = calculateMatchScore(investor, sme);

        const hasInvestorInterest = interests.some(i => i.investorId === investor.id && i.smeId === sme.id);
        const hasSMEInterest = interests.some(i => i.smeId === sme.id && i.investorId === investor.id && i.type === 'SME_TO_INVESTOR');

        allMatches.push({
          investor: { id: investor.id, name: investor.name, type: investor.type },
          sme: { id: sme.id, name: sme.name, sector: sme.sector, stage: sme.stage },
          matchScore: score,
          factors,
          interestStatus: {
            investorExpressedInterest: hasInvestorInterest,
            smeExpressedInterest: hasSMEInterest,
            mutualInterest: hasInvestorInterest && hasSMEInterest
          }
        });
      }
    }

    // Sort by match score
    allMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      matches: allMatches,
      stats: {
        totalPossibleMatches: allMatches.length,
        highScoreMatches: allMatches.filter(m => m.matchScore >= 70).length,
        mediumScoreMatches: allMatches.filter(m => m.matchScore >= 40 && m.matchScore < 70).length,
        lowScoreMatches: allMatches.filter(m => m.matchScore < 40).length,
        mutualInterests: allMatches.filter(m => m.interestStatus.mutualInterest).length,
        pendingInterests: interests.filter(i => i.status === 'PENDING').length
      }
    });
  } catch (error) {
    console.error('Error getting all matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// INTEREST EXPRESSION APIs
// ============================================

// Get all interests
app.get('/api/interests', authenticateToken, async (req, res) => {
  try {
    const enrichedInterests = interests.map(interest => ({
      ...interest,
      investor: investors.find(i => i.id === interest.investorId),
      sme: smes.find(s => s.id === interest.smeId)
    }));

    res.json(enrichedInterests);
  } catch (error) {
    console.error('Error getting interests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get interests for current user
app.get('/api/interests/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Find if user is an investor or SME
    const userInvestor = investors.find(i => i.userId === userId);
    const userSME = smes.find(s => s.userId === userId);

    let myInterests: any[] = [];
    let receivedInterests: any[] = [];

    if (userInvestor) {
      myInterests = interests.filter(i => i.investorId === userInvestor.id);
      receivedInterests = interests.filter(i => i.type === 'SME_TO_INVESTOR' && i.investorId === userInvestor.id);
    }

    if (userSME) {
      myInterests = interests.filter(i => i.smeId === userSME.id && i.type === 'SME_TO_INVESTOR');
      receivedInterests = interests.filter(i => i.smeId === userSME.id && i.type === 'INVESTOR_TO_SME');
    }

    res.json({
      sent: myInterests.map(i => ({
        ...i,
        investor: investors.find(inv => inv.id === i.investorId),
        sme: smes.find(s => s.id === i.smeId)
      })),
      received: receivedInterests.map(i => ({
        ...i,
        investor: investors.find(inv => inv.id === i.investorId),
        sme: smes.find(s => s.id === i.smeId)
      }))
    });
  } catch (error) {
    console.error('Error getting user interests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Express interest (investor -> SME or SME -> investor)
app.post('/api/interests', authenticateToken, async (req, res) => {
  try {
    const { investorId, smeId, type, message } = req.body;

    if (!investorId || !smeId || !type) {
      res.status(400).json({ error: 'investorId, smeId, and type are required' });
      return;
    }

    // Validate investor and SME exist
    const investor = investors.find(i => i.id === investorId);
    const sme = smes.find(s => s.id === smeId);

    if (!investor) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    if (!sme) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    // Check if interest already exists
    const existingInterest = interests.find(
      i => i.investorId === investorId && i.smeId === smeId && i.type === type
    );

    if (existingInterest) {
      res.status(409).json({ error: 'Interest already expressed', interest: existingInterest });
      return;
    }

    // Check for mutual interest
    const oppositeType = type === 'INVESTOR_TO_SME' ? 'SME_TO_INVESTOR' : 'INVESTOR_TO_SME';
    const mutualInterestExists = interests.some(
      i => i.investorId === investorId && i.smeId === smeId && i.type === oppositeType
    );

    const newInterest = {
      id: `interest_${Date.now()}`,
      investorId,
      smeId,
      type,
      status: mutualInterestExists ? 'MUTUAL' : 'PENDING',
      message: message || '',
      createdAt: new Date()
    };

    interests.push(newInterest);

    // If mutual interest, update the other interest status too
    if (mutualInterestExists) {
      const otherInterest = interests.find(
        i => i.investorId === investorId && i.smeId === smeId && i.type === oppositeType
      );
      if (otherInterest) {
        otherInterest.status = 'MUTUAL';
      }
    }

    res.status(201).json({
      message: mutualInterestExists ? 'Mutual interest! Both parties are interested.' : 'Interest expressed successfully',
      interest: newInterest,
      mutualInterest: mutualInterestExists,
      investor: { id: investor.id, name: investor.name },
      sme: { id: sme.id, name: sme.name }
    });
  } catch (error) {
    console.error('Error expressing interest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update interest status (accept, reject, etc.)
app.put('/api/interests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const interestIndex = interests.findIndex(i => i.id === id);
    if (interestIndex === -1) {
      res.status(404).json({ error: 'Interest not found' });
      return;
    }

    interests[interestIndex] = {
      ...interests[interestIndex],
      status: status || interests[interestIndex].status,
      message: message || interests[interestIndex].message,
      updatedAt: new Date()
    };

    res.json({
      message: 'Interest updated successfully',
      interest: interests[interestIndex]
    });
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete interest
app.delete('/api/interests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const interestIndex = interests.findIndex(i => i.id === id);
    if (interestIndex === -1) {
      res.status(404).json({ error: 'Interest not found' });
      return;
    }

    interests.splice(interestIndex, 1);

    res.json({ message: 'Interest removed successfully' });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// INVESTOR PREFERENCES APIs
// ============================================

// Update investor preferences
app.put('/api/investors/:id/preferences', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences } = req.body;

    const investorIndex = investors.findIndex(i => i.id === id);
    if (investorIndex === -1) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    // Only allow investor to update their own preferences, or ADMIN/ADVISOR
    const investor = investors[investorIndex];
    const isOwner = investor.userId === req.user!.userId;
    const isAdminOrAdvisor = req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR';

    if (!isOwner && !isAdminOrAdvisor) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    investors[investorIndex] = {
      ...investors[investorIndex],
      preferences: {
        ...investors[investorIndex].preferences,
        ...preferences
      },
      updatedAt: new Date()
    };

    res.json({
      message: 'Preferences updated successfully',
      investor: investors[investorIndex]
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investor preferences
app.get('/api/investors/:id/preferences', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const investor = investors.find(i => i.id === id);
    if (!investor) {
      res.status(404).json({ error: 'Investor not found' });
      return;
    }

    res.json({
      investorId: investor.id,
      name: investor.name,
      preferences: investor.preferences || {}
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reports API endpoints
app.get('/api/reports/stats', authenticateToken, async (req, res) => {
  try {
    // Calculate real statistics from data
    const totalDeals = deals.length;
    const activeSMEs = smes.length;
    const totalInvestors = investors.length;

    // Calculate total investment amount
    const totalInvestment = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

    // Calculate deals by status
    const activeDeals = deals.filter(d => d.status === 'ACTIVE' || d.status === 'Active').length;
    const closedDeals = deals.filter(d => d.status === 'CLOSED' || d.status === 'Closed').length;
    const pendingDeals = deals.filter(d => d.status === 'DRAFT' || d.status === 'PENDING').length;

    // Calculate success rate (closed deals / total deals * 100)
    const successRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;

    res.json({
      stats: [
        {
          title: 'Total Deals',
          value: totalDeals.toString(),
          change: '+12%',
          trend: 'up'
        },
        {
          title: 'Active SMEs',
          value: activeSMEs.toString(),
          change: '+8%',
          trend: 'up'
        },
        {
          title: 'Total Investment',
          value: `$${(totalInvestment / 1000000).toFixed(1)}M`,
          change: '+23%',
          trend: 'up'
        },
        {
          title: 'Success Rate',
          value: `${successRate}%`,
          change: successRate >= 50 ? '+5%' : '-2%',
          trend: successRate >= 50 ? 'up' : 'down'
        }
      ],
      summary: {
        totalDeals,
        activeDeals,
        closedDeals,
        pendingDeals,
        activeSMEs,
        totalInvestors,
        totalInvestment
      }
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    // Generate report list based on available data
    const now = new Date();
    const reports = [
      {
        id: 1,
        title: 'Monthly Investment Report',
        type: 'Investment',
        date: now.toISOString().split('T')[0],
        status: 'Generated',
        size: '2.3 MB',
        description: `Investment summary: ${deals.length} deals, $${(deals.reduce((sum, d) => sum + (d.amount || 0), 0) / 1000000).toFixed(1)}M total`
      },
      {
        id: 2,
        title: 'SME Performance Analysis',
        type: 'Analytics',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Generated',
        size: '1.8 MB',
        description: `Active SMEs: ${smes.length}, Sectors covered: ${[...new Set(smes.map(s => s.sector))].length}`
      },
      {
        id: 3,
        title: 'Deal Pipeline Report',
        type: 'Pipeline',
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Generated',
        size: '1.2 MB',
        description: `Pipeline status: ${deals.filter(d => d.status === 'ACTIVE').length} active, ${deals.filter(d => d.status === 'DRAFT').length} pending`
      },
      {
        id: 4,
        title: 'Investor Portfolio Summary',
        type: 'Portfolio',
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Generated',
        size: '0.9 MB',
        description: `Total investors: ${investors.length}, Active investments tracked`
      }
    ];

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reports/generate', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const { reportType } = req.body;

    // Generate a new report based on type
    const now = new Date();
    const report = {
      id: Date.now(),
      title: `${reportType || 'Custom'} Report - ${now.toLocaleDateString()}`,
      type: reportType || 'Custom',
      date: now.toISOString().split('T')[0],
      status: 'Generated',
      size: '1.5 MB',
      description: `Generated report with ${deals.length} deals, ${smes.length} SMEs, ${investors.length} investors`,
      generatedBy: req.user!.userId,
      generatedAt: now.toISOString()
    };

    res.status(201).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// MESSAGING SYSTEM APIs
// ============================================

// Get all conversations for user
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Filter conversations where user is a participant
    const userConversations = conversations.filter(conv =>
      conv.participants.includes(userId) ||
      conv.participantDetails.some((p: any) => p.id === userId)
    );

    res.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
app.get('/api/messages/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = conversations.find(c => c.id === id);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const conversationMessages = messages.filter(m => m.conversationId === id);

    res.json({
      conversation,
      messages: conversationMessages.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user!.userId;

    if (!conversationId || !content) {
      res.status(400).json({ error: 'conversationId and content are required' });
      return;
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Get sender info
    const sender = users.find(u => u.id === userId) ||
      investors.find(i => i.userId === userId) ||
      smes.find(s => s.userId === userId);

    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: userId,
      senderName: sender?.name || sender?.firstName || 'User',
      senderType: req.user!.role,
      content,
      read: false,
      createdAt: new Date()
    };

    messages.push(newMessage);

    // Update conversation
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new conversation
app.post('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    const { participantIds, dealId } = req.body;

    if (!participantIds || participantIds.length < 2) {
      res.status(400).json({ error: 'At least 2 participants required' });
      return;
    }

    // Build participant details
    const participantDetails = participantIds.map((id: string) => {
      const investor = investors.find(i => i.id === id || i.userId === id);
      const sme = smes.find(s => s.id === id || s.userId === id);
      if (investor) return { id: investor.id, type: 'INVESTOR', name: investor.name };
      if (sme) return { id: sme.id, type: 'SME', name: sme.name };
      return { id, type: 'USER', name: 'User' };
    });

    const newConversation = {
      id: `conv_${Date.now()}`,
      participants: participantIds,
      participantDetails,
      dealId: dealId || null,
      lastMessage: null,
      lastMessageAt: new Date(),
      unreadCount: {},
      createdAt: new Date()
    };

    conversations.push(newConversation);

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// VIRTUAL DATA ROOM APIs
// ============================================

// Get data room for a deal
app.get('/api/dataroom/:dealId', authenticateToken, async (req, res) => {
  try {
    const { dealId } = req.params;

    let dataRoom = dataRooms.find(dr => dr.dealId === dealId);

    if (!dataRoom) {
      // Create a new data room for this deal
      dataRoom = {
        id: `dr_${Date.now()}`,
        dealId,
        name: `Deal ${dealId} Data Room`,
        status: 'ACTIVE',
        createdBy: req.user!.userId,
        accessList: [req.user!.userId],
        documents: [],
        activityLog: [],
        createdAt: new Date()
      };
      dataRooms.push(dataRoom);
    }

    res.json(dataRoom);
  } catch (error) {
    console.error('Error fetching data room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all data rooms
app.get('/api/dataroom', authenticateToken, async (req, res) => {
  try {
    res.json(dataRooms);
  } catch (error) {
    console.error('Error fetching data rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload document to data room
app.post('/api/dataroom/:dealId/documents', authenticateToken, async (req, res) => {
  try {
    const { dealId } = req.params;
    const { name, category, size } = req.body;

    const dataRoom = dataRooms.find(dr => dr.dealId === dealId);
    if (!dataRoom) {
      res.status(404).json({ error: 'Data room not found' });
      return;
    }

    const newDocument = {
      id: `drd_${Date.now()}`,
      name,
      category: category || 'General',
      size: size || '0 KB',
      uploadedBy: req.user!.userId,
      uploadedAt: new Date(),
      accessCount: 0,
      lastAccessedBy: null,
      lastAccessedAt: null
    };

    dataRoom.documents.push(newDocument);
    dataRoom.activityLog.push({
      action: 'UPLOADED',
      documentId: newDocument.id,
      userId: req.user!.userId,
      timestamp: new Date()
    });

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log document access
app.post('/api/dataroom/:dealId/documents/:docId/access', authenticateToken, async (req, res) => {
  try {
    const { dealId, docId } = req.params;
    const { action } = req.body; // VIEWED or DOWNLOADED

    const dataRoom = dataRooms.find(dr => dr.dealId === dealId);
    if (!dataRoom) {
      res.status(404).json({ error: 'Data room not found' });
      return;
    }

    const document = dataRoom.documents.find((d: any) => d.id === docId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    document.accessCount++;
    document.lastAccessedBy = req.user!.userId;
    document.lastAccessedAt = new Date();

    dataRoom.activityLog.push({
      action: action || 'VIEWED',
      documentId: docId,
      userId: req.user!.userId,
      timestamp: new Date()
    });

    res.json({ message: 'Access logged', document });
  } catch (error) {
    console.error('Error logging access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// DEAL PIPELINE APIs
// ============================================

// Get pipeline stages
app.get('/api/pipeline/stages', authenticateToken, async (req, res) => {
  try {
    res.json(pipelineStages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deals in pipeline format (kanban view)
app.get('/api/pipeline/deals', authenticateToken, async (req, res) => {
  try {
    // Group deals by stage
    const pipeline: { [key: string]: any[] } = {};
    pipelineStages.forEach(stage => {
      pipeline[stage.name] = pipelineDeals.filter(d => d.stage === stage.name);
    });

    res.json({
      stages: pipelineStages,
      pipeline,
      summary: {
        totalDeals: pipelineDeals.length,
        totalValue: pipelineDeals.reduce((sum, d) => sum + d.amount, 0),
        highPriority: pipelineDeals.filter(d => d.priority === 'HIGH').length,
        avgProgress: Math.round(pipelineDeals.reduce((sum, d) => sum + d.progress, 0) / pipelineDeals.length)
      }
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move deal to different stage
app.put('/api/pipeline/deals/:dealId/stage', authenticateToken, async (req, res) => {
  try {
    const { dealId } = req.params;
    const { newStage } = req.body;

    const deal = pipelineDeals.find(d => d.id === dealId);
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    const stage = pipelineStages.find(s => s.name === newStage);
    if (!stage) {
      res.status(400).json({ error: 'Invalid stage' });
      return;
    }

    deal.stage = newStage;
    deal.stageOrder = stage.order;
    deal.daysInStage = 0;
    deal.lastActivity = new Date();

    res.json({
      message: 'Deal moved successfully',
      deal
    });
  } catch (error) {
    console.error('Error moving deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// SME READINESS SCORE APIs
// ============================================

// Calculate SME investment readiness score
function calculateReadinessScore(sme: any): { score: number; breakdown: any; recommendations: string[] } {
  let score = 0;
  const breakdown: any = {};
  const recommendations: string[] = [];

  // 1. Financial Health (30 points max)
  const revenue = parseFloat(String(sme.annualRevenue || '0').replace(/[^0-9.]/g, '')) || 0;
  const hasFinancials = sme.currentAssets || sme.totalRevenue || sme.netProfit;
  if (revenue > 500000) {
    score += 30;
    breakdown.financials = { score: 30, status: 'Excellent' };
  } else if (revenue > 100000) {
    score += 20;
    breakdown.financials = { score: 20, status: 'Good' };
    recommendations.push('Increase revenue above $500K for better investor attraction');
  } else if (hasFinancials) {
    score += 10;
    breakdown.financials = { score: 10, status: 'Developing' };
    recommendations.push('Focus on revenue growth and financial sustainability');
  } else {
    breakdown.financials = { score: 0, status: 'Missing' };
    recommendations.push('Add financial information (revenue, assets, profit margins)');
  }

  // 2. Documentation Completeness (25 points max)
  let docScore = 0;
  if (sme.businessDescription) docScore += 5;
  if (sme.valueProposition) docScore += 5;
  if (sme.targetMarket) docScore += 5;
  if (sme.competitiveAdvantage) docScore += 5;
  if (sme.fundingRequired) docScore += 5;

  score += docScore;
  if (docScore >= 20) {
    breakdown.documentation = { score: docScore, status: 'Complete' };
  } else if (docScore >= 10) {
    breakdown.documentation = { score: docScore, status: 'Partial' };
    recommendations.push('Complete business documentation (value proposition, target market)');
  } else {
    breakdown.documentation = { score: docScore, status: 'Incomplete' };
    recommendations.push('Add comprehensive business description and market analysis');
  }

  // 3. Governance & Structure (20 points max)
  let govScore = 0;
  if (sme.registrationNumber) govScore += 5;
  if (sme.taxId) govScore += 5;
  if (sme.employeeCount && parseInt(sme.employeeCount) > 5) govScore += 5;
  if (sme.certified || sme.status === 'CERTIFIED') govScore += 5;

  score += govScore;
  if (govScore >= 15) {
    breakdown.governance = { score: govScore, status: 'Strong' };
  } else if (govScore >= 10) {
    breakdown.governance = { score: govScore, status: 'Adequate' };
    recommendations.push('Consider getting business certification');
  } else {
    breakdown.governance = { score: govScore, status: 'Weak' };
    recommendations.push('Ensure proper business registration and governance structure');
  }

  // 4. Market Potential (15 points max)
  let marketScore = 0;
  const sector = (sme.sector || '').toLowerCase();
  const highGrowthSectors = ['technology', 'fintech', 'healthcare', 'green energy', 'e-commerce'];
  if (highGrowthSectors.some(s => sector.includes(s))) {
    marketScore += 10;
  }
  if (sme.metrics?.monthlyGrowth) {
    const growth = parseFloat(sme.metrics.monthlyGrowth.replace('%', '')) || 0;
    if (growth > 10) marketScore += 5;
  }

  score += marketScore;
  if (marketScore >= 10) {
    breakdown.marketPotential = { score: marketScore, status: 'High' };
  } else {
    breakdown.marketPotential = { score: marketScore, status: 'Medium' };
    recommendations.push('Demonstrate growth metrics and market traction');
  }

  // 5. Team Experience (10 points max)
  let teamScore = 0;
  if (sme.employees?.length > 0 || parseInt(sme.employeeCount) > 10) {
    teamScore += 5;
  }
  if (sme.metrics?.employeeSatisfaction) {
    const satisfaction = parseFloat(sme.metrics.employeeSatisfaction.split('/')[0]) || 0;
    if (satisfaction >= 4) teamScore += 5;
  }

  score += teamScore;
  breakdown.team = { score: teamScore, status: teamScore >= 7 ? 'Strong' : teamScore >= 4 ? 'Adequate' : 'Developing' };

  if (teamScore < 5) {
    recommendations.push('Highlight team expertise and leadership experience');
  }

  return { score: Math.min(score, 100), breakdown, recommendations };
}

// Get SME readiness score
app.get('/api/smes/:id/readiness', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const sme = smes.find(s => s.id === id);
    if (!sme) {
      res.status(404).json({ error: 'SME not found' });
      return;
    }

    const { score, breakdown, recommendations } = calculateReadinessScore(sme);

    let grade = 'F';
    if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';

    res.json({
      smeId: sme.id,
      smeName: sme.name,
      readinessScore: score,
      grade,
      breakdown,
      recommendations,
      investorReady: score >= 70,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error calculating readiness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all SME readiness scores (for comparison)
app.get('/api/smes/readiness/all', authenticateToken, async (req, res) => {
  try {
    const scores = smes.map(sme => {
      const { score, breakdown } = calculateReadinessScore(sme);
      let grade = 'F';
      if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 50) grade = 'D';

      return {
        id: sme.id,
        name: sme.name,
        sector: sme.sector,
        readinessScore: score,
        grade,
        breakdown,
        investorReady: score >= 70
      };
    });

    // Sort by score descending
    scores.sort((a, b) => b.readinessScore - a.readinessScore);

    res.json({
      scores,
      summary: {
        total: scores.length,
        investorReady: scores.filter(s => s.investorReady).length,
        averageScore: Math.round(scores.reduce((sum, s) => sum + s.readinessScore, 0) / scores.length),
        gradeDistribution: {
          A: scores.filter(s => s.grade === 'A').length,
          B: scores.filter(s => s.grade === 'B').length,
          C: scores.filter(s => s.grade === 'C').length,
          D: scores.filter(s => s.grade === 'D').length,
          F: scores.filter(s => s.grade === 'F').length,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all readiness scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// DASHBOARD ANALYTICS APIs
// ============================================

// Get dashboard analytics data
app.get('/api/dashboard/analytics', authenticateToken, async (req, res) => {
  try {
    // Monthly deal statistics (mock data for charts)
    const monthlyDeals = [
      { month: 'Jul', deals: 8, value: 1200000 },
      { month: 'Aug', deals: 12, value: 1800000 },
      { month: 'Sep', deals: 10, value: 1500000 },
      { month: 'Oct', deals: 15, value: 2200000 },
      { month: 'Nov', deals: 18, value: 2800000 },
      { month: 'Dec', deals: 14, value: 2100000 }
    ];

    // Sector distribution
    const sectorDistribution = smes.reduce((acc: any, sme) => {
      const sector = sme.sector || 'Other';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {});

    // Investment stages
    const stageDistribution = pipelineDeals.reduce((acc: any, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    // KPIs
    const kpis = {
      totalDeals: deals.length + pipelineDeals.length,
      activeDeals: pipelineDeals.filter(d => d.stage !== 'Completed').length,
      totalInvestment: pipelineDeals.reduce((sum, d) => sum + d.amount, 0),
      avgDealSize: Math.round(pipelineDeals.reduce((sum, d) => sum + d.amount, 0) / pipelineDeals.length),
      successRate: 85, // percentage
      activeSMEs: smes.length,
      activeInvestors: investors.length,
      pendingMatches: interests.filter(i => i.status === 'PENDING').length
    };

    // Recent activity
    const recentActivity = [
      { type: 'DEAL_CREATED', description: 'New deal created: EduTech Platform - Series A', timestamp: new Date(Date.now() - 3600000) },
      { type: 'INTEREST_EXPRESSED', description: 'Investor expressed interest in Tech Startup A', timestamp: new Date(Date.now() - 7200000) },
      { type: 'STAGE_CHANGED', description: 'HealthTech Inc moved to Legal Review', timestamp: new Date(Date.now() - 14400000) },
      { type: 'DOCUMENT_UPLOADED', description: 'Term Sheet uploaded to data room', timestamp: new Date(Date.now() - 21600000) },
      { type: 'MESSAGE_SENT', description: 'New message in Tech Startup A conversation', timestamp: new Date(Date.now() - 28800000) }
    ];

    res.json({
      monthlyDeals,
      sectorDistribution,
      stageDistribution,
      kpis,
      recentActivity,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deal funnel metrics
app.get('/api/dashboard/funnel', authenticateToken, async (req, res) => {
  try {
    const funnel = pipelineStages.map(stage => ({
      stage: stage.name,
      color: stage.color,
      count: pipelineDeals.filter(d => d.stage === stage.name).length,
      value: pipelineDeals.filter(d => d.stage === stage.name).reduce((sum, d) => sum + d.amount, 0)
    }));

    const conversionRates = funnel.map((stage, index) => {
      if (index === 0) return { stage: stage.stage, rate: 100 };
      const previousCount = funnel[index - 1].count;
      if (previousCount === 0) return { stage: stage.stage, rate: 0 };
      return { stage: stage.stage, rate: Math.round((stage.count / previousCount) * 100) };
    });

    res.json({
      funnel,
      conversionRates,
      totalDeals: pipelineDeals.length,
      totalValue: pipelineDeals.reduce((sum, d) => sum + d.amount, 0)
    });
  } catch (error) {
    console.error('Error fetching funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// NOTIFICATIONS APIs
// ============================================

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Get notifications for the user (or all for admin)
    let userNotifications = notifications;
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'ADVISOR') {
      userNotifications = notifications.filter(n => n.userId === userId);
    }

    // Sort by creation date descending
    userNotifications.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = userNotifications.filter(n => !n.read).length;

    res.json({
      notifications: userNotifications,
      unreadCount,
      total: userNotifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = notifications.find(n => n.id === id);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    notification.read = true;

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId;

    let count = 0;
    notifications.forEach(n => {
      if (!n.read && (req.user!.role === 'ADMIN' || req.user!.role === 'ADVISOR' || n.userId === userId)) {
        n.read = true;
        count++;
      }
    });

    res.json({ message: `${count} notifications marked as read` });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create notification (for system use)
app.post('/api/notifications', authenticateToken, authorizeRoles('ADMIN', 'ADVISOR'), async (req, res) => {
  try {
    const { userId, type, title, message, actionUrl } = req.body;

    const newNotification = {
      id: `notif_${Date.now()}`,
      userId,
      type: type || 'GENERAL',
      title,
      message,
      read: false,
      actionUrl: actionUrl || null,
      createdAt: new Date()
    };

    notifications.push(newNotification);

    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// CALENDAR & SCHEDULING APIs
// ============================================

// Get calendar events
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let filtered = [...calendarEvents];

    // Filter by date range if provided
    if (startDate) {
      filtered = filtered.filter(e => new Date(e.startTime) >= new Date(startDate as string));
    }
    if (endDate) {
      filtered = filtered.filter(e => new Date(e.startTime) <= new Date(endDate as string));
    }

    // Filter by type if provided
    if (type && type !== 'all') {
      filtered = filtered.filter(e => e.type === type);
    }

    // Sort by start time
    filtered.sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    res.json({
      events: filtered,
      total: filtered.length,
      upcoming: filtered.filter(e => new Date(e.startTime) > new Date()).length
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single calendar event
app.get('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const event = calendarEvents.find(e => e.id === id);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create calendar event
app.post('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, startTime, endTime, location, meetingLink, attendees, dealId } = req.body;

    if (!title || !startTime || !endTime) {
      res.status(400).json({ error: 'Title, startTime, and endTime are required' });
      return;
    }

    const eventColors: { [key: string]: string } = {
      PITCH_SESSION: '#6366f1',
      DUE_DILIGENCE: '#a855f7',
      NEGOTIATION: '#ec4899',
      CLOSING: '#22c55e',
      GENERAL: '#3b82f6'
    };

    const newEvent = {
      id: `event_${Date.now()}`,
      title,
      description: description || '',
      type: type || 'GENERAL',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || 'Virtual',
      meetingLink: meetingLink || null,
      attendees: attendees || [],
      dealId: dealId || null,
      createdBy: req.user!.userId,
      status: 'PENDING',
      color: eventColors[type] || '#3b82f6',
      createdAt: new Date()
    };

    calendarEvents.push(newEvent);

    // Create notification for attendees
    (attendees || []).forEach((attendee: any) => {
      if (attendee.id !== req.user!.userId) {
        notifications.push({
          id: `notif_${Date.now()}_${attendee.id}`,
          userId: attendee.id,
          type: 'MEETING_INVITE',
          title: 'New Meeting Invitation',
          message: `You have been invited to: ${title}`,
          read: false,
          actionUrl: '/calendar',
          createdAt: new Date()
        });
      }
    });

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update calendar event
app.put('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const eventIndex = calendarEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    calendarEvents[eventIndex] = {
      ...calendarEvents[eventIndex],
      ...updates,
      updatedAt: new Date()
    };

    res.json(calendarEvents[eventIndex]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete calendar event
app.delete('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const eventIndex = calendarEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    calendarEvents.splice(eventIndex, 1);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Schedule a pitch session (quick helper)
app.post('/api/calendar/schedule-pitch', authenticateToken, async (req, res) => {
  try {
    const { dealId, smeId, investorId, startTime, duration, meetingLink, location } = req.body;

    if (!dealId || !smeId || !investorId || !startTime) {
      res.status(400).json({ error: 'dealId, smeId, investorId, and startTime are required' });
      return;
    }

    // Get SME and investor names
    const sme = smes.find(s => s.id === smeId);
    const investor = investors.find(i => i.id === investorId);

    if (!sme || !investor) {
      res.status(404).json({ error: 'SME or Investor not found' });
      return;
    }

    const durationMs = (duration || 60) * 60000; // default 60 minutes

    const newEvent = {
      id: `event_${Date.now()}`,
      title: `Pitch Session: ${sme.name}`,
      description: `Pitch presentation with ${investor.name}`,
      type: 'PITCH_SESSION',
      startTime: new Date(startTime),
      endTime: new Date(new Date(startTime).getTime() + durationMs),
      location: location || 'Virtual',
      meetingLink: meetingLink || null,
      attendees: [
        { id: req.user!.userId, name: 'Advisor', role: 'ADVISOR', status: 'ACCEPTED' },
        { id: investorId, name: investor.name, role: 'INVESTOR', status: 'PENDING' },
        { id: smeId, name: sme.name, role: 'SME', status: 'PENDING' }
      ],
      dealId,
      createdBy: req.user!.userId,
      status: 'PENDING',
      color: '#6366f1',
      createdAt: new Date()
    };

    calendarEvents.push(newEvent);

    // Create notifications
    notifications.push({
      id: `notif_${Date.now()}_inv`,
      userId: investorId,
      type: 'PITCH_SCHEDULED',
      title: 'Pitch Session Scheduled',
      message: `A pitch session has been scheduled with ${sme.name}`,
      read: false,
      actionUrl: '/calendar',
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'Pitch session scheduled successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error scheduling pitch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server with migration handling
async function startServer() {
  try {
    console.log('🚀 Starting Boutique Advisory Platform...');

    // Check migration status on startup
    console.log('📋 Checking migration status...');
    const migrationStatus = await checkMigrationStatus();

    if (migrationStatus.completed) {
      console.log('✅ Database migration already completed');
      console.log('🗄️  Using PostgreSQL database');
    } else if (migrationStatus.error) {
      console.log('⚠️  Database connection failed, using in-memory storage');
      console.log(`   Error: ${migrationStatus.error}`);
    } else {
      console.log('📋 Database is empty, migration needed');
      console.log('💾 Using in-memory storage as backup');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Boutique Advisory Platform API running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🔄 Migration status: http://localhost:${PORT}/api/migration/status`);
      console.log(`📋 Migration endpoints:`);
      console.log(`   - GET  /api/migration/status - Check migration status`);
      console.log(`   - POST /api/migration/perform - Perform migration`);
      console.log(`   - POST /api/migration/switch-to-database - Switch to database mode`);
      console.log(`   - POST /api/migration/fallback-to-memory - Fallback to in-memory mode`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
