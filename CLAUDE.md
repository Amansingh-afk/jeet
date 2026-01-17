# Jeet Project Context

## Overview

Jeet is an AI-powered SSC exam preparation mentor that teaches tricks (not textbook methods) in Hinglish. The system matches user questions to known patterns and uses LLM to explain the trick.

## Architecture

- **Backend**: Node.js + Hono
- **Database**: PostgreSQL + pgvector
- **LLM**: OpenAI GPT-4o-mini
- **Embeddings**: OpenAI text-embedding-3-small

## Key Numbers

- ~500 patterns (problem types with tricks)
- ~8000 questions (mapped to patterns)
- ~30 topics

## Pattern Matching Strategy

Two-tier matching:
1. **Question matching** (threshold 0.85) - exact/near-exact matches
2. **Pattern matching** (threshold 0.55) - fallback for novel questions

---

## Critical Rule: No Runtime Query Normalization

**DO NOT attempt to normalize user queries at runtime beyond simple number replacement.**

Why:
- We have 8000+ questions with endless variations of items, names, and phrasings
- Regex-based matching ("price of X" → "price of an item") will never cover all cases
- Adding patterns for each variation is an endless task
- The semantic meaning of user queries must be preserved as-is

What IS allowed at runtime:
- Number normalization only: `20%` → `X%`, `Rs 500` → `Rs X`
- This is predictable and finite

What is NOT allowed:
- Item replacement: "salt" → "an item" (endless items exist)
- Name replacement: "Ram" → "A" (endless names exist)
- Context-based patterns: "price of (\w+)" → "price of an item"

**The solution is in content authoring, not code.** Each pattern must have a well-crafted `embedding_text` that is generic enough to match user query variations through semantic similarity.

---

## Content Authoring Rules

### Pattern `embedding_text` Field

Every pattern MUST have a `signature.embedding_text` field containing a **normalized, generic version** of the question structure.

**Rules for `embedding_text`:**

1. **Replace all numbers with X**
   - `20%` → `X%`
   - `Rs 500` → `Rs X`
   - `5 years` → `X years`

**Example:**

```json
{
  "id": "pc-005",
  "name": "Percentage Decrease",
  "signature": {
    "structure": "Price decrease → consumption increase for same expenditure",
    "embedding_text": "If price of an item decreases by X%, by what percentage should consumption be increased to keep the expenditure same",
    "keywords": ["price", "decrease", "consumption", "expenditure"],
    "variables": ["decrease_percent"]
  }
}
```

**Why this matters:**

User queries only get number normalization at runtime (`20%` → `X%`). The pattern's `embedding_text` must be generic enough (using "an item", "A sells to B", etc.) to semantically match variations.

The embedding model handles semantic similarity between:
- User: "price of oil decreases by X%"
- Pattern: "price of an item decreases by X%"

These are semantically close because "oil" and "an item" are related concepts. The `embedding_text` acts as a semantic anchor that pulls in variations.

### Questions

Questions do NOT need `embedding_text`. They are stored with original text for:
- Display to users
- Exact match cases (PYQs)

The pattern's `embedding_text` handles variations.

---

## Code Conventions

- Use TypeScript
- Use ESM imports (`.js` extension)
- Hono for HTTP routing
- Zod for validation

## Directory Structure

```
jeet/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── repositories/  # Database access
│   │   └── utils/     # Helpers
│   └── scripts/       # CLI tools
├── content/           # JSON content files
│   └── topics/        # Topic folders with patterns/questions
└── docs/              # Documentation
```

## Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run seed             # Import content from JSON
npm run generate-embeddings -- --all  # Regenerate all embeddings

# Database
docker-compose up -d postgres  # Start PostgreSQL
```
