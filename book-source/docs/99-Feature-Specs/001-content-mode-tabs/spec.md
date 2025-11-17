---
title: "Complete Specification"
sidebar_position: 4
description: "864-line detailed technical specification"
---

# Feature Specification: AI-Generated Content Mode Tabs with Authentication

:::caution Complete Technical Specification
This is the detailed 864-line specification document. For a quicker overview, see the [Executive Summary](./summary) or [Visual Guide](./visual-guide).
:::

**Feature Branch**: `001-content-mode-tabs`
**Created**: 2025-11-17
**Status**: Draft → Review
**Author**: Junior Developer (Irfan) | **Reviewed By**: [Pending Team Review]

---

## Executive Summary

**Problem**: Readers consume educational content in different contexts (learning, reviewing, applying) but receive only one static version, leading to suboptimal comprehension and engagement.

**Solution**: Add **three toggleable content modes** to every lesson:
1. **Original** (default, no auth) - Full detailed content
2. **Summary** (requires auth) - AI-condensed version (30-50% length) for quick review
3. **Personalized** (requires auth) - AI-adapted content based on user's professional background/context

**Business Value**:
- **Increase engagement**: 40%+ users expected to use alternative modes
- **Improve retention**: Quick summaries enable faster review cycles
- **Broaden audience**: Personalization makes technical content accessible to non-technical professionals
- **Data collection**: User preferences inform future content strategy
- **Monetization foundation**: Free signup model with upsell potential

**Technical Approach**:
- Leverage existing **Vercel + Docusaurus + Gemini AI** infrastructure
- Zero backend complexity (serverless functions only)
- Aggressive caching (80%+ cache hit rate target)
- Production-ready: monitoring, rate limiting, error handling

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Review Mode (Priority: **P0** - MVP Core)

**As a** returning student who completed Chapter 5 last week,
**I want** a condensed summary of key concepts,
**So that** I can refresh my memory in 2-3 minutes before starting Chapter 6.

**Why this priority**: **Critical MVP feature**. Summary mode delivers immediate, measurable value (time savings). Can be tested and deployed independently of Personalization.

**Independent Test**:
1. Deploy Summary mode only (no Personalization yet)
2. User signs up → clicks "Summary" tab → sees condensed content in <8 seconds
3. **Delivers value**: User reviews full chapter in 1/3 the time

**Acceptance Scenarios**:

1. **Given** user is signed in and viewing any lesson page,
   **When** user clicks "Summary" tab,
   **Then** AI-generated summary appears within 8 seconds (first-time) or <200ms (cached)

2. **Given** Summary content is generated,
   **When** user compares length to Original,
   **Then** Summary is 30-50% of Original length (automated validation)

3. **Given** user is NOT signed in,
   **When** user clicks "Summary" tab,
   **Then** system shows "Sign up to unlock Summary mode" modal

4. **Given** Summary mode is active,
   **When** user navigates to another lesson,
   **Then** Summary mode persists (session state maintained)

5. **Given** user completes reading a Summary,
   **When** system tracks reading time,
   **Then** Summary reading time is 30-50% of Original (validates effectiveness)

---

### User Story 2 - Professional Context Personalization (Priority: **P1** - Core Differentiator)

**As an** accountant learning Python for data automation,
**I want** technical concepts explained using accounting/finance analogies,
**So that** I can understand unfamiliar programming concepts faster by connecting them to my domain.

**Why this priority**: **Key differentiator** from other technical books. Unlocks non-technical audience. Requires auth + profile data, builds on P0 infrastructure.

**Independent Test**:
1. User signs up → selects "Accountant/Finance" as professional background
2. User clicks "Personalized" tab on any lesson
3. **Delivers value**: Technical jargon is replaced with finance analogies (e.g., "variables are like ledger accounts")

**Acceptance Scenarios**:

1. **Given** user signed up and selected professional background "Accountant",
   **When** user clicks "Personalized" tab on a lesson about variables,
   **Then** content includes finance analogies (e.g., "Think of variables like accounts in your ledger")

2. **Given** user is a "Healthcare Professional",
   **When** user views Personalized mode,
   **Then** content includes medical analogies (e.g., "APIs are like patient referral systems")

