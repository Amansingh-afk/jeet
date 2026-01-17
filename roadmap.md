# Jeet Roadmap

> From idea to "Jeetu Bhaiya se padha"

---

## Vision

Build the most effective SSC exam preparation mentor - one that teaches tricks, not textbooks.

---

## Phase 0: Foundation

**Goal**: Structure the knowledge base

| Task | Status | Notes |
|------|--------|-------|
| Define data schema | Done | See docs/schema.md |
| Set up content structure | Done | See content/ folder |
| Document architecture | Done | See docs/architecture.md |
| Create pattern authoring guide | Done | See docs/pattern-authoring.md |

---

## Phase 1: Content Pipeline

**Goal**: Extract and structure 8000 questions into ~500 patterns

### 1.1 Source Collection
- [ ] Gather all source PDFs
  - [ ] Rakesh Yadav 7300+
  - [ ] Kiran's SSC Mathematics
  - [ ] PYQ papers (2018-2024)
  - [ ] Topic-wise PDFs
- [ ] Organize in /sources folder

### 1.2 Question Extraction
- [ ] Build extraction script (Claude API + Vision)
- [ ] Extract questions from all sources
- [ ] Deduplicate questions
- [ ] Output: questions-raw.json (~8000 questions)

### 1.3 Pattern Clustering
- [ ] Generate embeddings for all questions
- [ ] Run clustering algorithm
- [ ] Build review interface
- [ ] Manually verify and name clusters
- [ ] Output: patterns-draft.json (~500 patterns)

### 1.4 Trick Authoring
Priority order (by exam weightage):

| Topic | Patterns | Status |
|-------|----------|--------|
| Profit & Loss | ~45 | Not Started |
| Time & Work | ~35 | Not Started |
| Time & Distance | ~40 | Not Started |
| Percentage | ~30 | Not Started |
| Ratio & Proportion | ~35 | Not Started |
| Geometry | ~60 | Not Started |
| Mensuration | ~50 | Not Started |
| Number System | ~40 | Not Started |
| Algebra | ~45 | Not Started |
| Trigonometry | ~40 | Not Started |
| Average | ~25 | Not Started |
| SI & CI | ~45 | Not Started |
| Mixture | ~30 | Not Started |
| DI | ~30 | Not Started |

### 1.5 Visual Templates
- [ ] Identify patterns needing diagrams
- [ ] Create Excalidraw templates
- [ ] Link templates to patterns

---

## Phase 2: MVP App

**Goal**: Working app with 1-2 complete topics

### 2.1 Backend
- [x] Set up PostgreSQL + pgvector
- [x] Import content to database
- [x] Build pattern matching API
- [x] Integrate LLM (Claude Haiku / GPT-4o-mini)
- [x] Build response generation pipeline

### 2.2 Frontend
- [x] Chat interface (React Native / Next.js)
- [x] Excalidraw rendering
- [ ] User onboarding flow
- [ ] Basic progress tracking

### 2.3 Jeetu Personality
- [x] Write system prompt for Jeetu Bhaiya
- [ ] Test Hinglish responses
- [ ] Tune teaching style
- [ ] Test with sample students

### 2.4 Launch MVP
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Beta test with 50-100 students
- [ ] Collect feedback

---

## Phase 3: Complete Content

**Goal**: All ~500 patterns documented

### 3.1 Remaining Topics
- [ ] Complete all topic trick authoring
- [ ] Create all visual templates
- [ ] Hindi translations for questions

### 3.2 Quality Assurance
- [ ] Validate all patterns
- [ ] Test time targets
- [ ] Review teaching content

---

## Phase 4: Adaptive Learning

**Goal**: Personalized learning paths

### 4.1 Progress Tracking
- [ ] Track per-pattern mastery
- [ ] Implement level progression (deep → shortcut → instant)
- [ ] Spaced repetition for weak patterns

### 4.2 Student Analytics
- [ ] Accuracy tracking
- [ ] Speed improvement
- [ ] Weak area identification

### 4.3 Adaptive Recommendations
- [ ] Daily practice suggestions
- [ ] Focus on weak patterns
- [ ] Exam-specific prep plans

---

## Phase 5: Scale

**Goal**: Sustainable unit economics

### 5.1 Fine-tuning
- [ ] Collect conversation data (with consent)
- [ ] Prepare training dataset
- [ ] Fine-tune Mistral 7B on Jeetu personality
- [ ] Fine-tune on trick-based solutions
- [ ] Deploy self-hosted model

