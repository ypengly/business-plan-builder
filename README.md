# Ledger — AI Business Plan Builder

A full-stack app that walks someone with no business-plan experience from a
raw idea to a formatted, exportable, investor-ready business plan.

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + TypeScript + Express
- **Database:** PostgreSQL via Prisma ORM
- **AI:** provider-agnostic `AIService` (Anthropic or OpenAI adapter included; falls back to a mock so the app runs with no API key)
- **Export:** real PDF (pdfkit) and DOCX (docx) generation

## What's fully implemented vs. simplified

This is a real, running codebase, not a mockup — but given the size of the
original spec, some pieces are intentionally scoped down so everything else
actually works end to end. Fully implemented: auth (email/password + Google),
plan CRUD, the wizard (business info, products with live margin calc, customer
personas, SWOT with AI generation, financials with break-even + 36-month
projection + charts), the AI service layer (all functions from the spec,
provider-agnostic), PDF/DOCX export, share links, plan duplication, and a
demo seed ("Urban Bean Coffee"). Scoped down for this pass: the Business Model
Canvas, Marketing/Sales/Operations/Team wizard steps, and drag-and-drop are
modeled in the database and have working API routes, but don't yet have
dedicated wizard-step UI (the pattern in `StepProduct.tsx` / `SwotBoard.tsx`
is the template to extend them — each is a ~60-line component). Password
reset emails log to the console instead of sending real email (swap in a
provider like Postmark/SendGrid where noted in `authController.ts`).

## Project structure

```
business-plan-builder/
├── backend/           # Express API + Prisma
│   ├── prisma/schema.prisma   # all 20+ models from the spec
│   └── src/
│       ├── routes/            # REST endpoints
│       ├── controllers/
│       ├── services/
│       │   ├── ai/provider.ts # Anthropic/OpenAI/mock adapters
│       │   ├── aiService.ts   # AIService — the abstraction every route uses
│       │   ├── financialService.ts   # break-even, projections, ROI, runway
│       │   ├── completionService.ts  # plan quality score
│       │   └── exportService.ts      # PDF/DOCX generation
│       ├── middleware/        # auth, rate limiting, error handling
│       └── validators/        # zod schemas
└── frontend/          # React app
    └── src/
        ├── pages/              # Landing, Login, Register, Dashboard, Wizard, Document
        ├── components/
        │   ├── wizard/         # step components + progress bar
        │   ├── swot/           # interactive SWOT board
        │   ├── financial/      # financial dashboard + charts
        │   └── ai/             # floating AI assistant
        ├── stores/             # zustand: auth, theme
        └── services/api.ts     # axios client
```

## 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Set environment variables

```bash
cd backend
cp .env.example .env
# edit .env: set JWT_SECRET, and AI_PROVIDER/AI_API_KEY if you want real AI output
# (with AI_API_KEY unset, AI endpoints return a clearly-labeled placeholder response)
```

## 3. Start PostgreSQL

Easiest option, with Docker:

```bash
docker compose up -d
```

Or point `DATABASE_URL` in `backend/.env` at any Postgres instance you already have.

## 4. Run database migrations

```bash
cd backend
npx prisma migrate dev --name init
```

## 5. Seed demo data

```bash
npm run prisma:seed
```

This creates 14 starter templates and a demo login:
`demo@businessplanbuilder.app` / `Demo1234!` — with a fully filled-in
"Urban Bean Coffee" plan so you can see the app with real data immediately.

## 6. Start the backend

```bash
cd backend
npm run dev
# API on http://localhost:4000
```

## 7. Start the frontend

```bash
cd frontend
npm run dev
# App on http://localhost:5173 (proxies /api to the backend)
```

## 8. Connect the AI API

In `backend/.env`:

```
AI_PROVIDER=anthropic        # or "openai"
AI_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-6   # or "gpt-4o" for openai
```

Never put this key in the frontend — all AI calls are proxied through the
backend's `AIService` (`backend/src/services/aiService.ts`), which is the
only place that talks to `backend/src/services/ai/provider.ts`.

## 9. Building for production

```bash
# backend
cd backend && npm run build && npm start

# frontend
cd frontend && npm run build   # outputs static files to frontend/dist
```

Serve `frontend/dist` from any static host (Vercel, Netlify, nginx) and point
it at your deployed backend via a reverse proxy or `VITE_API_URL`-style env
var if you split the domains.

## Notes on security

- Passwords are hashed with bcrypt (12 rounds); JWTs sign session tokens.
- `helmet` sets standard security headers; `express-rate-limit` throttles
  auth and AI endpoints separately from general API traffic.
- The AI API key lives only in the backend's environment — it's never sent
  to or readable from the client bundle.
- Zod validates every request body before it touches the database.
