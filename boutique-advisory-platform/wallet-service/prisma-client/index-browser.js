
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('@prisma/client/runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.7.1
 * Query Engine version: 0ca5ccbcfa6bdc81c003cf549abe4269f59c41e5
 */
Prisma.prismaVersion = {
  client: "5.7.1",
  engine: "0ca5ccbcfa6bdc81c003cf549abe4269f59c41e5"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  domain: 'domain',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  email: 'email',
  password: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  role: 'role',
  status: 'status',
  language: 'language',
  did: 'did',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry',
  twoFactorSecret: 'twoFactorSecret',
  twoFactorEnabled: 'twoFactorEnabled',
  twoFactorBackupCodes: 'twoFactorBackupCodes',
  isEmailVerified: 'isEmailVerified',
  verificationToken: 'verificationToken',
  verificationTokenExpiry: 'verificationTokenExpiry',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  expiresAt: 'expiresAt',
  revoked: 'revoked',
  replacedByToken: 'replacedByToken',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SMEScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  name: 'name',
  sector: 'sector',
  stage: 'stage',
  fundingRequired: 'fundingRequired',
  description: 'description',
  website: 'website',
  location: 'location',
  score: 'score',
  certified: 'certified',
  certificationDate: 'certificationDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvestorScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  name: 'name',
  type: 'type',
  kycStatus: 'kycStatus',
  status: 'status',
  preferences: 'preferences',
  portfolio: 'portfolio',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdvisorScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  name: 'name',
  specialization: 'specialization',
  certificationList: 'certificationList',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DealScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  smeId: 'smeId',
  title: 'title',
  description: 'description',
  amount: 'amount',
  equity: 'equity',
  status: 'status',
  successFee: 'successFee',
  terms: 'terms',
  isDocumentLocked: 'isDocumentLocked',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DealInvestorScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  investorId: 'investorId',
  amount: 'amount',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  type: 'type',
  url: 'url',
  size: 'size',
  mimeType: 'mimeType',
  smeId: 'smeId',
  dealId: 'dealId',
  uploadedBy: 'uploadedBy',
  accessLevel: 'accessLevel',
  isLocked: 'isLocked',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CertificationScalarFieldEnum = {
  id: 'id',
  smeId: 'smeId',
  advisorId: 'advisorId',
  status: 'status',
  score: 'score',
  comments: 'comments',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkflowScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  type: 'type',
  status: 'status',
  data: 'data',
  smeId: 'smeId',
  investorId: 'investorId',
  advisorId: 'advisorId',
  dealId: 'dealId',
  didWorkflowId: 'didWorkflowId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SyndicateScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  description: 'description',
  leadInvestorId: 'leadInvestorId',
  targetAmount: 'targetAmount',
  minInvestment: 'minInvestment',
  maxInvestment: 'maxInvestment',
  managementFee: 'managementFee',
  carryFee: 'carryFee',
  isTokenized: 'isTokenized',
  tokenName: 'tokenName',
  tokenSymbol: 'tokenSymbol',
  pricePerToken: 'pricePerToken',
  totalTokens: 'totalTokens',
  tokensSold: 'tokensSold',
  status: 'status',
  dealId: 'dealId',
  closingDate: 'closingDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SyndicateMemberScalarFieldEnum = {
  id: 'id',
  syndicateId: 'syndicateId',
  investorId: 'investorId',
  amount: 'amount',
  tokens: 'tokens',
  status: 'status',
  joinedAt: 'joinedAt'
};

exports.Prisma.SyndicateTokenListingScalarFieldEnum = {
  id: 'id',
  syndicateId: 'syndicateId',
  sellerId: 'sellerId',
  tokensAvailable: 'tokensAvailable',
  pricePerToken: 'pricePerToken',
  minTokens: 'minTokens',
  status: 'status',
  listedAt: 'listedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SyndicateTokenTradeScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  buyerId: 'buyerId',
  sellerId: 'sellerId',
  tokens: 'tokens',
  pricePerToken: 'pricePerToken',
  totalAmount: 'totalAmount',
  fee: 'fee',
  status: 'status',
  executedAt: 'executedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DueDiligenceScalarFieldEnum = {
  id: 'id',
  smeId: 'smeId',
  advisorId: 'advisorId',
  financialScore: 'financialScore',
  teamScore: 'teamScore',
  marketScore: 'marketScore',
  productScore: 'productScore',
  legalScore: 'legalScore',
  operationalScore: 'operationalScore',
  overallScore: 'overallScore',
  riskLevel: 'riskLevel',
  strengths: 'strengths',
  weaknesses: 'weaknesses',
  recommendations: 'recommendations',
  redFlags: 'redFlags',
  status: 'status',
  completedAt: 'completedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CommunityPostScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  authorId: 'authorId',
  title: 'title',
  content: 'content',
  category: 'category',
  smeId: 'smeId',
  dealId: 'dealId',
  syndicateId: 'syndicateId',
  likes: 'likes',
  views: 'views',
  isPinned: 'isPinned',
  isAnnouncement: 'isAnnouncement',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  postId: 'postId',
  authorId: 'authorId',
  content: 'content',
  parentId: 'parentId',
  likes: 'likes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SecondaryListingScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  sellerId: 'sellerId',
  dealInvestorId: 'dealInvestorId',
  sharesAvailable: 'sharesAvailable',
  pricePerShare: 'pricePerShare',
  minPurchase: 'minPurchase',
  status: 'status',
  listedAt: 'listedAt',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EscrowAccountScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  tenantId: 'tenantId',
  balance: 'balance',
  currency: 'currency',
  status: 'status',
  bankName: 'bankName',
  accountNumber: 'accountNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EscrowTransactionScalarFieldEnum = {
  id: 'id',
  escrowAccountId: 'escrowAccountId',
  tenantId: 'tenantId',
  amount: 'amount',
  currency: 'currency',
  type: 'type',
  status: 'status',
  reference: 'reference',
  description: 'description',
  requestedBy: 'requestedBy',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgreementScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  tenantId: 'tenantId',
  title: 'title',
  content: 'content',
  status: 'status',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgreementSignerScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  userId: 'userId',
  role: 'role',
  status: 'status',
  signedAt: 'signedAt',
  signature: 'signature',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DueDiligenceItemScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  dealId: 'dealId',
  task: 'task',
  description: 'description',
  status: 'status',
  assignedTo: 'assignedTo',
  completedBy: 'completedBy',
  completedAt: 'completedAt',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SecondaryTradeScalarFieldEnum = {
  id: 'id',
  listingId: 'listingId',
  buyerId: 'buyerId',
  sellerId: 'sellerId',
  shares: 'shares',
  pricePerShare: 'pricePerShare',
  totalAmount: 'totalAmount',
  fee: 'fee',
  status: 'status',
  executedAt: 'executedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  read: 'read',
  actionUrl: 'actionUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DisputeScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  dealId: 'dealId',
  initiatorId: 'initiatorId',
  resolverId: 'resolverId',
  reason: 'reason',
  description: 'description',
  status: 'status',
  resolution: 'resolution',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  dealId: 'dealId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationParticipantScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  userId: 'userId',
  lastReadAt: 'lastReadAt',
  joinedAt: 'joinedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  senderId: 'senderId',
  content: 'content',
  type: 'type',
  attachments: 'attachments',
  read: 'read',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdvisoryServiceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  advisorId: 'advisorId',
  name: 'name',
  category: 'category',
  description: 'description',
  price: 'price',
  duration: 'duration',
  features: 'features',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  advisorId: 'advisorId',
  serviceId: 'serviceId',
  preferredDate: 'preferredDate',
  notes: 'notes',
  status: 'status',
  amount: 'amount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MatchScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  smeId: 'smeId',
  investorId: 'investorId',
  score: 'score',
  factors: 'factors',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MatchInterestScalarFieldEnum = {
  id: 'id',
  matchId: 'matchId',
  userId: 'userId',
  interest: 'interest',
  createdAt: 'createdAt'
};

exports.Prisma.PushSubscriptionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  endpoint: 'endpoint',
  keys: 'keys',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  amount: 'amount',
  currency: 'currency',
  method: 'method',
  provider: 'provider',
  providerTxId: 'providerTxId',
  status: 'status',
  description: 'description',
  metadata: 'metadata',
  dealInvestorId: 'dealInvestorId',
  bookingId: 'bookingId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  plan: 'plan',
  status: 'status',
  billingCycle: 'billingCycle',
  pricePerSeat: 'pricePerSeat',
  seatsIncluded: 'seatsIncluded',
  seatsUsed: 'seatsUsed',
  featureEntitlements: 'featureEntitlements',
  nextBillingDate: 'nextBillingDate',
  trialEndsAt: 'trialEndsAt',
  cancelledAt: 'cancelledAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  customerUserId: 'customerUserId',
  subscriptionId: 'subscriptionId',
  invoiceNumber: 'invoiceNumber',
  monthStart: 'monthStart',
  monthEnd: 'monthEnd',
  dueDate: 'dueDate',
  status: 'status',
  currency: 'currency',
  subtotal: 'subtotal',
  tax: 'tax',
  total: 'total',
  amountPaid: 'amountPaid',
  outstandingAmount: 'outstandingAmount',
  metadata: 'metadata',
  issuedAt: 'issuedAt',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceLineItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  description: 'description',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  amount: 'amount',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SupportTicketScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  requesterId: 'requesterId',
  assigneeId: 'assigneeId',
  subject: 'subject',
  description: 'description',
  category: 'category',
  status: 'status',
  priority: 'priority',
  slaHours: 'slaHours',
  responseDueAt: 'responseDueAt',
  resolvedAt: 'resolvedAt',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminCaseScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  type: 'type',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  requesterUserId: 'requesterUserId',
  assigneeId: 'assigneeId',
  createdById: 'createdById',
  sourceDisputeId: 'sourceDisputeId',
  sourceTicketId: 'sourceTicketId',
  relatedEntityType: 'relatedEntityType',
  relatedEntityId: 'relatedEntityId',
  dueAt: 'dueAt',
  escalatedAt: 'escalatedAt',
  resolvedAt: 'resolvedAt',
  closedAt: 'closedAt',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminCaseEventScalarFieldEnum = {
  id: 'id',
  caseId: 'caseId',
  actorUserId: 'actorUserId',
  eventType: 'eventType',
  note: 'note',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.OnboardingTemplateScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  role: 'role',
  name: 'name',
  description: 'description',
  steps: 'steps',
  isActive: 'isActive',
  version: 'version',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OnboardingTaskScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  templateId: 'templateId',
  userId: 'userId',
  assigneeId: 'assigneeId',
  title: 'title',
  description: 'description',
  required: 'required',
  stepOrder: 'stepOrder',
  status: 'status',
  dueAt: 'dueAt',
  completedAt: 'completedAt',
  lastReminderAt: 'lastReminderAt',
  reminderCount: 'reminderCount',
  notes: 'notes',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RoleChangeRequestScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  requesterId: 'requesterId',
  currentRole: 'currentRole',
  requestedRole: 'requestedRole',
  reason: 'reason',
  status: 'status',
  reviewedById: 'reviewedById',
  reviewNote: 'reviewNote',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TemporaryRoleGrantScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  role: 'role',
  reason: 'reason',
  status: 'status',
  grantedById: 'grantedById',
  grantedAt: 'grantedAt',
  expiresAt: 'expiresAt',
  revokedAt: 'revokedAt',
  revokedById: 'revokedById',
  revokeReason: 'revokeReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdvisorCapacityScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  advisorId: 'advisorId',
  weeklyCapacityHours: 'weeklyCapacityHours',
  activeAssignments: 'activeAssignments',
  utilizationPct: 'utilizationPct',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdvisorAssignmentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  advisorId: 'advisorId',
  createdById: 'createdById',
  title: 'title',
  description: 'description',
  sourceType: 'sourceType',
  sourceId: 'sourceId',
  status: 'status',
  priority: 'priority',
  dueAt: 'dueAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdvisorConflictDeclarationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  advisorId: 'advisorId',
  dealId: 'dealId',
  entityName: 'entityName',
  conflictType: 'conflictType',
  details: 'details',
  status: 'status',
  reviewedById: 'reviewedById',
  reviewNote: 'reviewNote',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DataRetentionRuleScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  module: 'module',
  retentionDays: 'retentionDays',
  archiveBeforeDelete: 'archiveBeforeDelete',
  status: 'status',
  lastEvaluatedAt: 'lastEvaluatedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LegalHoldScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  title: 'title',
  reason: 'reason',
  status: 'status',
  scopeType: 'scopeType',
  scope: 'scope',
  createdById: 'createdById',
  releasedById: 'releasedById',
  releasedAt: 'releasedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReconciliationRunScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  status: 'status',
  paymentsTotal: 'paymentsTotal',
  invoicesTotal: 'invoicesTotal',
  expectedPayout: 'expectedPayout',
  actualPayout: 'actualPayout',
  discrepancyAmount: 'discrepancyAmount',
  notes: 'notes',
  createdById: 'createdById',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReconciliationExceptionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  runId: 'runId',
  type: 'type',
  severity: 'severity',
  status: 'status',
  referenceType: 'referenceType',
  referenceId: 'referenceId',
  expectedAmount: 'expectedAmount',
  actualAmount: 'actualAmount',
  delta: 'delta',
  reason: 'reason',
  assignedToId: 'assignedToId',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ActivityLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  action: 'action',
  entityId: 'entityId',
  entityType: 'entityType',
  metadata: 'metadata',
  timestamp: 'timestamp'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  balance: 'balance',
  frozenBalance: 'frozenBalance',
  currency: 'currency',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WalletTransactionScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  tenantId: 'tenantId',
  amount: 'amount',
  type: 'type',
  status: 'status',
  referenceType: 'referenceType',
  referenceId: 'referenceId',
  description: 'description',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LaunchpadOfferingScalarFieldEnum = {
  id: 'id',
  dealId: 'dealId',
  tenantId: 'tenantId',
  hardCap: 'hardCap',
  unitPrice: 'unitPrice',
  minCommitment: 'minCommitment',
  maxCommitment: 'maxCommitment',
  startTime: 'startTime',
  endTime: 'endTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LaunchpadCommitmentScalarFieldEnum = {
  id: 'id',
  offeringId: 'offeringId',
  investorId: 'investorId',
  tenantId: 'tenantId',
  committedAmount: 'committedAmount',
  allocatedShares: 'allocatedShares',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  SME: 'SME',
  INVESTOR: 'INVESTOR',
  ADVISOR: 'ADVISOR',
  ADMIN: 'ADMIN',
  FINOPS: 'FINOPS',
  CX: 'CX',
  AUDITOR: 'AUDITOR',
  COMPLIANCE: 'COMPLIANCE',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPPORT: 'SUPPORT'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

exports.Language = exports.$Enums.Language = {
  EN: 'EN',
  KM: 'KM',
  ZH: 'ZH'
};

exports.SMEStage = exports.$Enums.SMEStage = {
  SEED: 'SEED',
  GROWTH: 'GROWTH',
  EXPANSION: 'EXPANSION',
  MATURE: 'MATURE'
};

exports.SMEStatus = exports.$Enums.SMEStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  CERTIFIED: 'CERTIFIED',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED'
};

exports.InvestorType = exports.$Enums.InvestorType = {
  ANGEL: 'ANGEL',
  VENTURE_CAPITAL: 'VENTURE_CAPITAL',
  PRIVATE_EQUITY: 'PRIVATE_EQUITY',
  CORPORATE: 'CORPORATE',
  INSTITUTIONAL: 'INSTITUTIONAL'
};

exports.KYCStatus = exports.$Enums.KYCStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  UNDER_REVIEW: 'UNDER_REVIEW'
};

exports.InvestorStatus = exports.$Enums.InvestorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

exports.AdvisorStatus = exports.$Enums.AdvisorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

exports.DealStatus = exports.$Enums.DealStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  NEGOTIATION: 'NEGOTIATION',
  DUE_DILIGENCE: 'DUE_DILIGENCE',
  APPROVED_FOR_LISTING: 'APPROVED_FOR_LISTING',
  LAUNCHPAD_PREP: 'LAUNCHPAD_PREP',
  LAUNCHPAD_ACTIVE: 'LAUNCHPAD_ACTIVE',
  ALLOCATION: 'ALLOCATION',
  DISTRIBUTED: 'DISTRIBUTED',
  SECONDARY_TRADING: 'SECONDARY_TRADING',
  FUNDED: 'FUNDED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

exports.InvestmentStatus = exports.$Enums.InvestmentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  PITCH_DECK: 'PITCH_DECK',
  FINANCIAL_STATEMENT: 'FINANCIAL_STATEMENT',
  BUSINESS_PLAN: 'BUSINESS_PLAN',
  LEGAL_DOCUMENT: 'LEGAL_DOCUMENT',
  OTHER: 'OTHER'
};

exports.AccessLevel = exports.$Enums.AccessLevel = {
  PUBLIC: 'PUBLIC',
  QUALIFIED: 'QUALIFIED',
  CONFIDENTIAL: 'CONFIDENTIAL',
  ADMIN_ONLY: 'ADMIN_ONLY'
};

exports.CertificationStatus = exports.$Enums.CertificationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.WorkflowType = exports.$Enums.WorkflowType = {
  SME_ONBOARDING: 'SME_ONBOARDING',
  SME_CERTIFICATION: 'SME_CERTIFICATION',
  INVESTOR_ONBOARDING: 'INVESTOR_ONBOARDING',
  DEAL_APPROVAL: 'DEAL_APPROVAL',
  KYC_VERIFICATION: 'KYC_VERIFICATION'
};

exports.WorkflowStatus = exports.$Enums.WorkflowStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.SyndicateStatus = exports.$Enums.SyndicateStatus = {
  FORMING: 'FORMING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  FUNDED: 'FUNDED',
  DISSOLVED: 'DISSOLVED'
};

exports.SyndicateMemberStatus = exports.$Enums.SyndicateMemberStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.ListingStatus = exports.$Enums.ListingStatus = {
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

exports.TradeStatus = exports.$Enums.TradeStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED'
};

exports.RiskLevel = exports.$Enums.RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH'
};

exports.AssessmentStatus = exports.$Enums.AssessmentStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  WAIVED: 'WAIVED'
};

exports.PostCategory = exports.$Enums.PostCategory = {
  GENERAL: 'GENERAL',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  DEAL_UPDATE: 'DEAL_UPDATE',
  INVESTOR_INSIGHT: 'INVESTOR_INSIGHT',
  SME_NEWS: 'SME_NEWS',
  QUESTION: 'QUESTION',
  SUCCESS_STORY: 'SUCCESS_STORY'
};

exports.PostStatus = exports.$Enums.PostStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN',
  DELETED: 'DELETED'
};

