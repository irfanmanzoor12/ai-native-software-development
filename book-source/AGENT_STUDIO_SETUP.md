# Agent Studio Setup Guide

## 🚀 Quick Start

Agent Studio is an AI-powered learning assistant integrated into your Docusaurus book. It provides 4 specialized AI agents to help learners understand concepts better.

### Prerequisites

- Node.js 20+ installed
- Free Google Gemini API key

---

## 📋 Step 1: Get Your Free Gemini API Key

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key

**Note:** The free tier includes:
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ No credit card required

---

## 🔧 Step 2: Configure Your Environment

### Option A: Local Development (Recommended)

1. Navigate to the `book-source` directory:
   ```bash
   cd book-source
   ```

2. Create a `.env.local` file:
   ```bash
   # On Windows:
   copy .env.example .env.local

   # On Mac/Linux:
   cp .env.example .env.local
   ```

3. Edit `.env.local` and add your API key:
   ```
   DOCUSAURUS_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

### Option B: Production Deployment

For production (Vercel, Netlify, etc.), add the environment variable in your hosting platform:

**Variable name:** `DOCUSAURUS_GEMINI_API_KEY`
**Value:** Your Gemini API key

---

## 📦 Step 3: Install Dependencies

From the `book-source` directory:

```bash
npm install
```

This will install the Google Generative AI SDK and other required packages.

---

## 🎮 Step 4: Start the Development Server

```bash
npm start
```

The site will open at `http://localhost:3000`

---

## ✅ Step 5: Test Agent Studio

1. Navigate to any page (e.g., `/docs/preface-agent-native`)
2. Look for the **"Agent Studio"** button in the bottom-right corner
3. Click it to open the chat interface
4. Select an agent:
   - 📖 **Storyteller** - Explains concepts through stories
   - 🎯 **The Coach** - Provides learning guidance
   - 🎨 **Image Generator** - Creates visual descriptions
   - 🧠 **Mind Mapper** - Generates concept diagrams
5. Ask a question!

---

## 🤖 The Four Agents

### 1. 📖 Storyteller
**Purpose:** Simplifies complex concepts through engaging stories and analogies.

**Best for:**
- Understanding difficult technical topics
- Making abstract concepts concrete
- Remembering key ideas through memorable stories

**Example questions:**
- "Explain specification-driven development using a story"
- "What's an analogy for AI agents?"
- "Tell me a story about how Python and TypeScript work together"

---

### 2. 🎯 The Coach
**Purpose:** Provides motivation, study strategies, and personalized learning guidance.

**Best for:**
- Overcoming learning challenges
- Getting study tips and next steps
- Building confidence in new topics
- Breaking down complex learning goals

**Example questions:**
- "I'm struggling with async/await in Python. How should I approach this?"
- "What's the best way to learn AI-native development?"
- "I feel overwhelmed by all these concepts. Where should I start?"

---

### 3. 🎨 Image Generator
**Purpose:** Creates detailed visual descriptions and diagrams (text-based currently).

**Best for:**
- Visualizing architecture and flows
- Understanding system relationships
- Creating mental models

**Example questions:**
- "Show me how AI-driven development workflow looks"
- "Visualize the relationship between specs, AI, and code"
- "What does a multi-agent system architecture look like?"

---

### 4. 🧠 Mind Mapper
**Purpose:** Generates Mermaid.js diagrams showing concept relationships.

**Best for:**
- Seeing the big picture
- Understanding hierarchies
- Mapping out learning paths

**Example questions:**
- "Create a mind map of AI-native development concepts"
- "Map out the Python ecosystem for AI agents"
- "Show me the relationships between specifications, validation, and implementation"

**Note:** The Mind Mapper outputs Mermaid.js syntax which renders as interactive diagrams!

---

## 🔧 Troubleshooting

### "API key not configured" Error

**Solution:**
1. Make sure `.env.local` exists in `book-source/`
2. Check that the variable is named exactly: `DOCUSAURUS_GEMINI_API_KEY`
3. Restart the dev server after creating/editing `.env.local`

### "Rate limit reached" Error

**Solution:**
- Free tier: 15 requests/minute, 1,500/day
- Wait a minute and try again
- Consider reducing conversation length

### Agent responses are slow

**Reason:** Gemini API typically responds in 1-3 seconds.

**Tips:**
- Keep questions focused and specific
- Break complex questions into smaller ones

### TypeScript/Build Errors

**Solution:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Docusaurus cache:
   ```bash
   npm run clear
   npm start
   ```

---

## 🎨 Customization

### Change Agent Colors

Edit `src/components/AgentStudio/AgentStudio.tsx`:

```typescript
const AGENTS: Agent[] = [
  {
    type: 'storytelling',
    color: '#FF6B6B',  // Change this hex color
    // ...
  },
  // ...
];
```

### Modify Agent Prompts

Edit `src/utils/gemini.ts` to customize how each agent responds:

```typescript
const AGENT_PROMPTS = {
  storytelling: `Your custom prompt here...`,
  // ...
};
```

### Adjust Position

Edit `src/components/AgentStudio/AgentStudio.css`:

```css
.agent-studio-button {
  bottom: 24px;  /* Distance from bottom */
  right: 24px;   /* Distance from right */
}
```

---

## 🔒 Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **API keys are client-side** - For local dev only
3. **Production:** Use server-side API proxy for better security
4. **Rate limiting:** Built into Gemini's free tier

---

## 📚 Learn More

- [Google Gemini API Docs](https://ai.google.dev/tutorials/web_quickstart)
- [Mermaid.js Diagrams](https://mermaid.js.org/)
- [Docusaurus Environment Variables](https://docusaurus.io/docs/deployment#using-environment-variables)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors (F12 → Console)
2. Verify your API key at: https://aistudio.google.com/app/apikey
3. Make sure you're running Node 20+: `node --version`
4. Try clearing cache: `npm run clear && npm start`

---

## 🎉 You're All Set!

Agent Studio is now ready to help your learners understand AI-native development concepts through interactive AI conversations!

**Pro tip:** Encourage learners to try different agents for the same question - each provides a unique perspective!
