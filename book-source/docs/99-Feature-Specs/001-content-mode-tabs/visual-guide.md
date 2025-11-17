---
title: "Visual Guide"
sidebar_position: 3
description: "UI mockups, architecture diagrams, and user flows"
---

# 🎨 Content Mode Tabs - Visual Guide

:::tip What You'll See Here
Visual mockups, architecture diagrams, data flows, and user journey maps to help you understand the feature at a glance.
:::

---

## 📱 UI Mockups

### Desktop View (Before)

```
┌────────────────────────────────────────────────────┐
│  CoLearning Python & AI                    [Login] │
├────────────────────────────────────────────────────┤
│                                                    │
│  Chapter 6: Introduction to AI Native Development │
│  ════════════════════════════════════════════════  │
│                                                    │
│  ## What is AI Native Development?                │
│                                                    │
│  AI native development is a paradigm where...     │
│  (full 2000 word lesson)                          │
│                                                    │
│  ### Try With AI                                  │
│  Ask your AI: "Explain how..."                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### Desktop View (After - New Tabs)

```
┌────────────────────────────────────────────────────┐
│  CoLearning Python & AI              [user@email]  │
├────────────────────────────────────────────────────┤
│                                                    │
│  Chapter 6: Introduction to AI Native Development │
│  ════════════════════════════════════════════════  │
│                                                    │
│  ┌──────────┬──────────┬──────────────┐           │
│  │ Original │ Summary  │ Personalized │  ← TABS   │
│  └──────────┴──────────┴──────────────┘           │
│                                                    │
│  ## What is AI Native Development?                │
│                                                    │
│  AI native development is a paradigm where...     │
│  (content changes based on active tab)            │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Tab States**:
- **Active tab**: Blue underline, bold text
- **Inactive tab**: Gray text, hover effect
- **Locked tab** (not logged in): 🔒 icon, shows signup modal on click

---

### Mobile View (375px width)

```
┌─────────────────────────┐
│  CoLearning Python      │
│  ☰                  👤  │
├─────────────────────────┤
│ Chapter 6: Intro to AI  │
│ ─────────────────────── │
│                         │
│ ┌─────────────────────┐ │
│ │     Original        │ │
│ ├─────────────────────┤ │
│ │     Summary     🔒  │ │
│ ├─────────────────────┤ │
│ │  Personalized   🔒  │ │
│ └─────────────────────┘ │
│                         │
│ ## AI Native Dev        │
│                         │
│ AI native development   │
│ is a paradigm...        │
│                         │
└─────────────────────────┘
```

**Mobile Design**:
- Tabs stack vertically (not horizontal)
- Each tab = 44px min height (touch-friendly)
- Locked tabs show 🔒 icon
- Tapping locked tab → signup modal

---

## 🔐 Signup Modal (Unauthenticated User)

```
┌──────────────────────────────────────────┐
│                                          │
│  🔓 Unlock Summary & Personalized Modes  │
│  ──────────────────────────────────────  │
│                                          │
│  Get AI-generated summaries and content  │
│  personalized to your background.        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Email                              │  │
│  │ ────────────────────────────────── │  │
│  │ you@example.com                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Password (min 8 characters)        │  │
│  │ ────────────────────────────────── │  │
│  │ ••••••••                           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Professional Background            │  │
│  │ ────────────────────────────────── │  │
│  │ [Select...] ▼                      │  │
│  │                                    │  │
│  │  • Software Developer              │  │
│  │  • Business/Management             │  │
│  │  • Accountant/Finance              │  │
│  │  • Healthcare Professional         │  │
│  │  • Teacher/Education               │  │
│  │  • Designer/Creative               │  │
│  │  • Legal/Compliance                │  │
│  │  • Other                           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │      Sign Up (Free Forever)        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Already have an account? [Log in]       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📊 System Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                       USER (Browser)                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Lesson Page                                        │  │
│  │  [Original] [Summary] [Personalized]                │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                          │
                          ↓ HTTP Request
┌───────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS FUNCTIONS                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  /api/content/generate.ts                           │  │
│  │  1. Validate JWT token                              │  │
│  │  2. Check cache (Vercel KV)                         │  │
│  │  3. Generate if cache miss (Gemini API)             │  │
│  │  4. Store in cache                                  │  │
│  │  5. Return content                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
         │                │                │
         ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌────────────────┐
│   Vercel     │  │ Vercel KV    │  │  Gemini API    │
│  Postgres    │  │  (Redis)     │  │ (Google Cloud) │
│              │  │              │  │                │
│ Users Table  │  │ Cache Store  │  │ AI Generation  │
│ - id         │  │ TTL: 7 days  │  │ Model: flash   │
│ - email      │  │              │  │ Temp: 0.7      │
│ - password   │  │ Key Format:  │  │                │
│ - prof_bg    │  │ content:     │  │ Cost:          │
│              │  │  {path}:     │  │ FREE (1500/day)│
│ FREE:        │  │  {mode}:     │  │                │
│ 256MB        │  │  {version}   │  │ With caching:  │
│ 60 hrs/mo    │  │              │  │ 80% reduced    │
└──────────────┘  └──────────────┘  └────────────────┘
```