3. **Given** user is a "Software Developer" (technical background),
   **When** user views Personalized mode,
   **Then** content remains technical but concise (no simplification needed)

4. **Given** Personalized content is generated,
   **When** we validate reading level,
   **Then** non-technical versions use Grade 6-8 vocabulary, technical versions use Grade 10-12

5. **Given** user changes professional background in settings,
   **When** user revisits a lesson in Personalized mode,
   **Then** cache is invalidated and content regenerates for new context

---

### User Story 3 - Seamless Authentication (Priority: **P1** - Enabler for P0 & P1)

**As a** new visitor interested in Summary or Personalized modes,
**I want** quick, frictionless sign-up (email + password + 1 context question),
**So that** I can unlock advanced modes in <60 seconds without abandoning the page.

**Why this priority**: **Prerequisite** for P0 & P1. Must be production-ready (secure, fast, reliable). No signup = no feature usage.

**Independent Test**:
1. Anonymous user clicks "Summary" → signup modal appears
2. User completes signup in <60 seconds → immediately sees Summary content
3. **Delivers value**: Zero friction between discovery and access

**Acceptance Scenarios**:

1. **Given** anonymous user clicks "Summary" or "Personalized" tab,
   **When** signup modal appears,
   **Then** user sees 3-field form: Email, Password, Professional Background (dropdown)

2. **Given** user enters valid email/password,
   **When** user selects professional background and submits,
   **Then** account is created and user is auto-logged-in within 2 seconds

3. **Given** user already has an account,
   **When** user clicks "Already have an account?" link,
   **Then** modal switches to login form (email + password only)

4. **Given** user completes signup,
   **When** user closes tab and returns later,
   **Then** user remains logged in (JWT token in httpOnly cookie, 30-day expiry)

5. **Given** user forgets password,
   **When** user clicks "Forgot password?" link,
   **Then** password reset email is sent within 5 seconds

---

### User Story 4 - Persistent Tab Preference (Priority: **P2** - UX Polish)

**As a** user who prefers reading Summaries by default,
**I want** my tab preference remembered across lessons,
**So that** I don't have to manually select "Summary" on every page.

**Why this priority**: **Nice-to-have UX improvement**. Not critical for MVP, but significantly improves power-user experience.

**Independent Test**:
1. User selects "Summary" tab on Lesson 1
2. User navigates to Lesson 2
3. **Delivers value**: Summary tab is pre-selected (no extra click needed)

**Acceptance Scenarios**:

1. **Given** user selects "Summary" tab on any lesson,
   **When** user navigates to another lesson,
   **Then** "Summary" tab is pre-selected by default

2. **Given** user's preferred mode is stored in localStorage,
   **When** user clears browser data,
   **Then** preference resets to "Original" (default)

3. **Given** user is logged in,
   **When** user sets tab preference,
   **Then** preference is synced to user profile (accessible across devices)

---

### User Story 5 - Mobile-Responsive Tabs (Priority: **P2** - Accessibility)

**As a** mobile user reading on my phone,
**I want** tabs that work smoothly on small screens,
**So that** I can switch modes without zooming or horizontal scrolling.

**Why this priority**: **40-50% of traffic is mobile**. Must work well, but not a blocker for desktop-first MVP.

**Independent Test**:
1. Open lesson on iPhone (375px width)
2. **Delivers value**: Tabs are touch-friendly (min 44px tap target), no horizontal scroll

**Acceptance Scenarios**:

1. **Given** user opens lesson on mobile (375px width),
   **When** page loads,
   **Then** tabs display as full-width buttons (stacked or horizontally scrollable)

2. **Given** user taps a tab on mobile,
   **When** content switches,
   **Then** page scrolls to top of content (no jarring jump)

3. **Given** mobile viewport is narrow,
   **When** tabs are rendered,
   **Then** tab labels are readable (no truncation) and tap targets are ≥44px

---

### Edge Cases

**Authentication**:
- What happens when user's JWT token expires mid-session?
  → Auto-refresh token silently if <7 days old, else redirect to login

- What happens when user signup fails (duplicate email, weak password)?
  → Show inline error message, preserve form data, suggest fix

**Content Generation**:
- What happens when AI generation fails (timeout, rate limit, API error)?
  → Show error toast: "Generation failed. Please try again." + fallback to Original mode

