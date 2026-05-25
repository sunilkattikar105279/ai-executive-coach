import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // server-side only, never sent to browser
});

const SYSTEM_PROMPT = `You are an elite AI Executive Coach helping entrepreneurs launch and scale online businesses. You specialize in:
- Online business strategy and launch planning
- AI Micro-SaaS products and go-to-market
- AI Content Studio operations
- Revenue growth and client acquisition
- Dallas/DFW market context and global scaling

Your style: direct, tactical, no fluff. Give specific actionable advice. Use bullet points for steps. 
Reference Dallas-specific context when relevant. Always push toward revenue and speed.
Keep responses under 250 words unless the user explicitly asks for detail.
Never use generic platitudes like "game-changer" or "paradigm shift".
Treat the entrepreneur as a capable adult who can handle honest, challenging feedback.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Basic input validation
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  // Limit history to last 20 messages to control cost
  const recentMessages = messages.slice(-20);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: recentMessages,
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Anthropic API error:", error);

    // Don't leak internal error details to the client
    if (error.status === 401) {
      return res.status(500).json({ error: "API configuration error. Check your API key." });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
    }

    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
