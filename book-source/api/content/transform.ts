/**
 * Content Transformation API - Vercel Serverless Function
 *
 * Transforms lesson content based on selected mode (summary/personalized)
 * Uses Google Gemini AI (reusing existing setup from agent.ts)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface RequestBody {
  mode: 'summary' | 'personalized';
  lessonPath: string;
  originalContent: string;
  professionalBackground?: string; // For personalized mode
}

// AI Prompts for content transformation
const TRANSFORMATION_PROMPTS = {
  summary: `Condense this lesson to 30-50% length. Keep:
- Learning objectives (exact)
- Key concepts (simplified)
- 1 code example per concept
- ALL "Try With AI" sections
- Critical warnings

Remove: long explanations, redundant examples, background context.

Style: Concise, technical, bullet-points. Active voice.

LESSON:
{originalContent}

Output: Markdown with same headings, condensed text.`,

  personalized: `Adapt this lesson for {professionalBackground} professional.

Replace jargon with domain analogies:
- Variables → domain data
- Functions → domain processes
- Loops → repetitive tasks

Use domain examples in code and "Try With AI" prompts.

Tone: Warm, supportive. "Your domain expertise helps you understand this."

Keep: "Try With AI" sections (adapt to domain), code (add domain-context comments), objectives.

LESSON:
{originalContent}

Output: Markdown, domain-adapted.`,
};

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { mode, lessonPath, originalContent, professionalBackground = 'General' } = body;

    // Validate required fields
    if (!mode || !originalContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: mode, originalContent' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate mode
    if (!['summary', 'personalized'].includes(mode)) {
      return new Response(JSON.stringify({ error: 'Invalid mode. Must be "summary" or "personalized"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.GEMINI_API_KEY || process.env.DOCUSAURUS_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API_KEY_NOT_CONFIGURED',
          content: `⚠️ **API Key Not Configured**

To use ${mode === 'summary' ? 'Summary' : 'Personalized'} mode, you need a free Google Gemini API key.

**Setup:**
1. Get your free API key: https://aistudio.google.com/app/apikey
2. Add to environment variables: \`GEMINI_API_KEY=your_key_here\`
3. Redeploy

**Free tier:** 1,500 requests/day - no credit card needed!`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Gemini with optimized settings
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp', // Fastest model
      generationConfig: {
        temperature: 0.5, // Lower = faster, more consistent
        topK: 20, // Reduced for speed
        topP: 0.9, // Slightly reduced for speed
        maxOutputTokens: 1500, // Reduced tokens for faster generation
      },
    });

    // Build the prompt
    let prompt = TRANSFORMATION_PROMPTS[mode];
    prompt = prompt.replace('{originalContent}', originalContent);

    if (mode === 'personalized') {
      prompt = prompt.replace(/{professionalBackground}/g, professionalBackground);
    }

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const transformedContent = response.text();

    // Return transformed content
    return new Response(
      JSON.stringify({
        mode,
        content: transformedContent,
        lessonPath,
        professionalBackground: mode === 'personalized' ? professionalBackground : undefined,
        generatedAt: new Date().toISOString(),
        cached: false, // TODO: Add caching later
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Gemini API Error:', error);

    let errorMessage = `⚠️ **Error:** ${error.message}`;

    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      errorMessage = `⚠️ **Invalid API Key**

Please check your API key configuration:
- Environment variable: \`GEMINI_API_KEY\`
- Get a free key: https://aistudio.google.com/app/apikey`;
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = `⚠️ **Rate Limit Reached**

Free tier limit: 1,500 requests/day

Please wait a moment and try again, or switch back to Original mode.`;
    }

    return new Response(
      JSON.stringify({
        error: 'GENERATION_FAILED',
        content: errorMessage,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
