# Data Schema

Complete schema definitions for all Jeet entities.

---

## Entity Relationship

```
┌─────────┐       ┌──────────┐       ┌──────────┐
│  TOPIC  │──1:N──│ PATTERN  │──1:N──│ QUESTION │
└─────────┘       └──────────┘       └──────────┘
                       │
                       │ N:1
                       ▼
                 ┌──────────┐
                 │ TEMPLATE │
                 └──────────┘
```

---

## 1. Topic

Top-level category (e.g., Profit & Loss, Time & Work).

```json
{
  "id": "profit-loss",
  "name": "Profit & Loss",
  "name_hi": "लाभ और हानि",
  "slug": "profit-loss",
  "order": 3,
  "icon": "percent",
  "color": "#4CAF50",
  "description": "Cost price, selling price, profit, loss, discounts, marked price",
  "pattern_count": 45,
  "question_count": 380,
  "difficulty_distribution": {
    "easy": 0.3,
    "medium": 0.5,
    "hard": 0.2
  },
  "estimated_hours": 12,
  "prerequisites": ["percentage", "ratio-proportion"],
  "exam_weightage": {
    "CGL": "5-7 questions",
    "CHSL": "4-5 questions",
    "MTS": "3-4 questions"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (kebab-case) |
| name | string | Yes | Display name (English) |
| name_hi | string | Yes | Display name (Hindi) |
| slug | string | Yes | URL-safe identifier |
| order | number | Yes | Display order in syllabus |
| icon | string | No | Icon identifier |
| color | string | No | Theme color (hex) |
| pattern_count | number | Auto | Computed from patterns |
| question_count | number | Auto | Computed from questions |
| prerequisites | array | No | Topic IDs to study first |
| exam_weightage | object | No | Questions per exam type |

---

## 2. Pattern

The core entity. Represents a problem type with its trick.

```json
{
  "id": "pl-007",
  "topic_id": "profit-loss",
  "name": "Successive Profit/Loss",
  "name_hi": "क्रमिक लाभ/हानि",
  "slug": "successive-profit-loss",

  "signature": {
    "embedding_text": "A sells to B at X percent profit, B sells to C at Y percent profit, find original cost if final price is given",
    "question_template": "A sells an article to B at [X]% profit. B sells to C at [Y]% profit. If C pays [Z], what did A pay?",
    "structure": "A sells to B at X%, B sells to C at Y%, find original",
    "keywords": ["sells to", "profit", "then sells", "finally", "successive", "chain"],
    "variables": ["profit_1", "profit_2", "final_price"],
    "variations": [
      "Multiple profit chain calculation",
      "Find original cost after successive profits",
      "Chain of sales with profit percentages"
    ]
  },

  "trick": {
    "name": "Fraction Reversal",
    "name_hi": "उल्टा भिन्न विधि",
    "one_liner": "Profit % को fraction में बदलो, उल्टा करके multiply करो",
    "steps": [
      {
        "step": 1,
        "action": "Convert profit % to fraction",
        "example": "20% profit = sells at 6/5 of CP",
        "example_hi": "20% लाभ = CP का 6/5 पर बेचा"
      },
      {
        "step": 2,
        "action": "Reverse the fraction for backward calculation",
        "example": "To find CP from SP: multiply by 5/6",
        "example_hi": "CP निकालने के लिए: 5/6 से multiply करो"
      },
      {
        "step": 3,
        "action": "Chain multiply all reversed fractions",
        "example": "600 × 5/6 × 4/5 = 400",
        "example_hi": "600 × 5/6 × 4/5 = 400"
      }
    ],
    "formula": "CP = Final × (100/(100+P₁)) × (100/(100+P₂))",
    "formula_simple": "Ulta fraction multiply karo",
    "memory_hook": "Profit mein zyada milta hai, toh wapas jaane ke liye kam karo",

    "alternatives": [
      {
        "name": "Direct Formula Method",
        "name_hi": "सीधा फॉर्मूला विधि",
        "one_liner": "CP = Final ÷ (1+P₁%)(1+P₂%)",
        "when_to_use": "Jab percentage clean fraction na bane (17%, 23%)",
        "steps": [
          {
            "step": 1,
            "action": "Convert percentages to decimals and add 1",
            "example": "20% → 1.20, 25% → 1.25"
          },
          {
            "step": 2,
            "action": "Multiply all multipliers",
            "example": "1.20 × 1.25 = 1.50"
          },
          {
            "step": 3,
            "action": "Divide final price by result",
            "example": "600 ÷ 1.50 = 400"
          }
        ]
      }
    ]
  },

  "common_mistakes": [
    {
      "mistake": "Adding percentages directly",
      "wrong": "20% + 25% = 45% total profit",
      "right": "Multiply fractions: 6/5 × 5/4 = 6/4 = 50% total"
    },
    {
      "mistake": "Forgetting to reverse",
      "wrong": "600 × 6/5 × 5/4 (going forward instead of backward)",
      "right": "600 × 5/6 × 4/5 (reversing to find original)"
    }
  ],

  "teaching": {
    "deep": {
      "explanation": "Dekh bhai, jab successive profit hota hai, matlab ek ke baad ek profit le raha hai. Toh hum seedha add nahi kar sakte percentages ko...",
      "duration": "3-4 minutes",
      "includes": ["concept", "why_it_works", "derivation", "mistakes"]
    },
    "shortcut": {
      "explanation": "Simple hai - profit percentage ko fraction mein badlo. 20% = 6/5. Ab ulta karo = 5/6. Multiply kar do.",
      "duration": "1 minute",
      "includes": ["trick_steps", "quick_example"]
    },
    "instant": {
      "explanation": "Chain profit? Ulta fraction, multiply, done.",
      "duration": "10 seconds",
      "includes": ["one_liner"]
    }
  },

  "visual": {
    "has_diagram": true,
    "template_id": "flow-chain-3",
    "description": "Flow diagram: A → B → C with percentages on arrows",
    "when_to_show": "always"
  },

  "prerequisites": {
    "patterns": ["pl-001", "pl-003"],
    "concepts": ["percentage-to-fraction", "reverse-calculation"]
  },

  "metadata": {
    "difficulty": 2,
    "frequency": "high",
    "years_appeared": [2019, 2020, 2021, 2022, 2023, 2024],
    "avg_time_target_seconds": 30,
    "related_patterns": ["pl-008", "pl-009"],
    "tags": ["successive", "chain", "multiple-transactions"]
  },

  "embedding": null
}
```

### Pattern Fields Reference

| Section | Field | Description |
|---------|-------|-------------|
| **Core** | id | Unique ID (topic prefix + number) |
| | topic_id | Parent topic |
| | name/name_hi | Pattern name in both languages |
| **Signature** | embedding_text | **REQUIRED** - Generic normalized text for embedding matching |
| | question_template | Fill-in-blank template with [X], [Y], [ITEM] placeholders |
| | structure | Short abstract problem structure description |
| | keywords | Structural words that identify this pattern |
| | variables | What values to extract from question |
| | variations | Different phrasings of the same pattern |
| **Trick** | one_liner | The trick in one Hinglish sentence |
| | steps | Step-by-step trick application |
| | formula | Mathematical formula (optional) |
| | memory_hook | Mnemonic to remember |
| | alternatives | Other methods for same pattern (optional) |
| **Teaching** | deep | Full explanation for beginners |
| | shortcut | Quick method for intermediate |
| | instant | One-liner for advanced |
| **Visual** | template_id | Excalidraw template to use |
| | when_to_show | always / on_request / first_time |
| **Prerequisites** | patterns | Pattern IDs student should know first |
| | concepts | Abstract concepts needed (for display) |
| **Metadata** | difficulty | 1-5 scale |
| | frequency | low / medium / high |
| | avg_time_target | Seconds to solve |

---

## 3. Question

Individual question linked to a pattern.

```json
{
  "id": "pl-007-q-001",
  "pattern_id": "pl-007",
  "topic_id": "profit-loss",

  "text": {
    "en": "A sells an article to B at 20% profit. B sells it to C at 25% profit. If C pays ₹600, what did A pay for the article?",
    "hi": "A एक वस्तु B को 20% लाभ पर बेचता है। B इसे C को 25% लाभ पर बेचता है। यदि C ₹600 देता है, तो A ने वस्तु के लिए कितना भुगतान किया?"
  },

  "options": {
    "a": "₹350",
    "b": "₹400",
    "c": "₹450",
    "d": "₹500"
  },
  "correct": "b",

  "extracted_values": {
    "profit_1": 20,
    "profit_2": 25,
    "final_price": 600,
    "unit": "rupees"
  },

  "solution": {
    "trick_application": [
      "20% profit → fraction = 6/5 → reverse = 5/6",
      "25% profit → fraction = 5/4 → reverse = 4/5",
      "A's CP = 600 × 5/6 × 4/5",
      "= 600 × 20/30 = 600 × 2/3 = ₹400"
    ],
    "answer": 400,
    "answer_display": "₹400"
  },

  "source": {
    "book": "Rakesh Yadav 7300+",
    "edition": "2023",
    "chapter": 5,
    "chapter_name": "Profit and Loss",
    "question_number": 234,
    "page": 87
  },

  "exam_history": [
    {
      "exam": "SSC CGL",
      "tier": 1,
      "year": 2022,
      "date": "2022-08-12",
      "shift": 2
    }
  ],

  "difficulty": 2,
  "is_pyq": true,

  "embedding": null
}
```

### Question Fields Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Pattern ID + question number |
| pattern_id | string | Yes | Linked pattern |
| text.en | string | Yes | Question in English |
| text.hi | string | Yes | Question in Hindi |
| options | object | Yes | MCQ options (a, b, c, d) |
| correct | string | Yes | Correct option key |
| extracted_values | object | Yes | Parsed values from question |
| solution | object | Yes | Trick-based solution |
| source | object | Yes | Book/exam source |
| is_pyq | boolean | No | Is Previous Year Question |

---

## 4. Excalidraw Template

Visual diagram template for patterns.

```json
{
  "id": "flow-chain-3",
  "name": "Flow Chain (3 entities)",
  "category": "flow",
  "description": "A → B → C flow with labels on arrows",

  "params": [
    {
      "name": "entity_1",
      "type": "text",
      "default": "A",
      "position": "box_1_center"
    },
    {
      "name": "entity_2",
      "type": "text",
      "default": "B",
      "position": "box_2_center"
    },
    {
      "name": "entity_3",
      "type": "text",
      "default": "C",
      "position": "box_3_center"
    },
    {
      "name": "arrow_1_label",
      "type": "text",
      "default": "",
      "position": "above_arrow_1"
    },
    {
      "name": "arrow_2_label",
      "type": "text",
      "default": "",
      "position": "above_arrow_2"
    },
    {
      "name": "value_1",
      "type": "text",
      "default": "",
      "position": "below_box_1"
    },
    {
      "name": "value_3",
      "type": "text",
      "default": "",
      "position": "below_box_3"
    }
  ],

  "base_elements": [
    {
      "type": "rectangle",
      "id": "box_1",
      "x": 100,
      "y": 100,
      "width": 80,
      "height": 50,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "#a5d8ff",
      "fillStyle": "solid",
      "roughness": 1
    },
    {
      "type": "arrow",
      "id": "arrow_1",
      "points": [[180, 125], [260, 125]],
      "strokeColor": "#1e1e1e",
      "roughness": 1
    }
  ],

  "preview_url": "/templates/previews/flow-chain-3.png",

  "use_cases": [
    "Successive profit/loss",
    "Commission chains",
    "Multi-step transactions"
  ]
}
```

---

## 5. Student Progress

Tracks student's mastery per pattern.

```json
{
  "user_id": "user_abc123",
  "pattern_id": "pl-007",

  "stats": {
    "attempts": 12,
    "correct": 9,
    "accuracy": 0.75,
    "streak": 3
  },

  "timing": {
    "avg_seconds": 45,
    "best_seconds": 28,
    "target_seconds": 30,
    "improving": true
  },

  "level": "shortcut",
  "level_progression": {
    "deep": {"completed": true, "attempts": 3},
    "shortcut": {"completed": false, "attempts": 5},
    "instant": {"completed": false, "attempts": 0}
  },

  "history": {
    "first_seen": "2025-01-05T10:30:00Z",
    "last_seen": "2025-01-10T14:20:00Z",
    "next_review": "2025-01-15T00:00:00Z"
  },

  "notes": []
}
```

### Level Progression Rules

```
Start: "deep"
  ↓