exports.EscrowStatus = exports.$Enums.EscrowStatus = {
  OPEN: 'OPEN',
  LOCKED: 'LOCKED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED'
};

exports.EscrowTransactionType = exports.$Enums.EscrowTransactionType = {
  DEPOSIT: 'DEPOSIT',
  RELEASE: 'RELEASE',
  REFUND: 'REFUND',
  FEE: 'FEE'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.AgreementStatus = exports.$Enums.AgreementStatus = {
  DRAFT: 'DRAFT',
  PENDING_SIGNATURES: 'PENDING_SIGNATURES',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.SigningStatus = exports.$Enums.SigningStatus = {
  PENDING: 'PENDING',
  SIGNED: 'SIGNED',
  REJECTED: 'REJECTED'
};

exports.ChecklistStatus = exports.$Enums.ChecklistStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  WAIVED: 'WAIVED'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DEAL: 'DEAL',
  SYSTEM: 'SYSTEM',
  MATCH_FOUND: 'MATCH_FOUND',
  INTEREST_RECEIVED: 'INTEREST_RECEIVED',
  DEAL_UPDATE: 'DEAL_UPDATE',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  MEETING_REMINDER: 'MEETING_REMINDER'
};

exports.DisputeStatus = exports.$Enums.DisputeStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

exports.MatchStatus = exports.$Enums.MatchStatus = {
  PENDING: 'PENDING',
  ADVISOR_VERIFIED: 'ADVISOR_VERIFIED',
  REJECTED: 'REJECTED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  ABA_PAYWAY: 'ABA_PAYWAY',
  KHQR: 'KHQR',
  CASH: 'CASH'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
};

exports.SubscriptionPlan = exports.$Enums.SubscriptionPlan = {
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
  ENTERPRISE: 'ENTERPRISE'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  TRIAL: 'TRIAL'
};

exports.BillingCycle = exports.$Enums.BillingCycle = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
};

exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE',
  VOID: 'VOID'
};

exports.SupportTicketStatus = exports.$Enums.SupportTicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_CUSTOMER: 'WAITING_CUSTOMER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED'
};

exports.SupportTicketPriority = exports.$Enums.SupportTicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.CaseType = exports.$Enums.CaseType = {
  KYC: 'KYC',
  DISPUTE: 'DISPUTE',
  ONBOARDING: 'ONBOARDING',
  SUPPORT: 'SUPPORT',
  COMPLIANCE: 'COMPLIANCE',
  DEAL_OPS: 'DEAL_OPS',
  OTHER: 'OTHER'
};

exports.CaseStatus = exports.$Enums.CaseStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_CUSTOMER: 'WAITING_CUSTOMER',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
};

exports.CasePriority = exports.$Enums.CasePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.OnboardingTaskStatus = exports.$Enums.OnboardingTaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WAIVED: 'WAIVED'
};

exports.RoleRequestStatus = exports.$Enums.RoleRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

exports.GrantStatus = exports.$Enums.GrantStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
};

exports.AdvisorAssignmentStatus = exports.$Enums.AdvisorAssignmentStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.AdvisorAssignmentPriority = exports.$Enums.AdvisorAssignmentPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.AdvisorConflictStatus = exports.$Enums.AdvisorConflictStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.RetentionModule = exports.$Enums.RetentionModule = {
  MESSAGES: 'MESSAGES',
  DOCUMENTS: 'DOCUMENTS',
  ACTIVITY_LOGS: 'ACTIVITY_LOGS',
  SESSIONS: 'SESSIONS',
  DISPUTES: 'DISPUTES',
  WORKFLOWS: 'WORKFLOWS'
};