- What happens when Summary is >50% of Original (AI didn't condense enough)?
  → Log warning to monitoring, still display content, flag for manual review

- What happens when Personalized content doesn't match user's background (generic output)?
  → Log quality metric, A/B test different prompts, improve over time

**Performance**:
- What happens when cache is full (storage limit reached)?
  → Use LRU (Least Recently Used) eviction policy, max 100MB per user

- What happens when user has slow connection (<1 Mbps)?
  → Show loading skeleton immediately, progressive content rendering

**Abuse/Security**:
- What happens when user spams tab switching (DDoS attack vector)?
  → Rate limit: max 10 tab switches per minute, show throttle message

- What happens when user tries SQL injection in signup form?
  → Input validation + parameterized queries prevent injection

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication (FR-A)**
- **FR-A01**: System MUST support email/password signup with validation (valid email format, min 8-char password)
- **FR-A02**: System MUST store passwords as bcrypt hashes (cost factor 12, never plaintext)
- **FR-A03**: System MUST issue JWT tokens (httpOnly cookie, 30-day expiry, secure flag in production)
- **FR-A04**: System MUST support login with existing credentials
- **FR-A05**: System MUST support password reset via email (magic link, 1-hour expiry)
- **FR-A06**: System MUST collect "Professional Background" during signup (dropdown: 8 options)
- **FR-A07**: Users MUST be able to update professional background in settings

**Content Modes (FR-C)**
- **FR-C01**: System MUST display Original content by default (no auth required)
- **FR-C02**: System MUST generate Summary content on-demand (requires auth, 30-50% length of Original)
- **FR-C03**: System MUST generate Personalized content on-demand (requires auth + professional background)
- **FR-C04**: System MUST preserve all "Try With AI" prompts in Summary and Personalized modes
- **FR-C05**: System MUST maintain markdown formatting (headings, code blocks, images, links) in generated content
- **FR-C06**: System MUST cache generated content (key: lesson_path + mode + background, TTL: 7 days)
- **FR-C07**: System MUST invalidate cache when Original content is updated (version-based cache keys)

**UI/UX (FR-U)**
- **FR-U01**: System MUST display three tabs at top of every lesson page: [Original] [Summary] [Personalized]
- **FR-U02**: System MUST visually highlight active tab (color + underline)
- **FR-U03**: System MUST show signup modal when unauthenticated user clicks Summary/Personalized
- **FR-U04**: System MUST show loading indicator during content generation (<8s for first-time, <200ms for cached)
- **FR-U05**: System MUST persist tab selection across page navigation (localStorage + user profile)
- **FR-U06**: System MUST be mobile-responsive (works on 375px+ width screens)

**Performance (FR-P)**
- **FR-P01**: System MUST complete content generation within 8 seconds (95th percentile)
- **FR-P02**: System MUST serve cached content within 200ms
- **FR-P03**: System MUST achieve ≥80% cache hit rate after initial week
- **FR-P04**: System MUST rate-limit API requests (10 requests/minute per user, 1000/day per IP)

**Monitoring (FR-M)**
- **FR-M01**: System MUST log all authentication events (signup, login, logout, failures)
- **FR-M02**: System MUST log all content generation events (mode, duration, success/failure)
- **FR-M03**: System MUST track tab usage metrics (clicks per mode, time per mode)
- **FR-M04**: System MUST alert on high error rates (>5% failure rate triggers alert)

### Key Entities

**User**
- **Attributes**: `id` (UUID), `email` (unique), `password_hash`, `professional_background` (enum), `preferred_mode` (enum: original|summary|personalized), `created_at`, `last_login`
- **Relationships**: One user → Many cached content entries

**CachedContent**
- **Attributes**: `id`, `lesson_path`, `mode` (enum), `professional_background` (nullable), `content_markdown`, `generated_at`, `cache_version` (invalidation key)
- **Relationships**: Many cached entries → One lesson

**AnalyticsEvent**
- **Attributes**: `id`, `user_id` (nullable for anonymous), `event_type` (enum: tab_click, content_generate, signup), `lesson_path`, `metadata` (JSON), `timestamp`
- **Purpose**: Track feature usage for optimization

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Engagement Metrics (Week 1 post-launch)**
- **SC-001**: ≥25% of users interact with tabs (click Summary or Personalized at least once) → Target: 40%
- **SC-002**: ≥60 cache hit rate (reduces API costs) → Target: 80%
- **SC-003**: <8s average content generation time (95th percentile) → Target: 6s

**Quality Metrics (Month 1)**
- **SC-004**: Summary length is 30-50% of Original (automated validation on all generated content)
- **SC-005**: ≥85% of users successfully complete signup on first attempt (no form abandonment)
- **SC-006**: Zero critical security vulnerabilities (SQL injection, XSS, exposed credentials)

**User Satisfaction (Month 1 survey, n=100 users)**
- **SC-007**: ≥4.0/5.0 rating for Summary usefulness → Target: 4.3/5.0
- **SC-008**: ≥3.8/5.0 rating for Personalization accuracy → Target: 4.0/5.0
- **SC-009**: ≥60% of users prefer Summary or Personalized over Original for review scenarios

**Business Metrics (Month 3)**
- **SC-010**: ≥500 signups (validates feature demand)
- **SC-011**: <$50/month AI API costs (proves cost-efficiency via caching)
- **SC-012**: ≥40% of signups come from non-technical backgrounds (validates personalization value)

---

## Technical Architecture

### System Components

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Docusaurus)                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ContentModeTabs Component (src/components/)                │  │
│  │ - State: activeMode, isAuthenticated, userProfile          │  │
│  │ - Renders: [Original] [Summary] [Personalized] tabs       │  │
│  │ - Handles: tab clicks, auth checks, loading states         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ AuthModal Component (src/components/)                      │  │
│  │ - Signup form (email, password, professional background)   │  │
│  │ - Login form (email, password)                             │  │
│  │ - Password reset flow                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                          ↓ HTTP Requests (fetch API)
┌──────────────────────────────────────────────────────────────────┐
│  API LAYER (Vercel Serverless Functions - /api/)                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/auth/signup.ts                                        │  │
│  │ - Validates email/password                                 │  │
│  │ - Hashes password (bcrypt, cost 12)                        │  │
│  │ - Creates user in database                                 │  │
│  │ - Issues JWT token (httpOnly cookie)                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/auth/login.ts                                         │  │
│  │ - Validates credentials                                    │  │
│  │ - Issues JWT token                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /api/content/generate.ts                                   │  │
│  │ - Checks auth (JWT validation)                             │  │
│  │ - Checks cache (Redis or Vercel KV)                        │  │
│  │ - Calls AI generation if cache miss                        │  │
│  │ - Stores result in cache                                   │  │
│  │ - Returns content to frontend                              │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                          ↓ AI Generation Requests
┌──────────────────────────────────────────────────────────────────┐
│  AI LAYER (Google Gemini API)                                    │
│  - Model: gemini-2.5-flash-lite (existing in agent.ts)          │
│  - Temperature: 0.7 (balance creativity & consistency)           │
│  - Max tokens: 4096                                              │
│  - Prompt templates: Summary vs Personalized modes               │
└──────────────────────────────────────────────────────────────────┘
                          ↓ Store/Retrieve