### 5.2 Hybrid Routing
- [ ] Route simple queries to fine-tuned model
- [ ] Route complex math to API fallback
- [ ] Monitor quality and costs

### 5.3 Monetization
- [ ] Launch paid tier (₹399/month)
- [ ] Premium content (notes, PDFs)
- [ ] B2B coaching partnerships

---

## Phase 6: Expansion

**Goal**: Beyond SSC Math

### 6.1 SSC Complete
- [ ] Reasoning module
- [ ] English module
- [ ] General Studies module

### 6.2 Other Exams
- [ ] Bank exams (IBPS, SBI)
- [ ] Railway exams
- [ ] State PSC

---

## Key Metrics

### Content Metrics
| Metric | Target |
|--------|--------|
| Questions extracted | 8,000 |
| Patterns documented | 500 |
| Patterns with tricks | 500 (100%) |
| Visual templates | 150 |

### Product Metrics
| Metric | Target |
|--------|--------|
| Daily active users | Track |
| Questions answered/day | Track |
| Avg session length | Track |
| Pattern mastery rate | Track |

### Business Metrics
| Metric | Target |
|--------|--------|
| Paid subscribers | Track |
| Monthly revenue | Track |
| Cost per user | < ₹100/month |
| Churn rate | < 10%/month |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Trick authoring takes too long | Delays launch | Hire SSC experts, start with 2 topics for MVP |
| LLM gives wrong answers | Lost trust | Pattern matching + validation, human review |
| High API costs | Negative unit economics | Fine-tune early, implement usage limits |
| Low student engagement | Failed product | Test with real students early, iterate on Jeetu personality |
| Competition copies approach | Market share | Speed + execution, build brand around "Jeetu Bhaiya" |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01 | Pattern-first over pure LLM | Finite problem space (8K questions), need consistent tricks |
| 2025-01 | Excalidraw for visuals | Hand-drawn feel, JSON-based, React-friendly |
| 2025-01 | Start with API, fine-tune later | Validate product first, collect data for fine-tuning |
| 2025-01 | PostgreSQL + pgvector | Single DB, simple ops, sufficient scale |

---

## Future Vision: Self-Hosted Fine-Tuned Models

**Goal**: Reduce API costs by 60-80% at scale through self-hosted fine-tuned models

### Current Architecture (Phase 1-4)
```
User Question
    ↓
OpenAI Embedding API → Pattern Match ($0.02/1M tokens)
    ↓
OpenAI GPT-4o-mini → Response ($0.15/1M tokens)
    ↓
Cost: ~$0.17 per question
```

### Future Architecture (Phase 5+)
```
User Question
    ↓
Fine-tuned 7B Model (self-hosted)
    ├─ Pattern Classification
    └─ Value Extraction
    ↓
Fine-tuned 40B Model (self-hosted)
    └─ Response Generation (Jeetu Bhaiya style)
    ↓
Cost: ~$0.001-0.01 per question (compute only)
Savings: 60-80% at scale
```

### Model Selection

| Model | Use Case | Infrastructure | Cost/Month |
|-------|----------|----------------|------------|
| **7B Model** (Llama 3.1 8B / Mistral 7B) | Pattern matching, classification | 1x A10G GPU | ~$1,000 |
| **40B Model** (Llama 3.1 70B quantized / Mixtral 8x7B) | Response generation | 4x A100 GPU cluster | ~$4,000 |
`

### Cost Comparison

| Scale | Current (OpenAI API) | Future (Self-hosted) | Savings |
|-------|---------------------|----------------------|---------|
| 1M questions/month | $170/month | $1,000/month (fixed) | -$830 (not worth it) |
| 5M questions/month | $850/month | $1,000/month (fixed) | -$150 (break-even) |
| 10M questions/month | $1,700/month | $1,000/month (fixed) | **$700/month** |
| 50M questions/month | $8,500/month | $4,000/month (40B model) | **$4,500/month** |

**Switch Point**: When volume reaches 5-10M questions/month or revenue > $5k/month

---

## Long-Term Vision (5+ Years)

**Goal**: Become the definitive SSC exam preparation platform

### Content Expansion
- All SSC subjects (Math, Reasoning, English, GS)
- All major competitive exams (Bank, Railway, State PSC)
- Regional language support (Hindi, Telugu, Bengali, etc.)

### Technology Evolution
- Multi-modal AI (voice, video explanations)
- Personalized AI tutors per student
- Real-time exam simulation

### Business Model
- Freemium → Premium subscriptions
- B2B partnerships with coaching institutes
- Government contracts for exam prep
