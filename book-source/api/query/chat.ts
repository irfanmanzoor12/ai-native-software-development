/**
 * Conversational Query API - Vercel Serverless Function
 *
 * Handles user queries about book content (parts, chapters, lessons)
 * with context-aware AI responses using Google Gemini.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatRequest {
  message: string;
  pageContext?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Enhanced system prompt with book structure knowledge
const SYSTEM_PROMPT = `You are an AI Learning Assistant for the book "AI Native Software Development: Colearning Agentic AI with Python and TypeScript".

**BOOK STRUCTURE** (55 chapters across 13 parts):

Part 1: Introducing AI-Driven Development (Chapters 1-4)
- Paradigm shift from code-first to specification-first development
- AI as thinking partner, not just a tool

Part 2: AI Tool Landscape (Chapters 5-8)
- Claude Code, Gemini AI Studio, prompt engineering tools
- Setting up your AI development environment

Part 3: Markdown-Prompt-Context-Engineering (Chapters 9-16)
- Mastering prompts, context management, markdown skills
- Writing effective specifications

Part 4: Python Fundamentals (Chapters 17-29)
- Python basics → async programming → agent systems
- Building multi-agent architectures

Part 5: Spec-Driven Development (Chapters 30-38)
- Complete specification-first workflow
- Validation, testing, deployment

Parts 6-13: Advanced Topics (Chapters 39-55)
- TypeScript, full-stack development
- Production deployment, scaling, DevOps

**CORE PHILOSOPHY**:
- Specification-First: Write spec → AI implements → Validate
- Co-Learning: Human architects, AI executes, both learn together
- Python (reasoning/backend) + TypeScript (interaction/frontend)
- Quality shift: Bugs in specs, not implementation

**YOUR ROLE**:
1. Answer questions about specific parts, chapters, or lessons
2. Explain concepts using the book's spec-first philosophy
3. Provide relevant examples from the book content
4. Guide learners through the curriculum progression
5. Be encouraging and supportive (this is a beginner-friendly book)

**RESPONSE STYLE**:
- Concise but thorough (2-4 paragraphs max)
- Use examples from book content when possible
- Reference specific parts/chapters/lessons
- Encourage hands-on practice with AI tools
- Warm, supportive, educational tone

**CONTEXT AWARENESS**:
When page context is provided, prioritize explaining content from that specific location.
If user asks general questions, draw from entire book structure.
`;

export default async function handler(req: Request): Promise<Response> {
  // CORS headers for client-side requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: ChatRequest = await req.json();
    const { message, pageContext, conversationHistory = [] } = body;

    // Validate required fields
    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers }
      );
    }

    // Rate limiting check (client-side handles this, but validate here too)
    if (message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 1000 characters)' }),
        { status: 400, headers }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.DOCUSAURUS_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API_KEY_NOT_CONFIGURED',
          response: `⚠️ **Chat Feature Not Configured**

To use the AI chat assistant, you need a free Google Gemini API key.

**Setup:**
1. Get your free API key: https://aistudio.google.com/app/apikey
2. Add to environment variables: \`GEMINI_API_KEY=your_key_here\`
3. Redeploy

**Free tier:** 1,500 requests/day - no credit card needed!`,
        }),
        { status: 200, headers }
      );
    }

    // Initialize Gemini with optimized settings
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp', // Fastest model
      generationConfig: {
        temperature: 0.7, // Slightly creative but focused
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000, // Keep responses concise
      },
    });

    // Build the conversation prompt
    let prompt = SYSTEM_PROMPT;

    // Add page context if available
    if (pageContext) {
      prompt += `\n\n**CURRENT PAGE CONTEXT**:\n${pageContext}\n`;
    }

    // Add conversation history (last 5 messages for context)
    if (conversationHistory.length > 0) {
      prompt += '\n\n**CONVERSATION HISTORY**:\n';
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
    }

    // Add current user message
    prompt += `\n\n**USER QUESTION**:\n${message}\n\n**YOUR RESPONSE**:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Return successful response
    return new Response(
      JSON.stringify({
        response: aiResponse,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Chat API Error:', error);

    let errorMessage = `⚠️ Sorry, I encountered an error. Please try again.`;

    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      errorMessage = `⚠️ **Invalid API Key**

Please check your API key configuration:
- Environment variable: \`GEMINI_API_KEY\`
- Get a free key: https://aistudio.google.com/app/apikey`;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = `⚠️ **Rate Limit Reached**

Free tier limit: 1,500 requests/day

Please wait a moment and try again.`;
    }

    return new Response(
      JSON.stringify({
        error: 'GENERATION_FAILED',
        response: errorMessage,
      }),
      { status: 200, headers }
    );
  }
}