┌──────────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Vercel Postgres (users table)                              │  │
│  │ - Schema: id, email, password_hash, professional_bg, ...   │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Vercel KV (Redis) - Content Cache                          │  │
│  │ - Key format: content:{lesson_path}:{mode}:{bg_hash}       │  │
│  │ - TTL: 7 days (604800 seconds)                             │  │
│  │ - Max size: 100MB per lesson (safety limit)                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow: Generate Summary Content

```
1. User clicks "Summary" tab
   └─> Frontend checks: isAuthenticated?
       ├─> NO → Show signup modal
       └─> YES → Continue

2. Frontend makes request:
   POST /api/content/generate
   {
     "lessonPath": "docs/06-AI-Native/35-intro/01-lesson-1.md",
     "mode": "summary",
     "professionalBackground": null // Not needed for summary
   }

3. API validates JWT token
   └─> Invalid → 401 Unauthorized
   └─> Valid → Continue

4. API generates cache key:
   "content:docs/06-AI-Native/35-intro/01-lesson-1.md:summary:v1"

5. API checks Vercel KV (Redis)
   ├─> CACHE HIT → Return cached content (200ms)
   └─> CACHE MISS → Continue

6. API reads Original content from filesystem
   └─> Markdown file at lesson path

7. API calls Gemini API with Summary prompt:
   """
   TASK: Condense this lesson to 30-50% length.
   PRESERVE: Learning objectives, key concepts, "Try With AI" prompts
   REMOVE: Extended explanations, redundant examples

   [ORIGINAL CONTENT]
   """

8. Gemini returns Summary content (3-6 seconds)

9. API validates result:
   ├─> Length check (30-50% of Original?)
   ├─> Markdown validation (valid syntax?)
   └─> "Try With AI" preservation (all prompts present?)

10. API stores in Vercel KV:
    SET key="content:..." value=summary_markdown TTL=604800

11. API returns to frontend:
    {
      "content": "# Summary...",
      "cached": false,
      "generatedAt": "2025-11-17T10:30:00Z"
    }

12. Frontend renders Summary content
    └─> User sees condensed version
```

