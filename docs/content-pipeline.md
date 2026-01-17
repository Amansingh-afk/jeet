# Content Pipeline

How to transform raw PDFs into structured Jeet content.

---

## Pipeline Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Source    │────▶│   Extract   │────▶│   Cluster   │────▶│   Author    │
│   PDFs      │     │  Questions  │     │  Patterns   │     │   Tricks    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                   │                    │
                          ▼                   ▼                    ▼
                    questions.json      patterns.json        final content
                    (raw, unlinked)     (auto-clustered)     (human-verified)
```

---

## Phase 1: Source Collection

### Gather Materials

| Source | Type | Priority |
|--------|------|----------|
| Rakesh Yadav 7300+ | PDF | High |
| Kiran's SSC Mathematics | PDF | High |
| Previous Year Papers (2018-2024) | PDF | High |
| Paramount Advance | PDF | Medium |
| Individual topic PDFs | PDF | Medium |

### Organize Sources

```
/sources
  /books
    rakesh-yadav-7300-2023.pdf
    kiran-ssc-math-2022.pdf
  /pyq
    cgl-2024-all-shifts.pdf
    chsl-2023-all-shifts.pdf
  /topic-wise
    profit-loss-500-questions.pdf
    time-work-300-questions.pdf
```

---

## Phase 2: Question Extraction

### Option A: LLM Extraction (Recommended)

Use Claude/GPT to extract structured questions from PDF.

**Prompt template:**
```
Extract all questions from this page as JSON. For each question:
1. Question text (exactly as written)
2. Options (a, b, c, d)
3. Correct answer
4. Topic (your best guess)
5. Source info (book name, page, question number)

Output format:
[
  {
    "text": "...",
    "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
    "correct": "b",
    "topic_guess": "profit-loss",
    "source": {"book": "...", "page": 45, "qno": 123}
  }
]
```

**Process:**
1. Convert PDF to images (one per page)
2. Send each image to Claude with extraction prompt
3. Collect JSON responses
4. Merge and deduplicate

### Option B: OCR + Parsing

For structured PDFs with consistent formatting:

1. Use `pdfplumber` or `PyMuPDF` for text extraction
2. Regex patterns to identify question boundaries
3. Parse options (look for a), b), c), d) patterns)
4. Manual verification for accuracy

### Output: Raw Questions

```json
// questions-raw.json
[
  {
    "id": "raw-0001",
    "text": "A sells an article to B at 20% profit...",
    "text_hi": null,
    "options": {"a": "350", "b": "400", "c": "450", "d": "500"},
    "correct": "b",
    "topic_guess": "profit-loss",
    "source": {
      "book": "Rakesh Yadav 7300+",
      "page": 87,
      "question_number": 234
    },
    "extracted_at": "2025-01-10",
    "verified": false
  }
]
```

---

## Phase 3: Pattern Clustering

### Goal

Group 8000 questions into ~500 patterns automatically, then refine manually.

### Step 1: Generate Embeddings

```python
import openai

def embed_question(text):
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# Embed all questions
for q in questions:
    q['embedding'] = embed_question(q['text'])
```

### Step 2: Cluster Similar Questions

```python
from sklearn.cluster import KMeans
import numpy as np

embeddings = np.array([q['embedding'] for q in questions])

# Start with ~500 clusters (adjust based on results)
kmeans = KMeans(n_clusters=500, random_state=42)
clusters = kmeans.fit_predict(embeddings)

# Assign cluster to each question
for i, q in enumerate(questions):
    q['auto_cluster'] = int(clusters[i])
```

### Step 3: Review Clusters

For each cluster:
1. Sample 5-10 questions
2. Verify they're the same pattern
3. Name the pattern
4. Split if multiple patterns mixed
5. Merge if same pattern split

**Cluster review interface (build or use spreadsheet):**
```
Cluster 47 (23 questions)
─────────────────────────
Sample questions:
1. A sells to B at 20%, B sells to C at 25%...
2. X sells to Y at 15%, Y sells to Z at 10%...
3. P sells to Q at 30%, Q sells to R at 20%...

