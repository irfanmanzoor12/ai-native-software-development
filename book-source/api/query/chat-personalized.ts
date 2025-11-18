/**
 * Personalized Mode API - Gemini (HIGH QUALITY)
 *
 * Optimized for: Quality and personalization
 * Model: Gemini 2.0 Flash Exp
 * Response Time: 2-4s
 * Free Tier: 1,500 requests/day
 * Use Case: Detailed, adaptive explanations based on user profile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatRequest {
  message: string;
  pageContext?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const SYSTEM_PROMPT = `You are an AI Learning Assistant for "AI Native Software Development: Colearning Agentic AI with Python and TypeScript".

**YOUR ROLE:** Provide PERSONALIZED explanations adapted to the user's background and experience level.

**BOOK STRUCTURE** (55 chapters across 13 parts):
Part 1: Introducing AI-Driven Development (Chapters 1-4)
Part 2: AI Tool Landscape (Chapters 5-8)
Part 3: Markdown-Prompt-Context-Engineering (Chapters 9-16)
Part 4: Python Fundamentals (Chapters 17-29)
Part 5: Spec-Driven Development (Chapters 30-38)
Parts 6-13: Advanced Topics (Chapters 39-55)

**CORE PHILOSOPHY:**
- Specification-First: Write spec → AI implements → Validate
- Co-Learning: Human architects, AI executes, both learn together

**RESPONSE STYLE:**
- Adapt to user's professional background and experience level
- Use relevant examples from their field
- Align with their learning goals
- Be thorough but clear (3-4 paragraphs)
- Warm, supportive, educational tone
- Make complex concepts relatable
`;

export default async function handler(req: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    const body: ChatRequest = await req.json();
    const { message, pageContext, conversationHistory = [] } = body;

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers }
      );
    }

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.DOCUSAURUS_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API_KEY_NOT_CONFIGURED',
          response: `⚠️ **Personalized Mode Not Configured**

To enable personalized explanations with Gemini:
1. Get free API key: https://aistudio.google.com/app/apikey
2. Add to Vercel: \`GEMINI_API_KEY=your_key_here\`
3. Redeploy

**Free tier:** 1,500 requests/day - excellent quality!`,
        }),
        { status: 200, headers }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7, // Higher for personalization
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 600, // Longer for detailed explanations
      },
    });

    // Build prompt
    let prompt = SYSTEM_PROMPT;

    if (pageContext) {
      prompt += `\n\n**CURRENT CONTEXT:**\n${pageContext}`;
    }

    if (conversationHistory.length > 0) {
      prompt += '\n\n**CONVERSATION HISTORY:**\n';
      conversationHistory.slice(-3).forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
    }

    prompt += `\n\n**USER QUESTION:**\n${message}\n\n**YOUR PERSONALIZED RESPONSE:**`;

    // Generate response
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    const responseTime = Date.now() - startTime;

    console.log(`🎯 Personalized (Gemini) response time: ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        responseTime,
        model: 'gemini-2.0-flash-exp',
        provider: 'Gemini',
        mode: 'personalized',
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Personalized API Error:', error);

    let errorMessage = `⚠️ Failed to get personalized response. Please try again.`;

    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      errorMessage = `⚠️ **Invalid Gemini API Key**

Please check Vercel environment variable: \`GEMINI_API_KEY\`
Get a free key: https://aistudio.google.com/app/apikey`;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = `⚠️ **Rate Limit Reached**

Free tier: 1,500 requests/day. Wait a moment and try again.`;
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
