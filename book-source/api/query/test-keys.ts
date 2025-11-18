/**
 * Diagnostic API - Check if environment variables are loaded
 */

export default async function handler(req: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  return new Response(
    JSON.stringify({
      groq_configured: !!groqKey,
      groq_starts_with: groqKey ? groqKey.substring(0, 8) + '...' : 'NOT_SET',
      gemini_configured: !!geminiKey,
      gemini_starts_with: geminiKey ? geminiKey.substring(0, 8) + '...' : 'NOT_SET',
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers }
  );
}