[ ] Same pattern → Name: _______________
[ ] Split into ___ patterns
[ ] Merge with cluster ___
```

### Output: Pattern Assignments

```json
// patterns-draft.json
[
  {
    "cluster_id": 47,
    "pattern_id": "pl-007",
    "pattern_name": "Successive Profit/Loss",
    "question_ids": ["raw-0234", "raw-0891", "raw-1456", ...],
    "sample_questions": [...],
    "status": "named"
  }
]
```

---

## Phase 4: Trick Authoring

### The Human Work

For each pattern:
1. Open pattern file
2. Watch relevant coaching video OR solve 10+ questions yourself
3. Document the trick (see pattern-authoring.md)
4. Write teaching content (deep/shortcut/instant)
5. Create/assign Excalidraw template

### Batch Processing

Organize by topic. Complete one topic fully before moving to next.

```
Week 1: Profit & Loss (45 patterns)
Week 2: Time & Work (35 patterns)
Week 3: Time & Distance (40 patterns)
...
```

### Verification

After authoring each pattern:
- [ ] Solve 5 questions using the trick
- [ ] Time yourself (must beat target)
- [ ] Read teaching content aloud (must sound like Jeetu)

---

## Phase 5: Hindi Translation

### What Needs Translation

1. Question text → text_hi
2. Pattern name → name_hi
3. Trick one-liner → already Hinglish
4. Teaching content → already Hinglish

### Translation Approach

**For questions:**
```
LLM Prompt: "Translate this SSC math question to Hindi.
Keep numbers and mathematical terms as-is.
Output only the Hindi translation."
```

**For pattern names:**
Manual translation (only 500 items).

---

## Phase 6: Embedding Generation

### Final Embeddings

Once content is finalized, generate embeddings for:
1. All patterns (for pattern matching)
2. All questions (for similar question search)

```python
# Pattern embedding: combine signature + trick one-liner
pattern_text = f"{pattern['signature']['structure']} {pattern['trick']['one_liner']}"
pattern['embedding'] = embed(pattern_text)

# Question embedding: use question text
question['embedding'] = embed(question['text'])
```

### Store in Database

```sql
-- Update pattern embeddings
UPDATE patterns
SET embedding = $1
WHERE id = $2;

-- Create index for fast search
CREATE INDEX ON patterns
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## Phase 7: Quality Assurance

### Automated Checks

```python
def validate_pattern(pattern):
    errors = []

    # Must have one-liner
    if not pattern['trick'].get('one_liner'):
        errors.append("Missing trick one-liner")

    # Must have all teaching levels
    for level in ['deep', 'shortcut', 'instant']:
        if not pattern['teaching'].get(level, {}).get('explanation'):
            errors.append(f"Missing {level} teaching")

    # Must have at least 3 linked questions
    if len(pattern.get('question_ids', [])) < 3:
        errors.append("Less than 3 questions linked")

    # Time target must be set
    if not pattern['metadata'].get('avg_time_target_seconds'):
        errors.append("Missing time target")

    return errors
```

### Manual Spot Checks

Random sample 10% of patterns:
- Solve a question using documented trick
- Verify time target is achievable
- Read teaching aloud (sounds natural?)

---

## Tools & Scripts

### Recommended Stack

| Task | Tool |
|------|------|
| PDF to images | `pdf2image` (Python) |
| OCR extraction | Claude API with vision |
| Embeddings | OpenAI `text-embedding-3-small` |
| Clustering | scikit-learn |
| Data storage | JSON files → PostgreSQL |
| Review UI | Simple web app or Google Sheets |

### Directory Structure

```
/pipeline
  /scripts
    extract_questions.py
    cluster_patterns.py
    generate_embeddings.py
    validate_content.py
    import_to_db.py
  /data
    /raw
      questions-raw.json
    /clustered
      patterns-draft.json
    /final
      patterns.json
      questions.json
```

---

## Timeline Estimate

| Phase | Work |
|-------|------|
| Source collection | Gather all PDFs |
| Extraction | Process 8000 questions |
| Clustering | Generate clusters + review |
| Trick authoring | 500 patterns (main work) |
| Translation | Hindi for questions |
| QA | Validation + fixes |

The **trick authoring** is the bottleneck. Consider hiring SSC coaching experts for this phase.
