# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         JEET SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────────┐   │
│  │  Student │───▶│   Question   │───▶│  Pattern Matcher    │   │
│  │   Input  │    │   Parser     │    │  (Semantic Search)  │   │
│  └──────────┘    └──────────────┘    └──────────┬──────────┘   │
│                                                  │               │
│                                                  ▼               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    KNOWLEDGE BASE                         │   │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │   │
│  │  │ Topics  │  │ Patterns │  │ Questions │  │Templates │  │   │
│  │  │  (30)   │  │  (500+)  │  │  (8000)   │  │  (150)   │  │   │
│  │  └─────────┘  └──────────┘  └───────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                  │               │
│                                                  ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   Trick +    │───▶│     LLM      │───▶│  Response with   │   │
│  │   Template   │    │   Adapter    │    │  Diagram (JSON)  │   │
│  └──────────────┘    └──────────────┘    └──────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Question Parser
Extracts structure from student's natural language question.

```
Input:  "A sells to B at 20% profit, B sells to C at 25% profit. C pays 600. A ka cost?"
Output: {
  "type": "word_problem",
  "detected_topic": "profit-loss",
  "extracted_values": {"profit1": 20, "profit2": 25, "final": 600},
  "language": "hinglish"
}
```

**Tech**: GPT-4o-mini / Claude Haiku (structured output mode)

### 2. Pattern Matcher
Finds the matching pattern using a two-tier semantic search strategy.

```
Input:  User question text
Output: {
  "pattern_id": "pl-007",
  "confidence": 0.94,
  "pattern_name": "Successive Profit/Loss",
  "matched_via": "question"  // or "pattern"
}
```

**Tech**: pgvector similarity search (cosine distance)

#### Two-Tier Matching Strategy

**Tier 1: Question Matching (High Accuracy)**
- Search against stored question embeddings
- Threshold: **0.85** (near-exact match required)
- If match found → use that question's pattern (100% accurate)
- This handles repeat/similar questions perfectly

**Tier 2: Pattern Matching (Fallback)**
- Search against pattern embeddings
- Threshold: **0.55** (more lenient for novel questions)
- Returns top-K alternatives if no confident match

```
User Question
     │
     ▼
┌─────────────────────┐
│ Generate Embedding  │  (OpenAI text-embedding-3-small)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     Match ≥ 0.85
│ Search Questions DB │ ──────────────────▶ Use Question's Pattern ✓
└──────────┬──────────┘
           │ No match
           ▼
┌─────────────────────┐     Match ≥ 0.55
│ Search Patterns DB  │ ──────────────────▶ Use Pattern ✓
└──────────┬──────────┘
           │ No match
           ▼
    Return alternatives
    (user picks or rephrase)
```

#### Embedding Configuration

**Model**: `text-embedding-3-small` (OpenAI)
- Dimensions: 1536
- Cost-effective, good accuracy for our use case

#### Number Normalization

All text is normalized before embedding to improve matching across variations.
Numbers are replaced with `X` so that "salt 20%" and "oil 30%" become equivalent.

```typescript
normalizeForEmbedding(text: string): string {
  return text
    .replace(/\d+(\.\d+)?%/g, 'X%')           // 20% → X%
    .replace(/₹\s?\d[\d,]*/g, '₹X')           // ₹500 → ₹X
    .replace(/Rs\.?\s?\d[\d,]*/gi, 'Rs X')    // Rs 500 → Rs X
    .replace(/\b\d[\d,]*(\.\d+)?\b/g, 'X');   // 5 years → X years
}
```

**Example:**
```
Input:  "If price of salt decreases by 20%, by how much should consumption increase?"
Output: "If price of salt decreases by X%, by how much should consumption increase?"
```

Items (salt/oil) and names (A/B/Ram) are NOT normalized - the embedding model handles their semantic similarity naturally. Only numbers need normalization because "20" and "30" have no semantic relationship.

**Pattern Embedding Text Formula**:
```
IF signature.embedding_text exists:
  use signature.embedding_text directly
ELSE:
  normalize(signature.structure + signature.keywords + signature.variations)
```

Patterns can optionally provide a custom `embedding_text` for precise control.

**Question Embedding Text Formula**:
```
normalize(text_en)
```

**User Query Processing**:
```
normalize(user_input) → generate_embedding → search
```

#### Index Configuration