---

## Technology Stack (Leveraging Existing Infrastructure)

**Frontend**
- **React 19** (already in package.json)
- **Docusaurus 3.9.2** (existing static site generator)
- **TypeScript 5.6.2** (strict mode enabled)
- **New components needed**:
  - `ContentModeTabs.tsx` (tab switcher)
  - `AuthModal.tsx` (signup/login modal)
  - `LoadingSkeleton.tsx` (content loading state)

**Backend**
- **Vercel Serverless Functions** (existing `/api/agent.ts` pattern)
- **New API endpoints**:
  - `/api/auth/signup.ts`
  - `/api/auth/login.ts`
  - `/api/content/generate.ts`
  - `/api/user/profile.ts` (get/update professional background)

**AI/ML**
- **Google Gemini API** (existing integration in `agent.ts`)
- **Model**: `gemini-2.5-flash-lite` (free tier: 15 req/min, 1500/day)
- **Cost optimization**: Aggressive caching reduces API calls by 80%+

**Database**
- **Vercel Postgres** (recommended for production)
  - Free tier: 256MB storage, 60 hours compute/month
  - Upgrade path: $20/month for 512MB + 100 hours
- **Alternative**: Supabase (free tier: 500MB + auth built-in)

**Caching**
- **Vercel KV** (Redis-compatible, serverless)
  - Free tier: 256MB storage, 100k commands/month
  - TTL: 7 days for generated content
- **Fallback**: localStorage (client-side, 5MB limit)

**Authentication**
- **JWT** (JSON Web Tokens)
  - Library: `jsonwebtoken` (Node.js)
  - Storage: httpOnly cookies (XSS protection)
  - Expiry: 30 days (refresh token pattern)
- **Password hashing**: bcrypt (cost factor 12)

**Monitoring**
- **Vercel Analytics** (built-in, free)
- **Sentry** (error tracking) - free tier: 5k events/month
- **PostHog** (product analytics) - free tier: 1M events/month

---

## Security Considerations

**Authentication**
- ✅ Passwords hashed with bcrypt (cost 12, industry standard)
- ✅ JWT tokens in httpOnly cookies (prevents XSS theft)
- ✅ HTTPS enforced in production (Vercel automatic)
- ✅ Rate limiting on auth endpoints (max 5 login attempts/minute)

**Input Validation**
- ✅ Email validation (regex + DNS check)
- ✅ Password strength (min 8 chars, optional: complexity requirements)
- ✅ SQL injection prevention (parameterized queries via Vercel Postgres SDK)
- ✅ XSS prevention (React auto-escapes, sanitize markdown output)

**API Security**
- ✅ CORS configured (Vercel domain only)
- ✅ Rate limiting (10 req/min per user, 1000 req/day per IP)
- ✅ API keys in environment variables (never committed to Git)
- ✅ Request size limits (max 1MB payload)

**Data Privacy**
- ✅ No PII in cache keys (use hashed values)
- ✅ User data encrypted at rest (Vercel Postgres default)
- ✅ Audit logs for auth events (who logged in when)
- ✅ GDPR-compliant (user can delete account + data)

---

## Open Questions / Decisions Needed

### Q1: Database Choice (Decision Required)