exports.RetentionRuleStatus = exports.$Enums.RetentionRuleStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED'
};

exports.LegalHoldStatus = exports.$Enums.LegalHoldStatus = {
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED'
};

exports.ReconciliationStatus = exports.$Enums.ReconciliationStatus = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.ReconciliationExceptionType = exports.$Enums.ReconciliationExceptionType = {
  PAYMENT_MISMATCH: 'PAYMENT_MISMATCH',
  INVOICE_MISMATCH: 'INVOICE_MISMATCH',
  PAYOUT_MISSING: 'PAYOUT_MISSING',
  ORPHAN_TRANSACTION: 'ORPHAN_TRANSACTION'
};

exports.ReconciliationSeverity = exports.$Enums.ReconciliationSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.ReconciliationExceptionStatus = exports.$Enums.ReconciliationExceptionStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED'
};

exports.WalletStatus = exports.$Enums.WalletStatus = {
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  LOCKED: 'LOCKED'
};

exports.WalletTransactionType = exports.$Enums.WalletTransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRADE_BUY: 'TRADE_BUY',
  TRADE_SELL: 'TRADE_SELL',
  FEE: 'FEE',
  REFUND: 'REFUND',
  ADVISORY_PAYMENT: 'ADVISORY_PAYMENT',
  LAUNCHPAD_LOCK: 'LAUNCHPAD_LOCK',
  LAUNCHPAD_REFUND: 'LAUNCHPAD_REFUND',
  LAUNCHPAD_ALLOCATION: 'LAUNCHPAD_ALLOCATION'
};

