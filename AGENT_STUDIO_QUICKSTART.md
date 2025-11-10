# 🤖 Agent Studio - Quick Start Guide

## ✅ What's Been Implemented

Your Agent Studio is now **fully functional** with Google Gemini AI integration!

### Features:
- ✅ Floating button in bottom-right corner
- ✅ 4 specialized AI agents (Storyteller, Coach, Image Generator, Mind Mapper)
- ✅ Real-time AI responses via Google Gemini API
- ✅ Context-aware (reads current page content)
- ✅ Conversation history for better responses
- ✅ Dark mode support
- ✅ Mobile responsive design

---

## 🚀 Setup (3 Steps - 2 Minutes)

### Step 1: Get Free API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 2: Add API Key

1. Open: `book-source/.env.local`
2. Replace `your_gemini_api_key_here` with your actual key:
   ```
   DOCUSAURUS_GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```
3. Save the file

### Step 3: Restart Dev Server

**Stop the current server (Ctrl+C), then:**

```bash
cd book-source
npm install
npm start
```

**That's it!** 🎉

---

## 🎮 How to Use

1. **Open your browser** to `http://localhost:3000/docs/preface-agent-native`
2. **Look for the purple "Agent Studio" button** (bottom-right corner)
3. **Click it** to open the chat
4. **Select an agent**:
   - 📖 **Storyteller** - Explains through stories
   - 🎯 **The Coach** - Provides learning guidance
   - 🎨 **Image Generator** - Creates visual descriptions
   - 🧠 **Mind Mapper** - Generates concept diagrams
5. **Ask a question!**

---

## 💡 Example Questions to Try

### For Storyteller 📖
- "Explain specification-driven development using a story"
- "What's an analogy for AI agents?"

### For The Coach 🎯
- "How should I approach learning AI-native development?"
- "I'm struggling with async Python. Help!"

### For Image Generator 🎨
- "Visualize the AI-driven development workflow"
- "Show me how specs, AI, and code connect"

### For Mind Mapper 🧠
- "Create a mind map of AI-native development"
- "Map out the Python ecosystem for AI agents"

---

## 📁 Files Created/Modified

### New Files:
```
book-source/
├── src/
│   ├── components/
│   │   └── AgentStudio/
│   │       ├── AgentStudio.tsx      ← Main component
│   │       ├── AgentStudio.css      ← Styling
│   │       └── index.ts             ← Export
│   ├── utils/
│   │   └── gemini.ts                ← Gemini AI integration
│   └── api/
│       └── agent.ts                 ← API utilities
├── .env.local                        ← Your API key (DO NOT COMMIT)
├── .env.example                      ← Template
└── AGENT_STUDIO_SETUP.md            ← Detailed docs
```

### Modified Files:
```
book-source/
├── package.json                      ← Added @google/generative-ai
└── src/theme/Root.tsx               ← Integrated AgentStudio
```

---

## 🎨 Agent Details

### 📖 Storyteller
**Specialty:** Explains complex concepts through engaging stories and analogies

**Personality:** Warm, creative, educational
**Best for:** Making difficult topics click through memorable stories

---

### 🎯 The Coach
**Specialty:** Provides encouragement, strategies, and learning guidance

**Personality:** Supportive, motivating, practical
**Best for:** Overcoming challenges, building confidence, getting actionable advice

---

### 🎨 Image Generator
**Specialty:** Creates detailed visual descriptions and text-based diagrams

**Personality:** Visual, descriptive, artistic
**Best for:** Understanding through visualization, mental models

---

### 🧠 Mind Mapper
**Specialty:** Generates Mermaid.js diagrams showing concept relationships

**Personality:** Structured, analytical, systematic
**Best for:** Seeing the big picture, understanding hierarchies

**Special:** Outputs render as interactive diagrams in the chat!

---

## 🔒 Security & Privacy

- ✅ API key stored locally (`.env.local` is in `.gitignore`)
- ✅ Never committed to git
- ✅ Free tier: 15 requests/min, 1,500/day
- ✅ No credit card required
- ⚠️ Client-side API calls (for dev only - use proxy in production)

---

## 🐛 Troubleshooting

### Agent Studio button doesn't appear
**Solution:**
1. Make sure dev server restarted after installing dependencies
2. Check browser console (F12) for errors
3. Try: `npm run clear && npm start`

### "API key not configured" error
**Solution:**
1. Verify `.env.local` exists in `book-source/` directory
2. Check variable name: `DOCUSAURUS_GEMINI_API_KEY` (exact match)
3. Restart dev server after editing `.env.local`

### "Rate limit reached" error
**Solution:**
- Free tier limit: 15 requests/minute
- Wait 60 seconds and try again

### Agents respond with "Error"
**Solution:**
1. Check API key is valid at: https://aistudio.google.com/app/apikey
2. Check browser console for detailed error
3. Verify you have internet connection

---

## 🎯 What's Next?

### Enhance Agent Capabilities:

1. **Add actual image generation** (Stable Diffusion API)
2. **Improve mind maps** (more complex diagram types)
3. **Add voice input** (speech-to-text)
4. **Export conversations** (save as PDF/markdown)
5. **Add more agents** (Code Reviewer, Quiz Master, etc.)

### Production Deployment:

When deploying to production:
1. Add `DOCUSAURUS_GEMINI_API_KEY` to your hosting platform (Vercel/Netlify)
2. Consider using a server-side proxy for better security
3. Implement rate limiting per user

---

## 📊 Free Tier Limits

| Resource | Limit |
|----------|-------|
| Requests/minute | 15 |
| Requests/day | 1,500 |
| Cost | **FREE** ✅ |
| Credit card | Not required |

**Upgrade if needed:** Google offers paid tiers with higher limits

---

## ✨ Tips for Best Results

1. **Be specific** - "Explain async/await in Python" vs "How does Python work?"
2. **Ask follow-ups** - Agents remember conversation history
3. **Try different agents** - Same question, different perspectives
4. **Use page context** - Agents automatically see what page you're on
5. **Keep it focused** - Shorter questions = faster, better responses

---

## 🎉 Success!

Your Agent Studio is live and ready to enhance the learning experience!

**Test it now:**
```bash
http://localhost:3000/docs/preface-agent-native
```

Look for the purple button in the bottom-right corner! 🚀

---

**Need detailed docs?** See: `book-source/AGENT_STUDIO_SETUP.md`

**Have questions?** Check the browser console or review the setup guide.