**Options**:

**Option A: Vercel Postgres** (Recommended)
- ✅ Native Vercel integration (zero config)
- ✅ Free tier sufficient for MVP (256MB, 60 hours/month)
- ✅ Automatic backups and scaling
- ❌ Vendor lock-in (Vercel-specific)

**Option B: Supabase**
- ✅ Built-in auth (reduces code complexity)
- ✅ Real-time subscriptions (future feature: live updates)
- ✅ Open-source (can self-host later)
- ❌ Extra service to manage (outside Vercel)

**Recommendation**: **Option A (Vercel Postgres)** for MVP simplicity. Can migrate to Supabase later if needed.

---

### Q2: Professional Background Options (Input Needed)

**Proposed list** (8 options for signup dropdown):

1. Software Developer / Engineer (technical baseline)
2. Business / Management / Entrepreneur
3. Accountant / Finance Professional
4. Healthcare Professional (Doctor, Nurse, etc.)
5. Education / Teacher / Professor
6. Designer / Creative Professional
7. Legal / Compliance / Lawyer
8. Other: [Free text input]

**Question**: Are these categories sufficient? Should we add more (e.g., Marketing, Sales, Student)?

---

### Q3: Cache Invalidation Strategy (Decision Required)

**When Original content is updated** (e.g., lesson is revised), we need to invalidate cached Summary/Personalized versions.

**Options**:

**Option A: Version-based cache keys**
- Cache key format: `content:{lesson_path}:{mode}:{version_hash}`
- When lesson is updated, increment version → new cache key → old cache expires naturally

**Option B: Manual invalidation API**
- Admin endpoint: `POST /api/cache/invalidate` with lesson path
- Called manually or via CI/CD after content updates

**Option C: TTL-only (no manual invalidation)**
- Cache expires after 7 days automatically
- Simplest approach, but stale content for up to 7 days

**Recommendation**: **Option A (version-based)** for accuracy + automatic invalidation.

---

### Q4: Free vs Freemium Model (Future Decision)

**For MVP**: All features are FREE after signup (email only, no payment).

**Future options** (Month 3+ decision):

- **Premium Tier** ($5-10/month):
  - Unlimited AI interactions (free tier: 20 interactions/day)
  - Download PDF summaries
  - Team features (share notes, progress tracking)
  - Advanced personalization (industry-specific case studies)

- **Enterprise Tier** ($50-100/month):
  - Company-wide dashboards
  - Custom branding
  - API access
  - Dedicated support

**Question**: Should we design architecture with paid tiers in mind from day 1? (Recommendation: Yes, add `subscription_tier` field to users table)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **AI generation costs exceed budget** | High | Medium | Aggressive caching (80% hit rate target), rate limiting (10 req/min), free tier limits (1500 req/day) |
| **Generated content loses critical info** | High | Low | Validation prompts (check for "Try With AI" preservation), manual spot-checks (10% sample), user feedback loop |
| **Slow generation impacts UX** | Medium | Medium | Lazy loading (generate on tab click, not page load), loading skeletons, cache-first strategy (<200ms for hits) |
| **Low signup conversion** | Medium | Medium | A/B test signup modal copy, reduce friction (social login in v2), incentivize (badges, progress tracking) |
| **Security vulnerability (auth bypass)** | Critical | Low | Security audit before launch, JWT best practices, rate limiting, input validation, Sentry monitoring |
| **Database scaling costs** | Medium | Low | Start with free tier (256MB Vercel Postgres), monitor growth, optimize queries, upgrade only if needed ($20/month) |
| **Poor personalization quality** | Medium | Medium | Iterate on AI prompts, collect user feedback (thumbs up/down), A/B test different professional backgrounds |

---

## Implementation Phases

### Phase 1: Authentication Foundation (Week 1)
**Goal**: Secure signup/login system

- [ ] Set up Vercel Postgres database
- [ ] Create users table schema
- [ ] Implement `/api/auth/signup.ts` (email, password, professional background)
- [ ] Implement `/api/auth/login.ts` (JWT issuance)
- [ ] Build `AuthModal` React component
- [ ] Add JWT validation middleware
- [ ] Write tests (unit: password hashing, integration: signup flow)
- [ ] Security audit (SQL injection, XSS, CSRF checks)