exports.WalletTransactionStatus = exports.$Enums.WalletTransactionStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.CommitmentStatus = exports.$Enums.CommitmentStatus = {
  PENDING: 'PENDING',
  ALLOCATED: 'ALLOCATED',
  REFUNDED: 'REFUNDED'
};

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  User: 'User',
  RefreshToken: 'RefreshToken',
  SME: 'SME',
  Investor: 'Investor',
  Advisor: 'Advisor',
  Deal: 'Deal',
  DealInvestor: 'DealInvestor',
  Document: 'Document',
  Certification: 'Certification',
  Workflow: 'Workflow',
  Syndicate: 'Syndicate',
  SyndicateMember: 'SyndicateMember',
  SyndicateTokenListing: 'SyndicateTokenListing',
  SyndicateTokenTrade: 'SyndicateTokenTrade',
  DueDiligence: 'DueDiligence',
  CommunityPost: 'CommunityPost',
  Comment: 'Comment',
  SecondaryListing: 'SecondaryListing',
  EscrowAccount: 'EscrowAccount',
  EscrowTransaction: 'EscrowTransaction',
  Agreement: 'Agreement',
  AgreementSigner: 'AgreementSigner',
  DueDiligenceItem: 'DueDiligenceItem',
  SecondaryTrade: 'SecondaryTrade',
  Notification: 'Notification',
  Dispute: 'Dispute',
  Conversation: 'Conversation',
  ConversationParticipant: 'ConversationParticipant',
  Message: 'Message',
  AdvisoryService: 'AdvisoryService',
  Booking: 'Booking',
  Match: 'Match',
  MatchInterest: 'MatchInterest',
  PushSubscription: 'PushSubscription',
  Payment: 'Payment',
  Subscription: 'Subscription',
  Invoice: 'Invoice',
  InvoiceLineItem: 'InvoiceLineItem',
  SupportTicket: 'SupportTicket',
  AdminCase: 'AdminCase',
  AdminCaseEvent: 'AdminCaseEvent',
  OnboardingTemplate: 'OnboardingTemplate',
  OnboardingTask: 'OnboardingTask',
  RoleChangeRequest: 'RoleChangeRequest',
  TemporaryRoleGrant: 'TemporaryRoleGrant',
  AdvisorCapacity: 'AdvisorCapacity',
  AdvisorAssignment: 'AdvisorAssignment',
  AdvisorConflictDeclaration: 'AdvisorConflictDeclaration',
  DataRetentionRule: 'DataRetentionRule',
  LegalHold: 'LegalHold',
  ReconciliationRun: 'ReconciliationRun',
  ReconciliationException: 'ReconciliationException',
  ActivityLog: 'ActivityLog',
  Wallet: 'Wallet',
  WalletTransaction: 'WalletTransaction',
  LaunchpadOffering: 'LaunchpadOffering',
  LaunchpadCommitment: 'LaunchpadCommitment'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://github.com/prisma/prisma/issues`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