---

## 🔄 Data Flow: User Clicks "Summary" Tab

```
Step 1: User Action
┌─────────────────────┐
│ User clicks         │
│ [Summary] tab       │
└─────────────────────┘
         ↓
Step 2: Auth Check
┌─────────────────────┐
│ Is user logged in?  │
│ (Check JWT cookie)  │
└─────────────────────┘
    │           │
    ↓ NO        ↓ YES
┌─────────┐    Continue
│ Show    │
│ Signup  │
│ Modal   │
└─────────┘
                ↓
Step 3: API Request
┌──────────────────────────────────┐
│ POST /api/content/generate       │
│ {                                │
│   lessonPath: "docs/...",        │
│   mode: "summary",               │
│   professionalBackground: null   │
│ }                                │
└──────────────────────────────────┘
                ↓
Step 4: Cache Check
┌──────────────────────────────────┐
│ Redis.get("content:path:summary")│
└──────────────────────────────────┘
    │                    │
    ↓ HIT                ↓ MISS
┌─────────────┐     ┌──────────────┐
│ Return      │     │ Generate     │
│ cached      │     │ with Gemini  │
│ (<200ms)    │     │ (3-6 sec)    │
└─────────────┘     └──────────────┘
                          │
                          ↓
                    ┌──────────────┐
                    │ Cache result │
                    │ TTL: 7 days  │
                    └──────────────┘
                          ↓
                    ┌──────────────┐
                    │ Return to    │
                    │ frontend     │
                    └──────────────┘
                          ↓
Step 5: Render
┌──────────────────────────────────┐
│ User sees summary content        │
│ (30-50% length of original)      │
└──────────────────────────────────┘
```

---

## 💬 AI Prompt Example: Summary Mode

**Input** (Original lesson, 2000 words):
```markdown
# Introduction to AI Native Development

AI native development is a paradigm shift where...
(15 paragraphs, 8 code examples, detailed explanations)
```

**AI Prompt**:
```
TASK: Condense to 30-50% length
PRESERVE: Learning objectives, "Try With AI" prompts, key concepts
REMOVE: Extended explanations, redundant examples
```

**Output** (Summary, 800 words):
```markdown
# Introduction to AI Native Development (Summary)

AI native development: paradigm where AI is core system capability.

Key concepts:
- Specification-first development
- AI as co-reasoning partner
- Validation-first safety

[1 representative code example]

Try With AI:
"Build a simple AI agent using OpenAI SDK"
```

---

## 💬 AI Prompt Example: Personalized Mode (Accountant)

**Input** (Original lesson about Python variables):
```markdown
# Variables and Data Types

Variables store data in memory. When you write `x = 5`,
Python allocates memory and assigns the value 5 to x.
```

**AI Prompt**:
```
TASK: Adapt for ACCOUNTANT
USE: Finance analogies
  - Variables → Ledger accounts
  - Functions → Excel formulas
  - Loops → Spreadsheet row operations
```

**Output** (Personalized for Accountant):
```markdown
# Variables and Data Types (For Finance Professionals)

Variables are like account names in your ledger. When you write
`revenue = 50000`, you're creating an account called "revenue"
and recording a balance of $50,000.

Just like you track:
- Cash: $10,000
- Accounts Receivable: $25,000

Python tracks:
- x: 10
- total_sales: 25000

Think of it as a digital chart of accounts!
```

---

## 📊 Performance Metrics Dashboard (Conceptual)

```
┌─────────────────────────────────────────────────────────┐
│  Content Mode Tabs - Analytics (Week 1)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📈 Engagement                                          │
│  ──────────────────────────────────────────────────     │
│  Total users:              1,234                        │
│  Signed up:                487 (39%)                    │
│  Used Summary:             302 (62% of signups)         │
│  Used Personalized:        195 (40% of signups)         │
│                                                         │
│  ⚡ Performance                                         │
│  ──────────────────────────────────────────────────     │
│  Cache hit rate:           82% ✅ (target: 80%)         │
│  Avg generation time:      5.2s ✅ (target: <8s)        │
│  P95 generation time:      7.8s ✅ (target: <8s)        │
│  API errors:               0.3% ✅ (target: <1%)        │
│                                                         │
│  💰 Costs                                               │
│  ──────────────────────────────────────────────────     │
│  Gemini API calls:         2,145 (80% cached)           │
│  Database queries:         12 hrs/60 hrs used           │
│  Cache storage:            45MB/256MB used              │
│  Total cost:               $8.50 ✅ (target: <$50)     │
│                                                         │
│  🎯 Quality                                             │
│  ──────────────────────────────────────────────────     │
│  Summary length accuracy:  94% (30-50% target)          │
│  User satisfaction:        4.2/5.0 ✅ (target: 4.0)    │
│  Thumbs up:                87%                          │
│  Thumbs down:              13%                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Checklist (Before Launch)

```
┌─────────────────────────────────────────────────────────┐
│  Security Audit Checklist                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [ ] Passwords hashed with bcrypt (cost 12)            │
│  [ ] JWT tokens in httpOnly cookies (XSS protection)   │
│  [ ] HTTPS enforced (Vercel automatic)                 │
│  [ ] Rate limiting (10 req/min per user)               │
│  [ ] Input validation (email, password strength)       │
│  [ ] SQL injection prevention (parameterized queries)  │
│  [ ] XSS prevention (React auto-escape + DOMPurify)    │
│  [ ] CORS configured (Vercel domain only)              │
│  [ ] API keys in env variables (never in Git)          │
│  [ ] Request size limits (max 1MB payload)             │
│  [ ] No PII in logs or cache keys                      │
│  [ ] User can delete account + data (GDPR)             │
│  [ ] Audit logs for auth events                        │
│  [ ] Penetration testing (OWASP Top 10)                │
│  [ ] Security headers (CSP, X-Frame-Options)           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 User Journey Map