Uses IVFFlat indexes for approximate nearest neighbor search:
```sql
CREATE INDEX idx_patterns_embedding
ON patterns USING ivfflat (embedding vector_cosine_ops)
WITH (lists = sqrt(row_count));

CREATE INDEX idx_questions_embedding
ON questions USING ivfflat (embedding vector_cosine_ops)
WITH (lists = sqrt(row_count));
```

Lists are auto-calculated based on row count for optimal performance

### 3. Knowledge Base
The structured content repository.

| Entity | Count | Storage |
|--------|-------|---------|
| Topics | 25-30 | Postgres |
| Patterns | 400-800 | Postgres + pgvector |
| Questions | 8000 | Postgres + pgvector |
| Excalidraw Templates | 100-150 | S3 / JSON files |

### 4. LLM Adapter
Takes pattern + trick + student's values → generates personalized response.

```
Input: {
  pattern: "pl-007 (Successive Profit/Loss)",
  trick: "Reverse fraction method",
  values: {profit1: 20, profit2: 25, final: 600},
  student_level: "shortcut",
  language: "hinglish"
}

Output: {
  explanation: "Dekh bhai, successive profit mein...",
  solution_steps: [...],
  excalidraw_json: {...},
  answer: 400
}
```

**Tech**: GPT-4o-mini / Claude Haiku (MVP) → Fine-tuned Mistral (scale)

### 5. Response Renderer
Combines text + Excalidraw JSON for frontend.

```
Frontend receives:
{
  "message": "Dekh bhai...",
  "diagram": { /* Excalidraw JSON */ },
  "answer": 400,
  "time_target": "30 sec mein ho jana chahiye"
}
```

---

## Data Flow

### Answering a Question

```
1. Student asks question (chat interface)
                │
                ▼
2. Parse question → extract values, detect topic
                │
                ▼
3. Generate embedding → search similar patterns
                │
                ▼
4. Retrieve: pattern + trick + template
                │
                ▼
5. LLM adapts trick to student's values
                │
                ▼
6. Render response with diagram
                │
                ▼
7. Log interaction for analytics + future training
```

### Progressive Teaching

Same pattern, different depth based on student history:

```
Attempt 1-3:   "deep" explanation
              - Full concept
              - Why the trick works
              - Common mistakes

Attempt 4-8:   "shortcut" explanation
              - Just the trick steps
              - Quick application

Attempt 9+:   "instant" mode
              - Direct answer approach
              - "Dekh ke hi pata chal jana chahiye"
```

---

## Tech Stack (Recommended)

### MVP Phase
```
Frontend:     React Native (mobile) / Next.js (web)
Backend:      Node.js / Python FastAPI
Database:     PostgreSQL + pgvector
LLM:          Claude Haiku / GPT-4o-mini (API)
Storage:      S3 / Cloudflare R2
Hosting:      Vercel / Railway / Render
```

### Scale Phase
```
LLM:          Fine-tuned Mistral 7B (self-hosted)
Infra:        Modal / RunPod for GPU
Cache:        Redis (frequent patterns)
CDN:          Cloudflare (static content)
```

---

## Key Design Decisions

### Why Pattern Matching over Pure LLM?

| Pure LLM | Pattern Matching |
|----------|------------------|
| Generates solution from scratch | Retrieves known trick |
| May use textbook method | Always uses SSC shortcut |
| Inconsistent | Same trick every time |
| Expensive (high tokens) | Cheap (minimal LLM work) |
| Can hallucinate | Near-zero hallucination |

### Why Two-Tier Matching (Questions → Patterns)?

| Direct Pattern Matching | Two-Tier (Questions First) |
|------------------------|---------------------------|
| ~60-70% similarity for exact questions | ~95%+ for stored questions |
| Pattern embedding is diluted by metadata | Question embedding is pure text |
| Novel questions only | Handles repeats perfectly |
| One threshold fits all | High bar for known, lenient for novel |

The insight: SSC has ~8000 questions mapping to ~500 patterns. Most user questions will be similar to stored ones. Match questions first (0.85 threshold), fall back to patterns (0.55) for truly novel questions.

### Why Postgres + pgvector?

- Single database for everything (simple ops)
- pgvector is production-ready for our scale (10K vectors is tiny)
- Avoid separate vector DB complexity (Pinecone, Weaviate)
- Easy joins: find pattern → get questions → get template

### Why Excalidraw?

- Hand-drawn aesthetic = "teacher drawing on board" feel
- JSON-based = LLM can generate/modify
- React component = easy frontend integration
- Open source = no vendor lock-in
