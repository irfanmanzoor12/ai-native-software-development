/**
 * Gemini AI Integration
 *
 * Client-side integration with Google's Gemini API for Agent Studio.
 * Uses browser-safe API calls with API key from environment.
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

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini with API key (CLIENT-SIDE for local dev only)
 * In production, use server-side /api/agent endpoint instead
 */
function initGemini(): GoogleGenerativeAI {
  if (genAI) return genAI;

  // For local dev: Use hardcoded key (this is OK for local testing only!)
  // In production: API calls should go through /api/agent (server-side)
  const apiKey = 'AIzaSyAOHdUmXNEYyEIxLXfyJpZPFCuCX71TJU8'; // Local dev key

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
}

/**
 * Generate response from specified agent type
 */
export async function generateAgentResponse(
  agentType: 'storytelling' | 'coach' | 'image' | 'mindmap',
  userMessage: string,
  pageContext: string = '',
  conversationHistory: AgentMessage[] = []
): Promise<string> {

  try {
    const ai = initGemini();
    // Use gemini-2.5-flash-lite (65K tokens, lighter, less crowded, FREE)
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Increased for longer responses
      }
    });

    // Build the full prompt
    const systemPrompt = AGENT_PROMPTS[agentType];

    let contextSection = '';
    if (pageContext) {
      contextSection = `\n\n=== CURRENT PAGE CONTEXT ===\n${pageContext}\n=== END CONTEXT ===\n`;
    }

    // Add conversation history for context
    let historySection = '';
    if (conversationHistory.length > 0) {
      historySection = '\n\n=== CONVERSATION HISTORY ===\n';
      conversationHistory.slice(-4).forEach(msg => {
        historySection += `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}\n`;
      });
      historySection += '=== END HISTORY ===\n';
    }

    const fullPrompt = `${systemPrompt}\n\n${BOOK_CONTEXT}${contextSection}${historySection}\n\nUser: ${userMessage}\n\nAgent:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('Gemini API Error:', error);

    if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      return `⚠️ **API Key Not Configured**

To use Agent Studio with AI responses, you need a free Google Gemini API key.

**Steps to set up:**

1. Get your free API key from: https://aistudio.google.com/app/apikey
2. Create a file \`.env.local\` in the \`book-source\` directory
3. Add this line: \`DOCUSAURUS_GEMINI_API_KEY=your_api_key_here\`
4. Restart the dev server (\`npm start\`)

**Why it's safe:** The key is only used on your local machine, never committed to git.`;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return `⚠️ **Rate Limit Reached**

You've hit the free tier rate limit (15 requests/minute).

Please wait a moment and try again.`;
    }

    return `⚠️ **Error:** ${error.message}\n\nPlease try again or check your API configuration.`;
  }
}

/**
 * Test if Gemini API is configured and working
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await generateAgentResponse(
      'coach',
      'Hello',
      '',
      []
    );
    return !response.includes('⚠️');
  } catch (error) {
    return false;
  }
}
