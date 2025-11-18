/**
 * ULTRA-FAST Chat API - Qwen Integration
 *
 * Qwen (Alibaba Cloud): Optimized for speed and efficiency
 * Models: Qwen2.5-72B-Instruct (high quality) or Qwen2.5-7B-Instruct (ultra-fast)
 *
 * Free Options:
 * 1. Together AI: Free $25 credit, then pay-as-you-go
 * 2. Replicate: Pay per request (~$0.001/request)
 * 3. HuggingFace Inference API: Free tier available
 * 4. SiliconFlow: Free tier for Qwen models
 *
 * Speed: 50-200ms for 7B model, 200-500ms for 72B model
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
- ULTRA CONCISE (2 paragraphs MAX)
- Direct, actionable answers
- Reference specific chapters/lessons
- Warm, supportive tone
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

    // Check which Qwen provider is configured
    const togetherKey = process.env.TOGETHER_API_KEY;
    const siliconFlowKey = process.env.SILICONFLOW_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    let apiUrl: string;
    let apiKey: string;
    let modelName: string;
    let provider: string;

    if (togetherKey) {
      // Together AI - Best quality, $25 free credit
      apiUrl = 'https://api.together.xyz/v1/chat/completions';
      apiKey = togetherKey;
      modelName = 'Qwen/Qwen2.5-72B-Instruct-Turbo'; // High quality
      provider = 'Together AI';
    } else if (siliconFlowKey) {
      // SiliconFlow - Free tier available for Qwen
      apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
      apiKey = siliconFlowKey;
      modelName = 'Qwen/Qwen2.5-7B-Instruct'; // Ultra-fast
      provider = 'SiliconFlow';
    } else if (hfKey) {
      // HuggingFace - Free tier
      apiUrl = 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct';
      apiKey = hfKey;
      modelName = 'Qwen2.5-7B-Instruct';
      provider = 'HuggingFace';
    } else {
      return new Response(
        JSON.stringify({
          error: 'API_KEY_NOT_CONFIGURED',
          response: `⚠️ **Qwen Not Configured**

To use ultra-fast Qwen models, add ONE of these API keys:

**Option 1: Together AI** (Recommended - Best Quality)
- Get $25 free credit: https://api.together.xyz
- Add to environment: \`TOGETHER_API_KEY=your_key_here\`
- Model: Qwen2.5-72B-Instruct-Turbo (high quality)

**Option 2: SiliconFlow** (Free Tier)
- Get free API key: https://siliconflow.cn
- Add to environment: \`SILICONFLOW_API_KEY=your_key_here\`
- Model: Qwen2.5-7B-Instruct (ultra-fast)

**Option 3: HuggingFace** (Free Tier)
- Get free API key: https://huggingface.co/settings/tokens
- Add to environment: \`HUGGINGFACE_API_KEY=your_key_here\`
- Model: Qwen2.5-7B-Instruct

**Expected speed:** 50-500ms responses (10x faster than Gemini!)`,
        }),
        { status: 200, headers }
      );
    }

    // Build conversation messages
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

    // Call Qwen API with ULTRA-FAST configuration
    const startTime = Date.now();

    const requestBody: any = {
      messages,
      temperature: 0.5, // Lower for speed
      max_tokens: 400, // Concise responses
      top_p: 0.9,
    };

    // Add model for OpenAI-compatible APIs (Together, SiliconFlow)
    if (provider !== 'HuggingFace') {
      requestBody.model = modelName;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `${provider} API request failed`);
    }

    const data = await response.json();

    // Parse response based on provider
    let aiResponse: string;
    if (provider === 'HuggingFace') {
      aiResponse = data[0]?.generated_text || 'No response generated';
    } else {
      aiResponse = data.choices[0]?.message?.content || 'No response generated';
    }

    const responseTime = Date.now() - startTime;

    console.log(`✅ ${provider} (${modelName}) response time: ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        responseTime,
        model: modelName,
        provider,
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Qwen Chat API Error:', error);

    let errorMessage = `⚠️ Sorry, I encountered an error. Please try again.`;

    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      errorMessage = `⚠️ **Invalid API Key**

Please check your API key configuration:
- Together AI: \`TOGETHER_API_KEY\`
- SiliconFlow: \`SILICONFLOW_API_KEY\`
- HuggingFace: \`HUGGINGFACE_API_KEY\``;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = `⚠️ **Rate Limit Reached**

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