**Success Criteria**: User can signup → login → receive JWT token → access protected routes

---

### Phase 2: Summary Mode (Week 2)
**Goal**: AI-generated summaries with caching

- [ ] Implement `/api/content/generate.ts` (Summary mode only)
- [ ] Integrate Gemini API (reuse `agent.ts` pattern)
- [ ] Create Summary prompt template
- [ ] Set up Vercel KV (Redis) for caching
- [ ] Build `ContentModeTabs` React component (Original + Summary tabs only)
- [ ] Add loading states and error handling
- [ ] Write tests (E2E: user clicks Summary → sees condensed content in <8s)
- [ ] Validate Summary length (30-50% of Original, automated check)

**Success Criteria**: Authenticated user clicks Summary tab → sees AI-generated summary in <8 seconds (first-time) or <200ms (cached)

---

### Phase 3: Personalization (Week 3)
**Goal**: Context-aware content adaptation

- [ ] Extend `/api/content/generate.ts` (add Personalized mode)
- [ ] Create 8 Personalized prompt templates (one per professional background)
- [ ] Add "Personalized" tab to `ContentModeTabs` component
- [ ] Implement cache keying by professional background
- [ ] Add user profile page (update professional background)
- [ ] Write tests (manual: verify finance analogies for accountants, medical analogies for healthcare)
- [ ] Collect feedback (thumbs up/down on Personalized content)

**Success Criteria**: Accountant user sees finance analogies, healthcare professional sees medical analogies

---

### Phase 4: Polish & Launch (Week 4)
**Goal**: Production-ready, monitored, documented

- [ ] Mobile responsive design (test on 375px, 768px, 1024px)
- [ ] Tab preference persistence (localStorage + user profile sync)
- [ ] Set up monitoring (Sentry for errors, PostHog for analytics)
- [ ] Add rate limiting (10 req/min, 1000 req/day)
- [ ] Performance optimization (lazy loading, image compression)
- [ ] Write documentation (API docs, deployment guide, user guide)
- [ ] Conduct security review (penetration testing, OWASP Top 10 checks)
- [ ] Soft launch (20% rollout via feature flag)
- [ ] Monitor metrics (engagement, errors, performance)
- [ ] Full launch (100% rollout)

**Success Criteria**: Zero critical bugs, 40% tab usage, <8s generation time, <$50/month costs

---

## Monitoring & Analytics

### Key Metrics to Track

**Engagement**
- Tab clicks per user (Original vs Summary vs Personalized)
- Time spent in each mode
- Conversion rate (anonymous → signup)
- Retention (users who return after 7 days)

**Performance**
- Content generation time (p50, p95, p99)
- Cache hit rate (target: 80%+)
- API error rate (target: <1%)
- Page load time impact (should not increase)

**Quality**
- Summary length accuracy (30-50% of Original)
- User satisfaction ratings (thumbs up/down)
- Feedback submissions (qualitative insights)

**Costs**
- Gemini API usage (requests/day, cost/month)
- Vercel KV storage (MB used, commands/month)
- Database queries (hours compute/month)

### Alerts

- ⚠️ Error rate >5% for 5 minutes → Slack alert
- ⚠️ Generation time >10s (p95) → Performance investigation
- ⚠️ Cache hit rate <60% → Caching review
- ⚠️ Signup failures >10% → Auth flow debug

---

## Success Definition

**This MVP is successful if** (3 months post-launch):

1. ✅ **500+ signups** (validates demand)
2. ✅ **40%+ tab usage** (users find value in alternatives to Original)
3. ✅ **4.0/5.0 user satisfaction** (Summary and Personalized modes are useful)
4. ✅ **Zero critical security incidents** (auth system is secure)
5. ✅ **<$50/month operating costs** (caching works, free tiers sufficient)
6. ✅ **80%+ cache hit rate** (validates performance optimization)
7. ✅ **40%+ non-technical signups** (personalization unlocks new audience)

**Next steps after success**:
- Add social login (Google, GitHub)
- Introduce freemium tier (paid features)
- Build mobile app (React Native)
- Add collaborative features (team notes, progress sharing)

---

## Appendix: AI Prompt Templates

### Summary Mode Prompt