```
┌──────────────────────────────────────────────────────────────┐
│  Journey 1: First-Time Visitor (Summary Mode)               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. [Landing] User reads Chapter 5 in Original mode          │
│     │                                                        │
│     ↓                                                        │
│  2. [Discovery] User notices [Summary] tab, clicks it        │
│     │                                                        │
│     ↓                                                        │
│  3. [Gate] Signup modal appears: "Unlock Summary Mode"       │
│     │                                                        │
│     ↓                                                        │
│  4. [Signup] User enters email, password, selects            │
│     "Business/Management" as background                      │
│     │                                                        │
│     ↓                                                        │
│  5. [Success] Account created, auto-logged-in (2 seconds)    │
│     │                                                        │
│     ↓                                                        │
│  6. [Generation] Summary generates (6 seconds)               │
│     - Loading skeleton shows during generation              │
│     │                                                        │
│     ↓                                                        │
│  7. [Result] User sees condensed summary (800 words)         │
│     - Reads in 3 minutes vs 10 minutes for original         │
│     │                                                        │
│     ↓                                                        │
│  8. [Retention] User navigates to Chapter 6                  │
│     - Summary tab auto-selected (preference persisted)      │
│     - Content loads instantly (cached)                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Journey 2: Accountant (Personalized Mode)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. [Context] Accountant wants to learn Python for          │
│     automating financial reports                            │
│     │                                                        │
│     ↓                                                        │
│  2. [Signup] During signup, selects "Accountant/Finance"     │
│     │                                                        │
│     ↓                                                        │
│  3. [First Lesson] Opens "Variables and Data Types"          │
│     - Sees [Personalized] tab                               │
│     │                                                        │
│     ↓                                                        │
│  4. [Click] Clicks Personalized tab                          │
│     │                                                        │
│     ↓                                                        │
│  5. [Generation] AI adapts content with finance analogies    │
│     - "Variables are like ledger accounts"                  │
│     - Code examples use: revenue, expenses, tax_rate        │
│     │                                                        │
│     ↓                                                        │
│  6. [Aha Moment] "Oh! This is just like Excel formulas!"     │
│     - Technical jargon → Familiar finance terms             │
│     │                                                        │
│     ↓                                                        │
│  7. [Engagement] Completes 5 lessons (would have quit        │
│     after 1 with original technical version)                │
│     │                                                        │
│     ↓                                                        │
│  8. [Feedback] Gives thumbs up 👍 on personalized content    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme & Branding

```
Tab States:

┌────────────┬────────────┬──────────────┐
│ ⚪ ACTIVE  │ ⚫ INACTIVE│ 🔒 LOCKED     │
├────────────┼────────────┼──────────────┤
│ Color:     │ Color:     │ Color:       │
│ #2563eb    │ #6b7280    │ #9ca3af      │
│ (Blue 600) │ (Gray 500) │ (Gray 400)   │
│            │            │              │
│ Font:      │ Font:      │ Font:        │
│ Bold       │ Normal     │ Normal       │
│            │            │              │
│ Border:    │ Border:    │ Border:      │
│ 2px bottom │ None       │ None         │
│            │            │              │
│ Cursor:    │ Cursor:    │ Cursor:      │
│ Default    │ Pointer    │ Pointer      │
└────────────┴────────────┴──────────────┘
```

---

## 📊 A/B Test Ideas (Post-Launch)

```
Test 1: Signup Modal Copy
─────────────────────────
Variant A (Control):
  "Unlock Summary & Personalized Modes"

Variant B:
  "Get Your Personalized Learning Experience"

Metric: Signup conversion rate
Target: >5% improvement

─────────────────────────

Test 2: Default Tab for Returning Users
────────────────────────────────────────
Variant A (Control):
  Always default to Original

Variant B:
  Default to user's last-used tab

Metric: Time on page, retention
Target: >10% increase in engagement

─────────────────────────

Test 3: Summary Length
──────────────────────
Variant A (Control):
  30-50% of original

Variant B:
  20-30% of original (more aggressive)

Metric: User satisfaction, completion rate
Target: Maintain 4.0/5.0 rating
```

---

**This visual guide helps your team understand the feature at a glance!** 🎨
