/**
 * AI provider abstraction.
 *
 * The rest of the app never talks to an LLM vendor directly — it talks to
 * AIService (see ../aiService.ts), which talks to whichever AIProvider is
 * configured here. Swapping providers means writing one adapter and
 * flipping AI_PROVIDER in .env; nothing else in the codebase changes.
 */

export interface AIProvider {
  /** Send a single-turn prompt (optionally with a system prompt) and get text back. */
  complete(params: { system?: string; prompt: string; maxTokens?: number }): Promise<string>;
}

class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete({ system, prompt, maxTokens = 1024 }: { system?: string; prompt: string; maxTokens?: number }) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI provider error (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { content: Array<{ type: string; text?: string }> };
    return data.content
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text)
      .join("\n");
  }
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete({ system, prompt, maxTokens = 1024 }: { system?: string; prompt: string; maxTokens?: number }) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI provider error (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? "";
  }
}

/** Deterministic offline fallback so the app is demoable with no API key configured. */
class MockProvider implements AIProvider {
  async complete({ prompt }: { system?: string; prompt: string; maxTokens?: number }) {
    return (
      "[AI_API_KEY not configured — showing a placeholder response]\n\n" +
      `You asked me to help with: "${prompt.slice(0, 160)}${prompt.length > 160 ? "…" : ""}". ` +
      "Configure AI_PROVIDER and AI_API_KEY in your .env to get real AI-generated content here."
    );
  }
}

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "mock";
  const apiKey = process.env.AI_API_KEY || "";
  const model = process.env.AI_MODEL || "claude-sonnet-4-6";

  if (!apiKey) return new MockProvider();

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider(apiKey, model);
    case "openai":
      return new OpenAIProvider(apiKey, model || "gpt-4o");
    default:
      return new MockProvider();
  }
}
