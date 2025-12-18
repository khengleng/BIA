--
-- PostgreSQL database dump
--

\restrict CGUnPpRYfFRSM7gTbTgEcIKJBgvbLqzRiyxdjD9qwrM8uxTjGgtdDLvyKhZbk8f

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdvisorStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdvisorStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."AdvisorStatus" OWNER TO postgres;

--
-- Name: CertificationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CertificationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."CertificationStatus" OWNER TO postgres;

--
-- Name: DealStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DealStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'NEGOTIATION',
    'FUNDED',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public."DealStatus" OWNER TO postgres;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentType" AS ENUM (
    'PITCH_DECK',
    'FINANCIAL_STATEMENT',
    'BUSINESS_PLAN',
    'LEGAL_DOCUMENT',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO postgres;

--
-- Name: InvestmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvestmentStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."InvestmentStatus" OWNER TO postgres;

--
-- Name: InvestorType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvestorType" AS ENUM (
    'ANGEL',
    'VENTURE_CAPITAL',
    'PRIVATE_EQUITY',
    'CORPORATE',
    'INSTITUTIONAL'
);


ALTER TYPE public."InvestorType" OWNER TO postgres;

--
-- Name: KYCStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KYCStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."KYCStatus" OWNER TO postgres;

--
-- Name: Language; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Language" AS ENUM (
    'EN',
    'KM',
    'ZH'
);


ALTER TYPE public."Language" OWNER TO postgres;

--
-- Name: SMEStage; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SMEStage" AS ENUM (
    'SEED',
    'GROWTH',
    'EXPANSION',
    'MATURE'
);


ALTER TYPE public."SMEStage" OWNER TO postgres;

--
-- Name: SMEStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SMEStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'CERTIFIED',
    'REJECTED'
);


ALTER TYPE public."SMEStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'SME',
    'INVESTOR',
    'ADVISOR',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: WorkflowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkflowStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."WorkflowStatus" OWNER TO postgres;

--
-- Name: WorkflowType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WorkflowType" AS ENUM (
    'SME_ONBOARDING',
    'SME_CERTIFICATION',
    'INVESTOR_ONBOARDING',
    'DEAL_APPROVAL',
    'KYC_VERIFICATION'
);


ALTER TYPE public."WorkflowType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: advisors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advisors (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    specialization text[],
    "certificationList" text[],
    status public."AdvisorStatus" DEFAULT 'ACTIVE'::public."AdvisorStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.advisors OWNER TO postgres;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifications (
    id text NOT NULL,
    "smeId" text NOT NULL,
    "advisorId" text NOT NULL,
    status public."CertificationStatus" DEFAULT 'PENDING'::public."CertificationStatus" NOT NULL,
    score double precision,
    comments text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.certifications OWNER TO postgres;

