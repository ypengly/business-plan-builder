import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildProjection } from "../src/services/financialService.js";

const prisma = new PrismaClient();

const TEMPLATES = [
  { key: "coffee_shop", name: "Coffee Shop", icon: "☕", industry: "Food & Beverage" },
  { key: "restaurant", name: "Restaurant", icon: "🍔", industry: "Food & Beverage" },
  { key: "retail_store", name: "Retail Store", icon: "🛒", industry: "Retail" },
  { key: "saas_startup", name: "SaaS Startup", icon: "💻", industry: "Technology" },
  { key: "mobile_app", name: "Mobile App", icon: "📱", industry: "Technology" },
  { key: "farm", name: "Farm", icon: "🌾", industry: "Agriculture" },
  { key: "real_estate", name: "Real Estate", icon: "🏠", industry: "Real Estate" },
  { key: "transportation", name: "Transportation", icon: "🚗", industry: "Transportation" },
  { key: "salon", name: "Salon", icon: "💇", industry: "Personal Care" },
  { key: "gym", name: "Gym", icon: "🏋️", industry: "Health & Fitness" },
  { key: "ecommerce", name: "E-commerce", icon: "📦", industry: "Retail" },
  { key: "freelancer", name: "Freelancer", icon: "🧑‍💻", industry: "Services" },
  { key: "construction", name: "Construction", icon: "🏗️", industry: "Construction" },
  { key: "education", name: "Education", icon: "🎓", industry: "Education" },
];

