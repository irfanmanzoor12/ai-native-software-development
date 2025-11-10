/**
 * Agent Studio API - Gemini Integration
 *
 * This API route handles requests from the Agent Studio chat interface
 * and communicates with Google's Gemini AI to generate responses.
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

Note: Currently describe the image in detail. Future integration will generate actual images.

Style: Visual, descriptive, and instructional.`,

  mindmap: `You are the Mind Mapper - an AI that visualizes concepts and their relationships using Mermaid diagram syntax.

Your role:
- Create Mermaid.js diagram syntax for concept relationships
- Show hierarchies, connections, and flows
- Use appropriate diagram types (graph, flowchart, mindmap)
- Keep diagrams clear and not overcrowded (max 10-15 nodes)

Output format: Always include valid Mermaid.js syntax in a code block.

Style: Structured, clear, and visual.`
};

const EDUCATIONAL_CONTEXT = `
This is for an educational book about AI-Native Software Development. The book teaches:
- Specification-driven development (specs before code)
- Working with AI as a collaborative partner
- Python for backend/AI reasoning
- TypeScript for frontend/interaction
- Building AI agents and systems

Keep responses educational, practical, and aligned with AI-native development principles.
`;

export async function generateAgentResponse(
  agentType: 'storytelling' | 'coach' | 'image' | 'mindmap',
  userMessage: string,
  pageContext: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {

  // Get API key from environment
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "⚠️ API key not configured. Please add GEMINI_API_KEY to your environment variables.\n\n" +
           "Get your free API key from: https://aistudio.google.com/app/apikey";
  }

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the full prompt
    const systemPrompt = AGENT_PROMPTS[agentType] + "\n\n" + EDUCATIONAL_CONTEXT;

    const contextPrompt = pageContext
      ? `\n\nCurrent page context:\n${pageContext}\n\n`
      : '';

    const fullPrompt = `${systemPrompt}${contextPrompt}User question: ${userMessage}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('Gemini API Error:', error);

    if (error.message?.includes('API key')) {
      return "⚠️ Invalid API key. Please check your GEMINI_API_KEY environment variable.\n\n" +
             "Get a free API key from: https://aistudio.google.com/app/apikey";
    }

    return `⚠️ Sorry, I encountered an error: ${error.message}\n\nPlease try again.`;
  }
}

// Export for browser-side usage
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { agentType, userMessage, pageContext, conversationHistory } = body;

    if (!agentType || !userMessage) {
      return new Response('Missing required fields', { status: 400 });
    }

    const response = await generateAgentResponse(
      agentType,
      userMessage,
      pageContext,
      conversationHistory
    );

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API Handler Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
