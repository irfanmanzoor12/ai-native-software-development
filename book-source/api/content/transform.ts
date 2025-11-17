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
  summary: `You are generating a SUMMARY version of a lesson from "AI Native Software Development: Colearning Agentic AI with Python and TypeScript".

TASK: Condense the following lesson to 30-50% of its original length while preserving:
- All learning objectives (verbatim)
- Key concepts and definitions (simplified if possible)
- At least 1 representative code example per major concept
- ALL "Try With AI" prompts (these are critical for hands-on practice)
- Critical warnings, notes, and best practices

REMOVE:
- Extended explanations and analogies (keep only essential context)
- Redundant examples (keep the clearest one)
- Detailed walkthroughs (condense to essential steps)
- Background context that isn't directly required to understand the core concept

TARGET AUDIENCE: Readers who have already read the Original lesson and need quick review/refresh.

WRITING STYLE: Concise, technical, bullet-point friendly. Use active voice. Assume reader has basic context.

VALIDATION:
- Final output must be 30-50% the length of the original (character count)
- All markdown formatting must be preserved (headings, code blocks, links, images)
- All "Try With AI" sections must be present

ORIGINAL LESSON:
{originalContent}

Generate the summary in markdown format, maintaining the same heading structure but condensing body text.`,

  personalized: `You are adapting a lesson for a PROFESSIONAL with specific background.

TASK: Rewrite the following lesson to make it accessible and relevant for someone with {professionalBackground} background.

READER PROFILE:
- Professional: {professionalBackground}
- Motivation: Apply AI/programming skills to their domain
- Strengths: Domain expertise, logical thinking
- Weaknesses: May have limited programming experience, unfamiliar with technical jargon

ADAPTATION STRATEGY:
1. **Replace jargon with domain-specific analogies**:
   - Variables → Domain-specific equivalents
   - Functions → Domain processes
   - Loops → Repetitive domain tasks
   - APIs → Domain integrations
   - Databases → Domain data storage systems

2. **Use domain-specific examples**:
   - Code examples should involve domain-relevant scenarios
   - "Try With AI" prompts should reference domain tasks

3. **Simplify technical concepts**:
   - Avoid jargon, use plain language
   - Break down complex ideas step-by-step
   - Use analogies from the reader's domain

4. **Maintain confidence-building tone**:
   - Acknowledge: "This may feel unfamiliar, but you already understand similar concepts"
   - Encourage: "Your domain expertise will help you understand this"
   - Reassure: "AI will help with syntax—focus on the logic"

PRESERVE:
- All "Try With AI" prompts (but adapt examples to domain context)
- Code examples (but add comments explaining each line in domain terms)
- Learning objectives (but reframe for the professional's domain)

ORIGINAL LESSON:
{originalContent}

Generate the personalized version in markdown format. Use a warm, supportive tone. Make technical concepts feel approachable.`,
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

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7, // Balance creativity & consistency
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
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
