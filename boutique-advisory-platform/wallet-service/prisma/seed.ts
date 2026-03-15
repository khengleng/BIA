import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedPlatform = 'core' | 'trade';

const CORE_TENANT_ID = process.env.CORE_TENANT_ID || 'default';
const TRADING_TENANT_ID = process.env.TRADING_TENANT_ID || 'trade';
const DEFAULT_CORE_ADMIN_EMAIL = process.env.DEFAULT_SUPERADMIN_EMAIL || 'contact@cambobia.com';
const DEFAULT_TRADING_ADMIN_EMAIL = process.env.DEFAULT_TRADING_SUPERADMIN_EMAIL || 'trading-admin@cambobia.com';

function resolveSeedPlatform(): SeedPlatform {
  const arg = process.argv[2]?.toLowerCase();
  const envPlatform = (process.env.SEED_PLATFORM || process.env.SERVICE_MODE || 'core').toLowerCase();
  const raw = arg || envPlatform;

  if (raw === 'trade' || raw === 'trading') return 'trade';
  return 'core';
}

async function upsertTenant(platform: SeedPlatform) {
  const tenantId = platform === 'trade' ? TRADING_TENANT_ID : CORE_TENANT_ID;
  const tenantName = platform === 'trade' ? 'CamboBia Trading' : 'Boutique Advisory';
  const domain = platform === 'trade' ? 'trade.cambobia.com' : 'cambobia.com';

  return prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      name: tenantName,
      domain,
    },
    create: {
      id: tenantId,
      name: tenantName,
      domain,
      settings: {},
    },
  });
}

