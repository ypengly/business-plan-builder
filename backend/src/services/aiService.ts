import { createAIProvider } from "./ai/provider.js";
import type { BusinessPlan, BusinessProfile, Product, CustomerPersona, Competitor } from "@prisma/client";

const provider = createAIProvider();

const SYSTEM_PROMPT =
  "You are an expert business plan consultant and startup advisor. You write clearly, " +
  "concretely, and avoid generic filler. You tailor every answer to the specific business " +
  "details you're given rather than writing something that could apply to any company. " +
  "When numbers matter, be explicit about assumptions.";

type PlanContext = {
  plan: BusinessPlan;
  profile?: BusinessProfile | null;
  products?: Product[];
  personas?: CustomerPersona[];
  competitors?: Competitor[];
};

function describeContext(ctx: PlanContext): string {
  const lines: string[] = [];
  lines.push(`Business name: ${ctx.plan.businessName}`);
  if (ctx.plan.industry) lines.push(`Industry: ${ctx.plan.industry}`);
  if (ctx.profile?.description) lines.push(`Description: ${ctx.profile.description}`);
  if (ctx.profile?.problem) lines.push(`Problem it solves: ${ctx.profile.problem}`);
  if (ctx.profile?.stage) lines.push(`Stage: ${ctx.profile.stage}`);
  if (ctx.profile?.city || ctx.profile?.country) {
    lines.push(`Location: ${[ctx.profile.city, ctx.profile.country].filter(Boolean).join(", ")}`);
  }
  if (ctx.products?.length) {
    lines.push(
      "Products/services: " +
        ctx.products.map((p) => `${p.name} (price $${p.price}, cost $${p.cost})`).join("; ")
    );
  }
  if (ctx.personas?.length) {
    lines.push(
      "Target customer personas: " +
        ctx.personas.map((p) => `${p.name} (${p.ageRange ?? "age n/a"}, ${p.location ?? "location n/a"})`).join("; ")
    );
  }
  if (ctx.competitors?.length) {
    lines.push("Competitors: " + ctx.competitors.map((c) => c.name).join(", "));
  }
  return lines.join("\n");
}

/**
 * AIService: the single entry point every route/controller uses for
 * AI-generated content. Backed by AIProvider (see ./ai/provider.ts), so it
 * never cares which vendor is actually configured.
 */
export const AIService = {
  async generateExecutiveSummary(ctx: PlanContext) {
    const prompt = `Here is what we know about the business:\n${describeContext(ctx)}\n\nWrite a concise, professional executive summary (250-400 words) covering: business overview, the problem, the solution, target market, business model, competitive advantage, marketing strategy, financial highlights, and the growth opportunity.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 900 });
  },

  async generateBusinessPlan(ctx: PlanContext, sectionKeys: string[]) {
    const prompt = `Here is what we know about the business:\n${describeContext(ctx)}\n\nDraft the following business plan sections, each with a clear heading, in the order given: ${sectionKeys.join(", ")}. Keep each section focused and specific to this business — no generic filler.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 4000 });
  },

  async improveSection(sectionTitle: string, currentText: string, instruction: string, ctx?: PlanContext) {
    const contextBlock = ctx ? `\n\nBusiness context:\n${describeContext(ctx)}` : "";
    const prompt = `Section: "${sectionTitle}"\n\nCurrent text:\n"""\n${currentText}\n"""\n\nInstruction: ${instruction}${contextBlock}\n\nReturn only the revised text, no preamble.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 800 });
  },

  async generateMarketAnalysis(ctx: PlanContext) {
    const prompt = `Here is what we know about the business:\n${describeContext(ctx)}\n\nProvide a market analysis with these labeled subsections: Market Overview, Target Market, Market Trends, Customer Needs, Market Opportunities, Market Risks. Be specific to this industry and location where possible, and note that figures should be verified against current local data.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 900 });
  },

  async generateSWOT(ctx: PlanContext) {
    const prompt = `Here is what we know about the business:\n${describeContext(ctx)}\n\nGenerate a SWOT analysis. Return exactly this format, one item per line, prefixed by its category tag:\nSTRENGTH: ...\nWEAKNESS: ...\nOPPORTUNITY: ...\nTHREAT: ...\nProvide 3-5 lines per category.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 700 });
  },

  async generateFinancialAssumptions(ctx: PlanContext) {
    const prompt = `Here is what we know about the business:\n${describeContext(ctx)}\n\nSuggest realistic starting assumptions for: fixed monthly costs, variable cost per unit, selling price per unit, and expected monthly growth rate (%). Explain each briefly in one sentence and note these are starting points to be verified with real supplier/market data.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 500 });
  },

  async generateMarketingStrategy(ctx: PlanContext) {
    const prompt = `Here is what we know about the business:\n${describeContext(ctx)}\n\nDraft a marketing strategy covering: brand positioning, marketing goals, customer acquisition channels, social media strategy, content strategy, advertising, promotions, partnerships, and a retention strategy.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 900 });
  },

  async suggestBusinessNames(description: string, industry?: string) {
    const prompt = `Suggest 8 short, memorable business names for this concept${industry ? ` in the ${industry} industry` : ""}: "${description}". One per line, no numbering, no explanation.`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 200 });
  },

  async reviewBusinessPlan(fullPlanText: string) {
    const prompt = `Review this business plan critically, as an investor would. Point out the 5 most important gaps, weaknesses, or unrealistic assumptions, and suggest one concrete fix for each.\n\nPLAN:\n"""\n${fullPlanText}\n"""`;
    return provider.complete({ system: SYSTEM_PROMPT, prompt, maxTokens: 900 });
  },
};

/** Parses the "STRENGTH: ..." / "WEAKNESS: ..." line format from generateSWOT into structured rows. */
export function parseSwotResponse(text: string) {
  const map: Record<string, "STRENGTH" | "WEAKNESS" | "OPPORTUNITY" | "THREAT"> = {
    STRENGTH: "STRENGTH",
    WEAKNESS: "WEAKNESS",
    OPPORTUNITY: "OPPORTUNITY",
    THREAT: "THREAT",
  };
  const items: { category: string; content: string }[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const match = /^(STRENGTH|WEAKNESS|OPPORTUNITY|THREAT):\s*(.+)$/i.exec(line);
    if (match) {
      const category = map[match[1].toUpperCase()];
      if (category) items.push({ category, content: match[2].trim() });
    }
  }
  return items;
}