--
-- Name: deal_investors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deal_investors (
    id text NOT NULL,
    "dealId" text NOT NULL,
    "investorId" text NOT NULL,
    amount double precision NOT NULL,
    status public."InvestmentStatus" DEFAULT 'PENDING'::public."InvestmentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.deal_investors OWNER TO postgres;

--
-- Name: deals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deals (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "smeId" text NOT NULL,
    title text NOT NULL,
    description text,
    amount double precision NOT NULL,
    equity double precision,
    status public."DealStatus" DEFAULT 'DRAFT'::public."DealStatus" NOT NULL,
    "successFee" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.deals OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    type public."DocumentType" NOT NULL,
    url text NOT NULL,
    size integer NOT NULL,
    "mimeType" text NOT NULL,
    "smeId" text,
    "dealId" text,
    "uploadedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: investors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.investors (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    type public."InvestorType" NOT NULL,
    "kycStatus" public."KYCStatus" DEFAULT 'PENDING'::public."KYCStatus" NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
    portfolio jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.investors OWNER TO postgres;

--
-- Name: smes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smes (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    sector text NOT NULL,
    stage public."SMEStage" NOT NULL,
    "fundingRequired" double precision NOT NULL,
    description text,
    website text,
    location text,
    score double precision DEFAULT 0,
    certified boolean DEFAULT false NOT NULL,
    "certificationDate" timestamp(3) without time zone,
    status public."SMEStatus" DEFAULT 'DRAFT'::public."SMEStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.smes OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    domain text,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    language public."Language" DEFAULT 'EN'::public."Language" NOT NULL,
    did text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    type public."WorkflowType" NOT NULL,
    status public."WorkflowStatus" DEFAULT 'PENDING'::public."WorkflowStatus" NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    "smeId" text,
    "investorId" text,
    "advisorId" text,
    "dealId" text,
    "didWorkflowId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.workflows OWNER TO postgres;

--
-- Data for Name: advisors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advisors (id, "tenantId", "userId", name, specialization, "certificationList", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certifications (id, "smeId", "advisorId", status, score, comments, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deal_investors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deal_investors (id, "dealId", "investorId", amount, status, "createdAt", "updatedAt") FROM stdin;
cmeuu66xu000110icmiw951t4	deal_1	investor_1	500000	PENDING	2025-08-28 03:20:25.506	2025-08-28 03:20:25.506
\.


--
-- Data for Name: deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deals (id, "tenantId", "smeId", title, description, amount, equity, status, "successFee", "createdAt", "updatedAt") FROM stdin;
deal_1	default	sme_1	Tech Startup A Series A Funding	Series A funding round for Tech Startup A to expand their fintech platform	500000	15	PUBLISHED	\N	2025-08-28 03:20:25.501	2025-08-28 03:20:25.501
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, "tenantId", name, type, url, size, "mimeType", "smeId", "dealId", "uploadedBy", "createdAt", "updatedAt") FROM stdin;
doc_1	default	Identification Document	OTHER	/uploads/identification.pdf	1200000	application/pdf	\N	\N	user_1	2025-08-28 03:20:25.509	2025-08-28 03:20:25.509
doc_2	default	Proof of Funds	OTHER	/uploads/proof-of-funds.pdf	2100000	application/pdf	\N	\N	user_1	2025-08-28 03:20:25.511	2025-08-28 03:20:25.511
doc_3	default	Professional References	OTHER	/uploads/references.pdf	800000	application/pdf	\N	\N	user_1	2025-08-28 03:20:25.512	2025-08-28 03:20:25.512
doc_4	default	Term Sheet	LEGAL_DOCUMENT	/uploads/term-sheet.pdf	1500000	application/pdf	\N	deal_1	user_1	2025-08-28 03:20:25.514	2025-08-28 03:20:25.514
doc_5	default	Financial Model	FINANCIAL_STATEMENT	/uploads/financial-model.xlsx	2800000	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet	\N	deal_1	user_1	2025-08-28 03:20:25.515	2025-08-28 03:20:25.515
doc_6	default	Due Diligence Report	OTHER	/uploads/due-diligence.pdf	3200000	application/pdf	\N	deal_1	user_1	2025-08-28 03:20:25.516	2025-08-28 03:20:25.516
\.


--
-- Data for Name: investors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.investors (id, "tenantId", "userId", name, type, "kycStatus", preferences, portfolio, "createdAt", "updatedAt") FROM stdin;
investor_1	default	investor_1	John Smith	ANGEL	VERIFIED	{}	[]	2025-08-28 03:20:25.478	2025-08-28 03:20:25.478
\.


--
-- Data for Name: smes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.smes (id, "tenantId", "userId", name, sector, stage, "fundingRequired", description, website, location, score, certified, "certificationDate", status, "createdAt", "updatedAt") FROM stdin;
sme_1	default	sme_1	Tech Startup A	Technology	GROWTH	500000	Innovative fintech solution for digital payments and financial inclusion.	https://techstartupa.com	Phnom Penh, Cambodia	0	f	\N	CERTIFIED	2025-08-28 03:20:25.465	2025-08-28 03:20:25.465
sme_2	default	advisor_1	E-commerce Platform B	E-commerce	SEED	200000	Online marketplace connecting local artisans with global customers.	https://ecommerceb.com	Siem Reap, Cambodia	0	f	\N	SUBMITTED	2025-08-28 03:20:25.473	2025-08-28 03:20:25.473
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, domain, settings, "createdAt", "updatedAt") FROM stdin;
default	Default Tenant	boutique-advisory.com	{}	2025-08-28 03:20:25.15	2025-08-28 03:20:25.15
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "tenantId", email, password, "firstName", "lastName", role, status, language, did, "createdAt", "updatedAt") FROM stdin;
admin_1	default	admin@boutique-advisory.com	$2a$12$qRC/clWqx.yP/eTR2SzfHuAQ5KB94FZAbNyxZzslL.ZNZc73VRPuy	Admin	User	ADMIN	ACTIVE	EN	\N	2025-08-28 03:20:25.403	2025-08-28 03:20:25.403
advisor_1	default	advisor@boutique-advisory.com	$2a$12$qRC/clWqx.yP/eTR2SzfHuAQ5KB94FZAbNyxZzslL.ZNZc73VRPuy	Sarah	Johnson	ADVISOR	ACTIVE	EN	\N	2025-08-28 03:20:25.409	2025-08-28 03:20:25.409
investor_1	default	investor@boutique-advisory.com	$2a$12$qRC/clWqx.yP/eTR2SzfHuAQ5KB94FZAbNyxZzslL.ZNZc73VRPuy	John	Smith	INVESTOR	ACTIVE	EN	\N	2025-08-28 03:20:25.427	2025-08-28 03:20:25.427
sme_1	default	sme@boutique-advisory.com	$2a$12$qRC/clWqx.yP/eTR2SzfHuAQ5KB94FZAbNyxZzslL.ZNZc73VRPuy	Tech	Startup	SME	ACTIVE	EN	\N	2025-08-28 03:20:25.462	2025-08-28 03:20:25.462
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows (id, "tenantId", type, status, data, "smeId", "investorId", "advisorId", "dealId", "didWorkflowId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: advisors advisors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advisors
    ADD CONSTRAINT advisors_pkey PRIMARY KEY (id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: deal_investors deal_investors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_investors
    ADD CONSTRAINT deal_investors_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: investors investors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT investors_pkey PRIMARY KEY (id);


--
-- Name: smes smes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smes
    ADD CONSTRAINT smes_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: advisors_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "advisors_userId_key" ON public.advisors USING btree ("userId");


--
-- Name: deal_investors_dealId_investorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "deal_investors_dealId_investorId_key" ON public.deal_investors USING btree ("dealId", "investorId");


--
-- Name: investors_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "investors_userId_key" ON public.investors USING btree ("userId");


--
-- Name: smes_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "smes_userId_key" ON public.smes USING btree ("userId");


--
-- Name: tenants_domain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tenants_domain_key ON public.tenants USING btree (domain);


--
-- Name: users_tenantId_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_tenantId_email_key" ON public.users USING btree ("tenantId", email);


--
-- Name: advisors advisors_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advisors
    ADD CONSTRAINT "advisors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: advisors advisors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advisors
    ADD CONSTRAINT "advisors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certifications certifications_advisorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT "certifications_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES public.advisors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: certifications certifications_smeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT "certifications_smeId_fkey" FOREIGN KEY ("smeId") REFERENCES public.smes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deal_investors deal_investors_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_investors
    ADD CONSTRAINT "deal_investors_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deal_investors deal_investors_investorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deal_investors
    ADD CONSTRAINT "deal_investors_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES public.investors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deals deals_smeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_smeId_fkey" FOREIGN KEY ("smeId") REFERENCES public.smes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deals deals_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT "deals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_smeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_smeId_fkey" FOREIGN KEY ("smeId") REFERENCES public.smes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investors investors_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT "investors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investors investors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT "investors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: smes smes_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smes
    ADD CONSTRAINT "smes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: smes smes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smes
    ADD CONSTRAINT "smes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflows workflows_advisorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT "workflows_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES public.advisors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflows workflows_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT "workflows_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public.deals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflows workflows_investorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT "workflows_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES public.investors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflows workflows_smeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT "workflows_smeId_fkey" FOREIGN KEY ("smeId") REFERENCES public.smes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workflows workflows_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT "workflows_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CGUnPpRYfFRSM7gTbTgEcIKJBgvbLqzRiyxdjD9qwrM8uxTjGgtdDLvyKhZbk8f