async function seedCore() {
  const tenant = await upsertTenant('core');
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(initialAdminPassword, 10);
  const advisorHash = await bcrypt.hash('advisor123', 10);
  const investorHash = await bcrypt.hash('investor123', 10);
  const investor2Hash = await bcrypt.hash('investor2', 10);
  const smeHash = await bcrypt.hash('sme123', 10);
  const sme2Hash = await bcrypt.hash('sme2', 10);

  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: DEFAULT_CORE_ADMIN_EMAIL } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'SUPER_ADMIN' },
    create: {
      email: DEFAULT_CORE_ADMIN_EMAIL,
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const advisorUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'advisor@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'ADVISOR' },
    create: {
      email: 'advisor@cambobia.com',
      password: advisorHash,
      firstName: 'Expert',
      lastName: 'Advisor',
      role: 'ADVISOR',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const investorUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'investor@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'INVESTOR' },
    create: {
      email: 'investor@cambobia.com',
      password: investorHash,
      firstName: 'John',
      lastName: 'Smith',
      role: 'INVESTOR',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const smeUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'sme@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'SME' },
    create: {
      email: 'sme@cambobia.com',
      password: smeHash,
      firstName: 'TechCorp',
      lastName: 'Cambodia',
      role: 'SME',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const investor2User = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'investor2@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'INVESTOR' },
    create: {
      email: 'investor2@cambobia.com',
      password: investor2Hash,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'INVESTOR',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const sme2User = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'sme2@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'SME' },
    create: {
      email: 'sme2@cambobia.com',
      password: sme2Hash,
      firstName: 'AgriSmart',
      lastName: 'Cambodia',
      role: 'SME',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const sme = await prisma.sME.upsert({
    where: { userId: smeUser.id },
    update: {
      tenantId: tenant.id,
      name: 'TechCorp Cambodia',
      sector: 'Technology',
      stage: 'GROWTH',
      fundingRequired: 500000,
      description: 'Leading fintech company providing digital payment solutions across Cambodia',
      website: 'https://techcorp.kh',
      location: 'Phnom Penh, Cambodia',
      status: 'CERTIFIED',
    },
    create: {
      id: 'sme_techcorp',
      userId: smeUser.id,
      tenantId: tenant.id,
      name: 'TechCorp Cambodia',
      sector: 'Technology',
      stage: 'GROWTH',
      fundingRequired: 500000,
      description: 'Leading fintech company providing digital payment solutions across Cambodia',
      website: 'https://techcorp.kh',
      location: 'Phnom Penh, Cambodia',
      status: 'CERTIFIED',
    },
  });

  const sme2 = await prisma.sME.upsert({
    where: { userId: sme2User.id },
    update: {
      tenantId: tenant.id,
      name: 'AgriSmart Cambodia',
      sector: 'Agriculture',
      stage: 'SEED',
      fundingRequired: 250000,
      description: 'IoT-powered smart farming solutions for sustainable agriculture',
      website: 'https://agrismart.kh',
      location: 'Siem Reap, Cambodia',
      status: 'SUBMITTED',
    },
    create: {
      id: 'sme_agrismart',
      userId: sme2User.id,
      tenantId: tenant.id,
      name: 'AgriSmart Cambodia',
      sector: 'Agriculture',
      stage: 'SEED',
      fundingRequired: 250000,
      description: 'IoT-powered smart farming solutions for sustainable agriculture',
      website: 'https://agrismart.kh',
      location: 'Siem Reap, Cambodia',
      status: 'SUBMITTED',
    },
  });

  const investor = await prisma.investor.upsert({
    where: { userId: investorUser.id },
    update: {
      tenantId: tenant.id,
      name: 'John Smith',
      type: 'ANGEL',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Technology', 'Fintech'] },
      portfolio: [],
    },
    create: {
      id: 'inv_john_smith',
      userId: investorUser.id,
      tenantId: tenant.id,
      name: 'John Smith',
      type: 'ANGEL',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Technology', 'Fintech'] },
      portfolio: [],
    },
  });

  const investor2 = await prisma.investor.upsert({
    where: { userId: investor2User.id },
    update: {
      tenantId: tenant.id,
      name: 'Sarah Chen',
      type: 'VENTURE_CAPITAL',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Agriculture', 'Technology', 'Sustainability'] },
      portfolio: [],
    },
    create: {
      id: 'inv_sarah_chen',
      userId: investor2User.id,
      tenantId: tenant.id,
      name: 'Sarah Chen',
      type: 'VENTURE_CAPITAL',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Agriculture', 'Technology', 'Sustainability'] },
      portfolio: [],
    },
  });

  const advisor = await prisma.advisor.upsert({
    where: { userId: advisorUser.id },
    update: {
      tenantId: tenant.id,
      name: 'Expert Advisor',
      specialization: ['Due Diligence', 'Investment Strategy'],
      certificationList: ['CFA', 'MBA'],
    },
    create: {
      id: 'adv_expert',
      userId: advisorUser.id,
      tenantId: tenant.id,
      name: 'Expert Advisor',
      specialization: ['Due Diligence', 'Investment Strategy'],
      certificationList: ['CFA', 'MBA'],
    },
  });

  await prisma.syndicate.upsert({
    where: { id: 'synd_cambodia_tech' },
    update: {},
    create: {
      id: 'synd_cambodia_tech',
      tenantId: tenant.id,
      name: 'Cambodia Tech Fund I',
      description: 'Focused on early-stage tech startups in Cambodia and Southeast Asia',
      leadInvestorId: investor.id,
      targetAmount: 500000,
      minInvestment: 5000,
      maxInvestment: 50000,
      managementFee: 2.0,
      carryFee: 20.0,
      status: 'OPEN',
      closingDate: new Date('2027-03-01'),
    },
  });

  await prisma.syndicate.upsert({
    where: { id: 'synd_agritech' },
    update: {},
    create: {
      id: 'synd_agritech',
      tenantId: tenant.id,
      name: 'ASEAN AgriTech Syndicate',
      description: 'Investing in sustainable agriculture technology across ASEAN',
      leadInvestorId: investor2.id,
      targetAmount: 750000,
      minInvestment: 10000,
      maxInvestment: 100000,
      managementFee: 2.5,
      carryFee: 20.0,
      status: 'FORMING',
      closingDate: new Date('2027-04-15'),
    },
  });

  const tokenizedSyndicate = await prisma.syndicate.upsert({
    where: { id: 'synd_real_estate_token' },
    update: {},
    create: {
      id: 'synd_real_estate_token',
      tenantId: tenant.id,
      name: 'Prime PP Real Estate Fund',
      description: 'Tokenized real estate fund for prime commercial properties in Phnom Penh.',
      leadInvestorId: investor.id,
      targetAmount: 2000000,
      minInvestment: 500,
      maxInvestment: 100000,
      managementFee: 1.5,
      carryFee: 15.0,
      status: 'OPEN',
      isTokenized: true,
      tokenName: 'Prime Property Token',
      tokenSymbol: 'PPT',
      pricePerToken: 100,
      totalTokens: 20000,
      tokensSold: 1500,
      closingDate: new Date('2027-06-30'),
    },
  });

  await prisma.syndicateMember.upsert({
    where: {
      syndicateId_investorId: {
        syndicateId: tokenizedSyndicate.id,
        investorId: investor2.id,
      },
    },
    update: {},
    create: {
      syndicateId: tokenizedSyndicate.id,
      investorId: investor2.id,
      amount: 5000,
      tokens: 50,
      status: 'APPROVED',
    },
  });

  await prisma.dueDiligence.upsert({
    where: { id: 'dd_techcorp' },
    update: {},
    create: {
      id: 'dd_techcorp',
      smeId: sme.id,
      advisorId: advisor.id,
      status: 'COMPLETED',
      financialScore: 85,
      teamScore: 90,
      marketScore: 80,
      productScore: 88,
      legalScore: 75,
      operationalScore: 82,
      overallScore: 84,
      riskLevel: 'LOW',
      strengths: ['Strong tech team', 'Growing market', 'Solid financials'],
      weaknesses: ['Limited regional presence', 'New to market'],
      recommendations: ['Expand to nearby markets', 'Build strategic partnerships'],
      redFlags: [],
      completedAt: new Date(),
      expiresAt: new Date('2027-12-31'),
    },
  });

  await prisma.dueDiligence.upsert({
    where: { id: 'dd_agrismart' },
    update: {},
    create: {
      id: 'dd_agrismart',
      smeId: sme2.id,
      advisorId: advisor.id,
      status: 'IN_PROGRESS',
      financialScore: 70,
      teamScore: 75,
      marketScore: 85,
      productScore: 80,
      legalScore: 65,
      operationalScore: 70,
      overallScore: 74,
      riskLevel: 'MEDIUM',
      strengths: ['Innovative product', 'Large market opportunity'],
      weaknesses: ['Early stage', 'Limited track record'],
      recommendations: ['Complete legal compliance', 'Strengthen financials'],
      redFlags: [],
    },
  });

  const post1 = await prisma.communityPost.upsert({
    where: { id: 'post_welcome' },
    update: {},
    create: {
      id: 'post_welcome',
      tenantId: tenant.id,
      authorId: adminUser.id,
      title: 'Welcome to the Cambobia Community',
      content: 'Connect with fellow investors, discover promising SMEs, and share your investment insights.',
      category: 'ANNOUNCEMENT',
      isPinned: true,
      status: 'PUBLISHED',
      likes: 15,
      views: 120,
    },
  });

  await prisma.communityPost.upsert({
    where: { id: 'post_investment_tips' },
    update: {},
    create: {
      id: 'post_investment_tips',
      tenantId: tenant.id,
      authorId: investorUser.id,
      title: 'Top 5 Due Diligence Tips for First-Time Angel Investors',
      content: 'Meet the founders, verify references, validate market size, review financials, and understand competition.',
      category: 'INVESTOR_INSIGHT',
      status: 'PUBLISHED',
      likes: 28,
      views: 245,
    },
  });

  await prisma.communityPost.upsert({
    where: { id: 'post_techcorp_update' },
    update: {},
    create: {
      id: 'post_techcorp_update',
      tenantId: tenant.id,
      authorId: smeUser.id,
      smeId: sme.id,
      title: 'TechCorp Cambodia Reaches 100K Active Users',
      content: 'TechCorp Cambodia has reached 100,000 active users on its digital payment platform.',
      category: 'SME_NEWS',
      status: 'PUBLISHED',
      likes: 42,
      views: 380,
    },
  });

  await prisma.comment.upsert({
    where: { id: 'comment_1' },
    update: {},
    create: {
      id: 'comment_1',
      postId: post1.id,
      authorId: investor2User.id,
      content: 'Excited to see the community launch continue to grow.',
      likes: 5,
    },
  });

  const deal = await prisma.deal.upsert({
    where: { id: 'deal_techcorp_series_a' },
    update: {},
    create: {
      id: 'deal_techcorp_series_a',
      tenantId: tenant.id,
      smeId: sme.id,
      title: 'TechCorp Series A',
      description: 'Series A funding to expand operations to 5 new provinces.',
      amount: 1000000,
      equity: 10,
      status: 'FUNDED',
      successFee: 5,
      terms: 'Standard Series A terms with 1x liquidation preference.',
    },
  });

  await prisma.dealInvestor.upsert({
    where: {
      dealId_investorId: {
        dealId: deal.id,
        investorId: investor.id,
      },
    },
    update: {},
    create: {
      dealId: deal.id,
      investorId: investor.id,
      amount: 50000,
      status: 'COMPLETED',
    },
  });

  console.log('Core seed completed.');
  console.log(`Admin: ${DEFAULT_CORE_ADMIN_EMAIL} / ${initialAdminPassword}`);
  console.log('Advisor: advisor@cambobia.com / advisor123');
  console.log('Investor: investor@cambobia.com / investor123');
  console.log('SME: sme@cambobia.com / sme123');
}

async function seedTrade() {
  const tenant = await upsertTenant('trade');
  const tradingAdminPassword = process.env.INITIAL_TRADING_ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD || 'TradeAdmin123!';
  const tradingAdminHash = await bcrypt.hash(tradingAdminPassword, 10);
  const tradeInvestorHash = await bcrypt.hash('TradeInvestor123!', 10);
  const tradeSellerHash = await bcrypt.hash('TradeSeller123!', 10);
  const issuerHash = await bcrypt.hash('TradeIssuer123!', 10);

  const tradingAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: DEFAULT_TRADING_ADMIN_EMAIL } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'SUPER_ADMIN' },
    create: {
      email: DEFAULT_TRADING_ADMIN_EMAIL,
      password: tradingAdminHash,
      firstName: 'Trading',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'tradeinvestor.test@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'INVESTOR' },
    create: {
      email: 'tradeinvestor.test@cambobia.com',
      password: tradeInvestorHash,
      firstName: 'Trade',
      lastName: 'Investor',
      role: 'INVESTOR',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'trader.seller@cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'INVESTOR' },
    create: {
      email: 'trader.seller@cambobia.com',
      password: tradeSellerHash,
      firstName: 'Listing',
      lastName: 'Seller',
      role: 'INVESTOR',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const issuerUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'issuer@trade.cambobia.com' } },
    update: { status: 'ACTIVE', isEmailVerified: true, role: 'SME' },
    create: {
      email: 'issuer@trade.cambobia.com',
      password: issuerHash,
      firstName: 'Mekong',
      lastName: 'Issuer',
      role: 'SME',
      tenantId: tenant.id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  const buyerInvestor = await prisma.investor.upsert({
    where: { userId: buyerUser.id },
    update: {
      tenantId: tenant.id,
      name: 'Trade Investor',
      type: 'ANGEL',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Infrastructure', 'Logistics'] },
      portfolio: [],
    },
    create: {
      id: 'trade_inv_buyer',
      userId: buyerUser.id,
      tenantId: tenant.id,
      name: 'Trade Investor',
      type: 'ANGEL',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Infrastructure', 'Logistics'] },
      portfolio: [],
    },
  });

  const sellerInvestor = await prisma.investor.upsert({
    where: { userId: sellerUser.id },
    update: {
      tenantId: tenant.id,
      name: 'Listing Seller',
      type: 'PRIVATE_EQUITY',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Infrastructure'] },
      portfolio: [],
    },
    create: {
      id: 'trade_inv_seller',
      userId: sellerUser.id,
      tenantId: tenant.id,
      name: 'Listing Seller',
      type: 'PRIVATE_EQUITY',
      kycStatus: 'VERIFIED',
      preferences: { sectors: ['Infrastructure'] },
      portfolio: [],
    },
  });

  const issuer = await prisma.sME.upsert({
    where: { userId: issuerUser.id },
    update: {
      tenantId: tenant.id,
      name: 'Mekong Logistics Co.',
      sector: 'Logistics',
      stage: 'GROWTH',
      fundingRequired: 1500000,
      description: 'Regional logistics operator preparing a secondary liquidity program.',
      website: 'https://trade.cambobia.com',
      location: 'Phnom Penh, Cambodia',
      status: 'CERTIFIED',
    },
    create: {
      id: 'trade_sme_mekong_logistics',
      userId: issuerUser.id,
      tenantId: tenant.id,
      name: 'Mekong Logistics Co.',
      sector: 'Logistics',
      stage: 'GROWTH',
      fundingRequired: 1500000,
      description: 'Regional logistics operator preparing a secondary liquidity program.',
      website: 'https://trade.cambobia.com',
      location: 'Phnom Penh, Cambodia',
      status: 'CERTIFIED',
    },
  });

  const tradeDeal = await prisma.deal.upsert({
    where: { id: 'trade_deal_mekong_series_b' },
    update: {},
    create: {
      id: 'trade_deal_mekong_series_b',
      tenantId: tenant.id,
      smeId: issuer.id,
      title: 'Mekong Logistics Series B',
      description: 'Growth round with active secondary market support.',
      amount: 1500000,
      equity: 12,
      status: 'FUNDED',
      successFee: 3.5,
      terms: 'Preferred equity with secondary trading enabled.',
    },
  });

  const seededInvestment = await prisma.dealInvestor.upsert({
    where: {
      dealId_investorId: {
        dealId: tradeDeal.id,
        investorId: sellerInvestor.id,
      },
    },
    update: {},
    create: {
      dealId: tradeDeal.id,
      investorId: sellerInvestor.id,
      amount: 120000,
      status: 'COMPLETED',
    },
  });

  const tradeListing = await prisma.secondaryListing.upsert({
    where: { id: 'trade_listing_mekong_001' },
    update: {},
    create: {
      id: 'trade_listing_mekong_001',
      tenantId: tenant.id,
      sellerId: sellerInvestor.id,
      dealInvestorId: seededInvestment.id,
      sharesAvailable: 2400,
      pricePerShare: 14.75,
      minPurchase: 100,
      status: 'ACTIVE',
      expiresAt: new Date('2027-12-31'),
    },
  });

  await prisma.secondaryTrade.upsert({
    where: { id: 'trade_execution_seed_001' },
    update: {},
    create: {
      id: 'trade_execution_seed_001',
      listingId: tradeListing.id,
      buyerId: buyerInvestor.id,
      sellerId: sellerInvestor.id,
      shares: 200,
      pricePerShare: 14.25,
      totalAmount: 2850,
      fee: 57,
      status: 'COMPLETED',
      executedAt: new Date(),
    },
  });

  console.log('Trade seed completed.');
  console.log(`Trading admin: ${DEFAULT_TRADING_ADMIN_EMAIL} / ${tradingAdminPassword}`);
  console.log('Trade investor: tradeinvestor.test@cambobia.com / TradeInvestor123!');
  console.log('Trade seller: trader.seller@cambobia.com / TradeSeller123!');
  console.log(`Trade tenant: ${tenant.id}`);
  console.log(`Trade admin user id: ${tradingAdmin.id}`);
}

async function main() {
  const platform = resolveSeedPlatform();
  console.log(`Seeding platform: ${platform}`);

  if (platform === 'trade') {
    await seedTrade();
  } else {
    await seedCore();
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