After 3 correct in a row → "shortcut"
  ↓
After 5 correct + avg_time < target → "instant"
  ↓
If accuracy drops below 60% → regress one level
```

---

## Database Tables (PostgreSQL)

```sql
-- Topics
CREATE TABLE topics (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Patterns
CREATE TABLE patterns (
  id VARCHAR(50) PRIMARY KEY,
  topic_id VARCHAR(50) REFERENCES topics(id),
  name VARCHAR(200) NOT NULL,
  name_hi VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  signature JSONB NOT NULL,
  trick JSONB NOT NULL,
  teaching JSONB NOT NULL,
  visual JSONB,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (
  id VARCHAR(100) PRIMARY KEY,
  pattern_id VARCHAR(50) REFERENCES patterns(id),
  topic_id VARCHAR(50) REFERENCES topics(id),
  text_en TEXT NOT NULL,
  text_hi TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option CHAR(1) NOT NULL,
  extracted_values JSONB NOT NULL,
  solution JSONB NOT NULL,
  source JSONB NOT NULL,
  difficulty SMALLINT DEFAULT 2,
  is_pyq BOOLEAN DEFAULT FALSE,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  params JSONB NOT NULL,
  base_elements JSONB NOT NULL,
  preview_url TEXT
);

-- Student Progress
CREATE TABLE student_progress (
  user_id VARCHAR(100),
  pattern_id VARCHAR(50) REFERENCES patterns(id),
  stats JSONB NOT NULL DEFAULT '{}',
  timing JSONB NOT NULL DEFAULT '{}',
  level VARCHAR(20) DEFAULT 'deep',
  history JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, pattern_id)
);

-- Indexes
CREATE INDEX idx_patterns_topic ON patterns(topic_id);
CREATE INDEX idx_patterns_embedding ON patterns USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_questions_pattern ON questions(pattern_id);
CREATE INDEX idx_questions_embedding ON questions USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_progress_user ON student_progress(user_id);
```

---

## Naming Conventions

| Entity | ID Format | Example |
|--------|-----------|---------|
| Topic | kebab-case | `profit-loss` |
| Pattern | topic-prefix + 3-digit | `pl-007` |
| Question | pattern-id + q + 3-digit | `pl-007-q-001` |
| Template | category + name | `flow-chain-3` |

## File Naming

```
content/
  topics/
    profit-loss/
      meta.json              # Topic definition
      patterns/
        pl-001.json          # Pattern file
        pl-002.json
      questions/
        pl-001-q-001.json    # Question file
        pl-001-q-002.json
```
