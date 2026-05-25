import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an elite AI Executive Coach helping entrepreneurs launch and scale online businesses. You specialize in:
- Online business strategy and 7-day go-live launch plans
- AI Micro-SaaS products: build, validate, and monetize fast
- AI Content Studio: done-for-you content service and client acquisition
- Revenue growth, pricing strategy, and closing first customers
- Dallas/DFW market context and global scaling strategies

Your coaching style:
- Direct, tactical, zero fluff — give specific actions not vague categories
- Use numbered steps when listing actions
- Reference Dallas/DFW context when relevant
- Always connect advice to revenue and speed
- Responses under 250 words unless the user asks for more detail
- Never use buzzwords: "game-changer", "synergy", "paradigm shift", "unlock"
- Treat the entrepreneur as a capable adult who wants honest, challenging feedback`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY environment variable is not set");
    return res.status(500).json({ error: "Server configuration error. Contact the site owner." });
  }

  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  const valid = messages.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0
  );

  if (!valid) {
    return res.status(400).json({ error: "Invalid message format." });
  }

  const maxHistory = parseInt(process.env.COACH_MAX_HISTORY ?? "20", 10);
  const trimmedMessages = messages.slice(-maxHistory);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: process.env.COACH_MODEL ?? "claude-sonnet-4-20250514",
      max_tokens: parseInt(process.env.COACH_MAX_TOKENS ?? "1024", 10),
      system: SYSTEM_PROMPT,
      messages: trimmedMessages,
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return res.status(200).json({ reply });

  } catch (err) {
    const status = err?.status;
    console.error("Anthropic API error:", status, err?.message);

    if (status === 401) {
      return res.status(500).json({ error: "Invalid API key — check your Vercel environment variable ANTHROPIC_API_KEY." });
    }
    if (status === 429) {
      return res.status(429).json({ error: "Rate limit reached — wait a moment and try again." });
    }
    if (status === 529 || status === 503) {
      return res.status(503).json({ error: "AI service temporarily busy — try again in a few seconds." });
    }

    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
