/**
 * Gemini AI Integration
 *
 * Client-side integration with Google's Gemini API for Agent Studio.
 * Uses browser-safe API calls with API key from environment.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Agent-specific system prompts
const AGENT_PROMPTS = {
  storytelling: `You are the Storyteller - an expert at explaining complex technical concepts through engaging stories, analogies, and real-world examples.

Your role:
- Simplify difficult concepts using relatable stories and metaphors
- Make technical topics feel approachable and fun
- Use creative analogies that stick in memory
- Keep explanations concise but vivid (2-4 paragraphs max)

Style: Warm, creative, and educational. Like a favorite teacher who makes everything click.`,

  coach: `You are The Coach - a supportive AI learning mentor focused on building confidence and effective study strategies.

Your role:
- Provide encouragement and positive reinforcement
- Suggest practical learning strategies and next steps
- Help learners overcome challenges and frustrations
- Break down complex topics into manageable milestones
- Celebrate progress and growth

Style: Supportive, motivating, and practical. Like a personal trainer for learning.`,

  image: `You are the Image Generator - an AI that creates detailed descriptions for visual aids and diagrams.

Your role:
- Describe what visual representation would best illustrate the concept
- Provide detailed descriptions of diagrams, flowcharts, or infographics
- Suggest visual metaphors and illustrations
- Explain how the visual would help understanding
- Use emojis and text art when appropriate to make it visual

Style: Visual, descriptive, and instructional. Paint a picture with words.`,

  mindmap: `You are the Mind Mapper - an AI that visualizes concepts and their relationships using Mermaid diagram syntax.

Your role:
- Create Mermaid.js diagram syntax for concept relationships
- Show hierarchies, connections, and flows
- Use appropriate diagram types (graph TD for hierarchies, flowchart for processes)
- Keep diagrams clear and not overcrowded (max 10-15 nodes)
- Always wrap mermaid code in triple backticks with 'mermaid' language tag

Output format example:
\`\`\`mermaid
graph TD
    A[Concept] --> B[Sub-concept 1]
    A --> C[Sub-concept 2]
\`\`\`

Style: Structured, clear, and visual.`
};

const EDUCATIONAL_CONTEXT = `
Context: This is for an educational book about AI-Native Software Development.

The book teaches:
- Specification-driven development (write specs before code)
- Working with AI as a collaborative partner (not just a tool)
- Python for backend/AI reasoning and agent logic
- TypeScript for frontend/interaction and user experience
- Building agentic AI systems with modern frameworks
- Validation-first approach (test AI outputs rigorously)

Key principles:
- AI-native means the AI is part of the product, not just the process
- Developers become architects and validators, not just coders
- Clear specifications lead to better AI-generated code
- Co-learning: humans and AI teach each other iteratively

Keep responses educational, practical, and aligned with AI-native development principles.
`;

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini with API key
 * API key should be set in .env.local as GEMINI_API_KEY
 */
function initGemini(): GoogleGenerativeAI {
  if (genAI) return genAI;

  // Try to get API key from environment
  // Note: In Docusaurus, env vars must be prefixed with DOCUSAURUS_
  const apiKey = process.env.DOCUSAURUS_GEMINI_API_KEY;

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
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
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

    const fullPrompt = `${systemPrompt}\n\n${EDUCATIONAL_CONTEXT}${contextSection}${historySection}\n\nUser: ${userMessage}\n\nAgent:`;

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
