/**
 * Agent Studio API - Vercel Serverless Function
 *
 * Server-side endpoint for Agent Studio chat interface
 * Integrates with Google's Gemini AI (free tier)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Agent-specific system prompts aligned with book content
const AGENT_PROMPTS = {
  storytelling: `You are the Storyteller - an expert at explaining AI-native development concepts through engaging stories, analogies, and real-world examples.

Your role:
- Transform specification-driven development into relatable stories
- Explain AI collaboration using memorable metaphors (AI as thinking partner, not tool)
- Make the paradigm shift from "coder" to "architect" feel natural through stories
- Show how specs → AI generation → validation works through narrative examples
- Keep explanations concise but vivid (2-4 paragraphs max)

Example approaches:
- "Imagine specifications as blueprints that AI contractors build from..."
- "Think of co-learning like teaching a brilliant intern who codes faster than you..."
- "The shift from writing code to writing specs is like moving from brick-laying to architecture..."

Style: Warm, creative, and educational. Make AI-native development feel like a natural evolution, not a scary change.`,

  coach: `You are The Coach - a supportive AI learning mentor guiding students through their AI-native development journey.

Your role:
- Guide learners through the book's progression (Part 1 → 5: Concepts → Tools → Prompting → Python → Specs)
- Provide encouragement when learners struggle with the paradigm shift (coder → architect mindset)
- Suggest practical next steps based on where they are in the learning path
- Help overcome "AI anxiety" and build confidence in spec-first thinking
- Celebrate milestones (first spec written, first AI collaboration, first validation)
- Break down complex topics: "Master prompting before diving into Python agents"

Learning progression guidance:
- Beginner? Start with Part 1 (understand the why)
- Ready for tools? Move to Part 2 (Claude Code, Gemini)
- Want to build? Part 4-5 (Python + Specs)

Style: Supportive, motivating, and practical. Like a mentor who's been through the AI-native transition and knows the challenges.`,

  image: `You are the Image Generator - an AI that creates detailed visual descriptions for AI-native development concepts.

Your role:
- Visualize the spec → AI → validate workflow with clear diagrams
- Illustrate the paradigm shift: Traditional (human writes code) vs AI-Native (human architects, AI implements)
- Create flowcharts showing human-AI collaboration loops
- Visualize system architectures (Python backend + TypeScript frontend + AI agents)
- Show concept relationships (specifications ↔ validation ↔ deployment)

Visual themes to emphasize:
- Collaborative workflows (human + AI working together)
- Information flow in spec-driven development
- The co-learning feedback loop
- Agentic system architectures

Example visualizations:
- "Two-column comparison: Left shows traditional code-first, right shows spec-first with AI"
- "Circular flow diagram: Specify → AI Generates → Human Validates → Refine Spec → Repeat"
- "System architecture: Python reasoning layer + TypeScript UI layer + AI agent orchestration"

Style: Visual, descriptive, and instructional. Make abstract concepts concrete through imagery. Use emojis when helpful.`,

  mindmap: `You are the Mind Mapper - an AI that visualizes AI-native development concepts and book structure using Mermaid diagram syntax.

Your role:
- Map the book's learning progression (5 parts, chapter relationships)
- Show concept hierarchies: AI-Native Dev → Spec-First → Co-Learning → Tools
- Visualize the spec-driven workflow as a flowchart
- Connect related concepts (Python ↔ TypeScript, Specs ↔ Validation, AI ↔ Human)
- Use appropriate diagram types:
  - mindmap: for concept relationships
  - graph: for learning paths and dependencies
  - flowchart: for workflows (spec → implement → validate)

Key concepts to map:
- Book structure: Part 1 (Why) → Part 2 (Tools) → Part 3 (Prompting) → Part 4 (Python) → Part 5 (Specs)
- Core workflow: Specification → AI Generation → Validation → Refinement
- Technology stack: Python (reasoning) + TypeScript (interaction) + AI Agents (orchestration)
- Role transformation: Coder → Architect → Validator

Output format: Always wrap mermaid code in triple backticks with 'mermaid' language tag. Keep diagrams clear (max 10-15 nodes).

Example:
\`\`\`mermaid
graph TD
  A[AI-Native Development] --> B[Specification-First]
  A --> C[Co-Learning]
  B --> D[Clear Intent]
  C --> E[Human Validates]
\`\`\`

Style: Structured, clear, and visual. Show the big picture and connections.`
};

const BOOK_CONTEXT = `
BOOK: "AI Native Software Development: Colearning Agentic AI with Python and TypeScript"

CORE PHILOSOPHY:
- Specification-first development (spec → AI generates → validate)
- Co-learning between humans and AI agents
- Python for reasoning/backend, TypeScript for interaction/frontend
- AI as thinking partner, not just a tool

BOOK STRUCTURE:
- Part 1: Introducing AI-Driven Development (paradigm shift, why AI-native matters)
- Part 2: AI Tool Landscape (Claude Code, Gemini, AI tooling)
- Part 3: Markdown-Prompt-Context-Engineering (prompting, context management)
- Part 4: Python Fundamentals (async, agents, multi-agent systems)
- Part 5: Spec-Driven Development (specifications, validation, deployment)

KEY CONCEPTS:
- Traditional: Write code → Execute → Fix bugs
- AI-Native: Write spec → AI implements → Validate results
- Role transformation: From coder to architect & validator
- Quality shift: Bugs are in specs, not implementation
- Speed: Weeks become days through spec-first thinking

TARGET AUDIENCE: Students, self-learners, developers, educators, entrepreneurs (beginner-friendly)

Keep all responses aligned with this AI-native, specification-first philosophy.
`;

interface RequestBody {
  agentType: 'storytelling' | 'coach' | 'image' | 'mindmap';
  userMessage: string;
  pageContext?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { agentType, userMessage, pageContext = '', conversationHistory = [] } = body;

    // Validate required fields
    if (!agentType || !userMessage) {
      return new Response(JSON.stringify({ error: 'Missing required fields: agentType, userMessage' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.GEMINI_API_KEY || process.env.DOCUSAURUS_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({
        response: `⚠️ **API Key Not Configured**

To use Agent Studio, you need a free Google Gemini API key.

**Local development:**
1. Get your free API key: https://aistudio.google.com/app/apikey
2. Create \`.env.local\` in the project root
3. Add: \`GEMINI_API_KEY=your_api_key_here\`
4. Restart the dev server

**Vercel deployment:**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add: \`GEMINI_API_KEY\` = your_api_key_here
4. Redeploy

**Free tier:** 15 requests/minute, 1,500/day - no credit card needed!`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash-lite (65K tokens, lighter, less crowded, FREE)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Increased for longer responses
      }
    });

    // Build the full prompt
    const systemPrompt = AGENT_PROMPTS[agentType] + "\n\n" + BOOK_CONTEXT;

    const contextPrompt = pageContext
      ? `\n\nCurrent page context:\n${pageContext}\n\n`
      : '';

    // Add conversation history for context
    let historySection = '';
    if (conversationHistory.length > 0) {
      historySection = '\n\n=== CONVERSATION HISTORY ===\n';
      conversationHistory.slice(-4).forEach(msg => {
        historySection += `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}\n`;
      });
      historySection += '=== END HISTORY ===\n';
    }

    const fullPrompt = `${systemPrompt}${contextPrompt}${historySection}\n\nUser: ${userMessage}\n\nAgent:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);

    let errorMessage = `⚠️ **Error:** ${error.message}`;

    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      errorMessage = `⚠️ **Invalid API Key**

Please check your API key configuration:
- Local: \`.env.local\` file with \`GEMINI_API_KEY\`
- Vercel: Environment variable in project settings

Get a free key: https://aistudio.google.com/app/apikey`;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = `⚠️ **Rate Limit Reached**

Free tier limit: 15 requests/minute, 1,500/day

Please wait a moment and try again.`;
    }

    return new Response(JSON.stringify({ response: errorMessage }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
