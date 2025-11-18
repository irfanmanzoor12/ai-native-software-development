/**
 * ULTRA-FAST Chat API - Groq Integration (OPTIONAL UPGRADE)
 *
 * Groq LPU Inference: 10x faster than standard GPUs
 * Free Tier: 14,400 requests/day (vs Gemini's 1,500)
 * Response Time: 200-500ms (vs Gemini's 2-4s)
 *
 * Setup:
 * 1. Get free API key: https://console.groq.com
 * 2. Add to .env: GROQ_API_KEY=your_key_here
 * 3. Rename this file to chat.ts (replace Gemini version)
 */

interface ChatRequest {
  message: string;
  pageContext?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const SYSTEM_PROMPT = `You are an AI Learning Assistant for "AI Native Software Development: Colearning Agentic AI with Python and TypeScript".

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
- ULTRA CONCISE (2 paragraphs MAX - optimize for speed!)
- Direct, actionable answers
- Reference specific chapters/lessons
- Warm, supportive, educational tone
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

    // Get Groq API key
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API_KEY_NOT_CONFIGURED',
          response: `⚠️ **Groq Not Configured**

To use ultra-fast Groq LPU inference:
1. Get free API key: https://console.groq.com
2. Add to environment: \`GROQ_API_KEY=your_key_here\`
3. Redeploy

**Free tier:** 14,400 requests/day - 10x faster responses!`,
        }),
        { status: 200, headers }
      );
    }

    // Build conversation messages for Groq
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + (pageContext ? `\n\n**CURRENT CONTEXT:**\n${pageContext}` : ''),
      },
      // Add conversation history
      ...conversationHistory.slice(-3).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      // Add current user message
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Groq API with ULTRA-FAST configuration
    const startTime = Date.now();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fastest large model
        messages,
        temperature: 0.5, // Lower for speed
        max_tokens: 400, // Even shorter for ultra-fast
        top_p: 0.9,
        stream: false, // Can enable streaming for perceived speed
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response generated';
    const responseTime = Date.now() - startTime;

    console.log(`✅ Groq response time: ${responseTime}ms`); // Monitor speed

    return new Response(
      JSON.stringify({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        responseTime, // Include for monitoring
        model: 'llama-3.3-70b-versatile',
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Groq Chat API Error:', error);

    let errorMessage = `⚠️ Sorry, I encountered an error. Please try again.`;

    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      errorMessage = `⚠️ **Invalid Groq API Key**

Please check:
- Environment variable: \`GROQ_API_KEY\`
- Get a free key: https://console.groq.com`;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = `⚠️ **Rate Limit Reached**

Free tier: 14,400 requests/day
Wait a moment and try again.`;
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