```
You are generating a SUMMARY version of a lesson from "AI Native Software Development: Colearning Agentic AI with Python and TypeScript".

TASK: Condense the following lesson to 30-50% of its original length while preserving:
- All learning objectives (verbatim)
- Key concepts and definitions (simplified if possible)
- At least 1 representative code example per major concept
- ALL "Try With AI" prompts (these are critical for hands-on practice)
- Critical warnings, notes, and best practices

REMOVE:
- Extended explanations and analogies (keep only essential context)
- Redundant examples (keep the clearest one)
- Detailed walkthroughs (condense to essential steps)
- Background context that isn't directly required to understand the core concept

TARGET AUDIENCE: Readers who have already read the Original lesson and need quick review/refresh before moving to the next chapter.

WRITING STYLE: Concise, technical, bullet-point friendly. Use active voice. Assume reader has basic context.

VALIDATION:
- Final output must be 30-50% the length of the original (character count)
- All markdown formatting must be preserved (headings, code blocks, links, images)
- All "Try With AI" sections must be present (search for "💬" or "Try with AI" markers)

ORIGINAL LESSON:
{original_content}

Generate the summary in markdown format, maintaining the same heading structure but condensing body text.
```

---

### Personalized Mode Prompt (Accountant Example)

```
You are adapting a lesson for a PROFESSIONAL ACCOUNTANT learning AI-native software development.

TASK: Rewrite the following lesson to make it accessible and relevant for someone with accounting/finance background but limited programming experience.

READER PROFILE:
- Professional: Accountant, Finance Analyst, or CPA
- Motivation: Automate financial workflows, build data analysis tools, understand AI for finance
- Strengths: Excel expert, understands data structures (tables, formulas), logical thinker
- Weaknesses: No programming background, unfamiliar with technical jargon, may fear "coding is hard"

ADAPTATION STRATEGY:
1. **Replace jargon with finance analogies**:
   - Variables → "Like account names in your ledger"
   - Functions → "Like Excel formulas that you can reuse"
   - Loops → "Like running the same calculation for every row in a spreadsheet"
   - APIs → "Like data feeds from your bank into QuickBooks"
   - Databases → "Like a digital filing cabinet for financial records"

2. **Use finance-specific examples**:
   - Instead of generic "user" data, use: invoice records, ledger entries, tax calculations
   - Code examples should involve: revenue calculations, expense tracking, financial reports
   - "Try With AI" prompts should reference: "Build a tax calculator", "Automate invoice processing"

3. **Simplify technical concepts**:
   - Avoid: "instantiate a class object"
   - Use: "create a new record (like adding a new account to your chart of accounts)"
   - Break down complex ideas into step-by-step instructions (like accounting procedures)

4. **Maintain confidence-building tone**:
   - Acknowledge: "This may feel unfamiliar, but you already do similar thinking in Excel"
   - Encourage: "If you can build an Excel formula, you can write Python code"
   - Reassure: "AI will help you with syntax—focus on understanding the logic"

PRESERVE:
- All "Try With AI" prompts (but adapt examples to finance context)
- Code examples (but add comments explaining each line in finance terms)
- Learning objectives (but reframe for finance professionals)

ORIGINAL LESSON:
{original_content}

Generate the personalized version in markdown format. Use a warm, supportive tone. Make technical concepts feel approachable.
```

---

**Similar templates exist for**:
- Healthcare Professional (medical analogies)
- Business Owner (ROI/business value framing)
- Teacher (education analogies)
- Designer (visual/creative analogies)
- Software Developer (concise, technical, no simplification)

---

## Next Steps

**After Spec Approval**:
1. ✅ Create architectural decision records (ADRs) for database choice, auth strategy
2. ✅ Generate implementation plan (`/sp.plan`)
3. ✅ Break down into tasks (`/sp.tasks`)
4. ✅ Begin Phase 1 implementation (Authentication)

**Review Requested**:
- [ ] Senior developer review (architecture, security)
- [ ] Product manager review (user stories, success criteria)
- [ ] Designer review (UI/UX mockups needed?)

---

**Prepared by**: Irfan (Junior Developer)
**Review Due**: [Set deadline with team]
**Questions/Feedback**: [Slack channel or email]