async function main() {
  console.log("Seeding templates...");
  for (const t of TEMPLATES) {
    await prisma.template.upsert({ where: { key: t.key }, update: t, create: t });
  }

  console.log("Seeding demo user + Urban Bean Coffee plan...");
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@businessplanbuilder.app" },
    update: {},
    create: { email: "demo@businessplanbuilder.app", name: "Demo Founder", passwordHash },
  });

  const existing = await prisma.businessPlan.findFirst({ where: { userId: demoUser.id, businessName: "Urban Bean Coffee" } });
  if (existing) {
    console.log("Demo plan already exists, skipping.");
    return;
  }

  const plan = await prisma.businessPlan.create({
    data: {
      userId: demoUser.id,
      businessName: "Urban Bean Coffee",
      industry: "Food & Beverage",
      templateKey: "coffee_shop",
      status: "IN_PROGRESS",
      completionScore: 72,
      profile: {
        create: {
          businessType: "Cafe / Specialty Coffee Shop",
          country: "Cambodia",
          city: "Phnom Penh",
          stage: "PRE_LAUNCH",
          description:
            "A specialty coffee shop near BKK1 offering fast, high-quality coffee and light food for office workers and students who want a reliable third space between home and work.",
          problem:
            "Office workers and students in the area either rely on rushed, low-quality coffee stalls or expensive hotel cafes with no fast option in between.",
          mission: "Serve consistently great coffee, fast, at a fair price, in a space people enjoy sitting in.",
          vision: "Become the neighborhood's default coffee stop and expand to 3 locations across Phnom Penh within 5 years.",
          founderInfo: "Founded by a former hospitality manager with 6 years of cafe operations experience.",
          employeeCount: 4,
          location: "BKK1, Phnom Penh",
          website: "https://urbanbean.example.com",
        },
      },
      products: {
        create: [
          { name: "Espresso-based drinks", description: "Latte, cappuccino, americano, flat white", price: 3.5, cost: 1.2, revenueModel: "Per-unit sale", usp: "Consistent quality, fast service" },
          { name: "Cold brew & specialty drinks", description: "Cold brew, matcha, seasonal specials", price: 4.0, cost: 1.4, revenueModel: "Per-unit sale" },
          { name: "Light food", description: "Pastries and sandwiches", price: 2.5, cost: 1.0, revenueModel: "Per-unit sale" },
        ],
      },
      personas: {
        create: [
          { name: "Young Professional", ageRange: "22-35", location: "Phnom Penh (BKK1/Toul Kork)", incomeRange: "$500-$1,500/mo", occupation: "Office worker, NGO staff", problems: "Wants convenient, affordable coffee near the office", buyingBehavior: "Buys daily on the way to work, values speed" },
          { name: "Remote Worker / Student", ageRange: "18-28", location: "Phnom Penh", incomeRange: "$200-$800/mo", occupation: "University student, freelancer", problems: "Needs a place with wifi and seating to work from", buyingBehavior: "Stays 1-3 hours, orders 1-2 items" },
        ],
      },
      competitors: {
        create: [
          { name: "Brown Coffee", productOffering: "Coffee, light food", price: "$3-5", targetCustomer: "Broad, all ages", strengths: "Strong brand, many locations", weaknesses: "Less personal service", competitiveAdvantage: "We offer a smaller, more consistent menu with faster service" },
          { name: "Local street vendor", productOffering: "Iced coffee", price: "$1-1.5", targetCustomer: "Price-sensitive", strengths: "Very cheap", weaknesses: "Inconsistent quality, no seating", competitiveAdvantage: "We offer a seated, reliable experience for a modest premium" },
        ],
      },
      marketAnalysis: {
        create: {
          overview: "Phnom Penh's specialty coffee segment has grown steadily as disposable income rises among young professionals.",
          targetMarket: "Office workers and students in central Phnom Penh neighborhoods.",
          trends: "Growing preference for specialty and cold coffee drinks; increased demand for wifi-friendly workspaces.",
          customerNeeds: "Speed, consistency, fair pricing, comfortable seating.",
          opportunities: "Loyalty programs, delivery partnerships, corporate subscription accounts.",
          risks: "Rising rent, coffee bean price volatility, new entrants in a low-barrier category.",
          aiGenerated: false,
        },
      },
      swotItems: {
        create: [
          { category: "STRENGTH", content: "Founder has 6 years of hands-on cafe operations experience." },
          { category: "STRENGTH", content: "Central location with high foot traffic." },
          { category: "WEAKNESS", content: "Single location limits brand awareness versus larger chains." },
          { category: "WEAKNESS", content: "Limited starting capital for marketing." },
          { category: "OPPORTUNITY", content: "Corporate delivery subscriptions with nearby offices." },
          { category: "OPPORTUNITY", content: "Growing local demand for specialty cold brew." },
          { category: "THREAT", content: "Established chains with stronger brand recognition." },
          { category: "THREAT", content: "Coffee bean price volatility affecting margins." },
        ],
      },
      marketingPlan: {
        create: {
          brandPositioning: "The fast, reliable specialty coffee stop for people who don't have time to wait.",
          goals: "Reach 150 daily transactions within 6 months of opening.",
          customerAcquisition: "Instagram/TikTok content, opening promotions, partnerships with nearby offices.",
          socialMediaStrategy: "Daily Instagram/TikTok posts featuring drinks and the space; local influencer visits at launch.",
          contentStrategy: "Short-form video content showing drink preparation and the space.",
          advertising: "Targeted Facebook/Instagram ads within a 2km radius.",
          promotions: "Buy-5-get-1-free loyalty card; opening week 20% discount.",
          partnerships: "Coworking spaces and nearby offices for bulk order accounts.",
          retentionStrategy: "Digital loyalty program and a monthly subscription for regulars.",
          monthlyBudget: 400,
        },
      },
      salesPlan: {
        create: {
          channels: { store: true, delivery_apps: true, corporate_accounts: true },
          monthlySalesGoal: 9000,
          customerGoal: 3000,
          avgOrderValue: 4.2,
          conversionRate: 0.35,
        },
      },
      operationsPlan: {
        create: {
          location: "Ground floor unit, BKK1, Phnom Penh",
          openingHours: "6:30 AM - 7:00 PM daily",
          suppliers: "Local roaster for beans, regional dairy supplier",
          equipment: "2 espresso machines, 2 grinders, fridge, POS system",
          inventory: "Weekly bean and dairy restock, monthly dry goods",
          dailyOps: "Opening checklist, mid-day restock, closing cash reconciliation",
          production: "Made-to-order drinks, batch-brewed cold brew daily",
          delivery: "Partnership with local delivery apps for radius under 3km",
          qualityControl: "Daily espresso dialing-in, weekly taste calibration",
          technology: "Cloud POS with daily sales reporting",
        },
      },
      team: {
        create: [
          { name: "Founder", position: "General Manager", responsibilities: "Operations, supplier relationships, hiring", experience: "6 years hospitality management", salary: 500 },
          { name: "Head Barista", position: "Barista", responsibilities: "Drink quality, training junior staff", experience: "3 years barista experience", salary: 300 },
        ],
      },
      financialProfile: {
        create: {
          startupCosts: { equipment: 6000, rent_deposit: 2000, renovation: 3000, initial_inventory: 800, licenses: 300, marketing: 500, software: 200 },
          fixedMonthlyCosts: 1800,
          variableCostPerUnit: 1.3,
          sellingPricePerUnit: 3.7,
          monthlyGrowthRate: 0.06,
          startingCash: 15000,
        },
      },
      expenses: {
        create: [
          { category: "Rent", amount: 700, recurring: true },
          { category: "Salaries", amount: 800, recurring: true },
          { category: "Utilities", amount: 150, recurring: true },
          { category: "Marketing", amount: 150, recurring: true },
        ],
      },
      revenues: {
        create: [
          { productName: "Espresso-based drinks", price: 3.5, unitsSold: 1200, monthlyGrowth: 0.06 },
          { productName: "Cold brew & specialty", price: 4.0, unitsSold: 500, monthlyGrowth: 0.08 },
          { productName: "Light food", price: 2.5, unitsSold: 400, monthlyGrowth: 0.04 },
        ],
      },
    },
    include: { financialProfile: true, expenses: true, revenues: true },
  });

  // Precompute and store a 12-month projection snapshot.
  const projection = buildProjection({
    startupCosts: plan.financialProfile!.startupCosts as Record<string, number>,
    fixedMonthlyCosts: plan.financialProfile!.fixedMonthlyCosts,
    variableCostPerUnit: plan.financialProfile!.variableCostPerUnit,
    sellingPricePerUnit: plan.financialProfile!.sellingPricePerUnit,
    startingCash: plan.financialProfile!.startingCash,
    months: 12,
    revenueLines: plan.revenues.map((r) => ({ price: r.price, unitsSold: r.unitsSold, monthlyGrowth: r.monthlyGrowth })),
    expenseLines: plan.expenses.map((e) => ({ amount: e.amount, recurring: e.recurring })),
  });

  await prisma.financialProjection.createMany({
    data: projection.monthlyProjection.map((m) => ({
      planId: plan.id,
      month: m.month,
      revenue: m.revenue,
      expenses: m.variableCosts + m.fixedCosts,
      grossProfit: m.grossProfit,
      netProfit: m.netProfit,
      cashFlow: m.cashFlow,
      cumulativeCash: m.cumulativeCash,
    })),
  });

  console.log(`Seed complete. Demo login: demo@businessplanbuilder.app / Demo1234!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
