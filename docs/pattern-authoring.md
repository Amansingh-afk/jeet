# Pattern Authoring Guide

How to write high-quality trick patterns for Jeet.

---

## The Goal

Every pattern should enable a student to:
1. **Recognize** the problem type instantly
2. **Apply** a shortcut (not textbook method)
3. **Solve** in under 60 seconds (most under 30)

---

## Pattern Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  PATTERN                                                 │
├─────────────────────────────────────────────────────────┤
│  1. Signature    → How to identify this pattern         │
│  2. Trick        → The shortcut method                  │
│  3. Common Mistakes → What NOT to do                    │
│  4. Teaching     → Deep / Shortcut / Instant versions   │
│  5. Visual       → Excalidraw template (if applicable)  │
└─────────────────────────────────────────────────────────┘
```

---

## Step-by-Step: Writing a Pattern

### Step 1: Identify the Pattern

Look at 10-15 questions of the same type. Ask:
- What makes these similar?
- What values change between questions?
- What stays the same?

**Example**: Successive profit questions
```
Q1: A sells to B at 20%, B sells to C at 25%, C pays 600, find A's cost
Q2: X sells to Y at 15%, Y sells to Z at 10%, Z pays 1265, find X's cost
Q3: P sells to Q at 30%, Q sells to R at 20%, R pays 780, find P's cost
```

Pattern signature:
- Multiple sellers in chain
- Each transaction has a profit %
- Given final price, find original cost

### Step 2: Find the Trick

Ask: "How would a top SSC coaching teacher solve this in 20 seconds?"

**NOT textbook method:**
```
Let CP = x
SP1 = x × 1.20
SP2 = x × 1.20 × 1.25 = 600
x = 400 ❌ (too slow, uses algebra)
```

**SSC trick:**
```
20% profit = 6/5 → reverse = 5/6
25% profit = 5/4 → reverse = 4/5
600 × 5/6 × 4/5 = 400 ✓ (fraction multiplication, no algebra)
```

### Step 3: Write the One-Liner

Distill the trick to one Hinglish sentence a student can remember.

**Good one-liners:**
- "Profit % ko fraction mein badlo, ulta karke multiply karo"
- "LCM lo, efficiency nikalo, divide karo"
- "Ratio mein jo zyada, uska kam"

**Bad one-liners:**
- "Use the formula SP = CP × (1 + P/100)" ← too formulaic
- "Calculate step by step" ← not a trick

### Step 4: Break Down Steps

Write 3-5 concrete steps. Each step should be:
- One action
- With example
- In Hinglish

```json
"steps": [
  {
    "step": 1,
    "action": "Profit % ko fraction mein convert karo",
    "example": "20% = 6/5, 25% = 5/4, 30% = 13/10"
  },
  {
    "step": 2,
    "action": "Fraction ko ulta karo (reverse calculation ke liye)",
    "example": "6/5 → 5/6, 5/4 → 4/5"
  },
  {
    "step": 3,
    "action": "Final price se multiply karo saare ulte fractions",
    "example": "600 × 5/6 × 4/5 = 400"
  }
]
```

### Step 5: Document Common Mistakes

What do students typically do wrong?

```json
"common_mistakes": [
  {
    "mistake": "Percentages add kar dete hain",
    "wrong": "20% + 25% = 45% profit",
    "right": "6/5 × 5/4 = 6/4 = 50% profit (multiply, don't add)"
  }
]
```

### Step 6: Write Three Teaching Levels

**Deep** (first 3-5 attempts):
- Full concept explanation
- Why the trick works
- Derivation if helpful
- 3-4 minutes of content

**Shortcut** (attempts 4-8):
- Just the trick steps
- One quick example
- 30-60 seconds

**Instant** (after mastery):
- One-liner reminder
- "Dekh ke samajh aana chahiye"
- 5-10 seconds

### Step 7: Assign Metadata

```json
"metadata": {
  "difficulty": 2,          // 1=easy, 5=very hard
  "frequency": "high",       // how often in exams
  "avg_time_target_seconds": 30,
  "tags": ["chain", "successive", "reverse-calculation"]
}
```

---

## Quality Checklist

Before saving a pattern, verify:

- [ ] **Trick is faster** than textbook method
- [ ] **One-liner** is memorable and Hinglish
- [ ] **Steps** are concrete actions (not vague)
- [ ] **Common mistakes** are real (from coaching experience)
- [ ] **Teaching levels** are distinct (not just shorter versions)
- [ ] **Time target** is realistic (verify by solving yourself)
- [ ] **Keywords** in signature actually appear in questions

---

## Trick Sources

Where to find SSC tricks:

1. **YouTube**
   - Rakesh Yadav
   - Abhinay Sharma
   - Gagan Pratap
   - Dear Sir

2. **Books**
   - Rakesh Yadav 7300+
   - Kiran's SSC Mathematics
   - Paramount Advance Maths

3. **Telegram Groups**
   - SSC CGL aspirant groups often share tricks

4. **Your own solving**
   - Solve 50+ questions of same type
   - Pattern emerges naturally

---

## Common Trick Types

| Category | Trick Type | Example |
|----------|-----------|---------|
| Percentage | Fraction equivalents | 12.5% = 1/8 |
| Profit/Loss | Reverse fractions | Find CP from SP |
| Ratio | Cross multiplication shortcut | a:b and c:d comparison |
| Time/Work | LCM + Efficiency | Total work = LCM of days |
| Time/Distance | Proportionality | Same distance, inverse time |
| Geometry | Standard ratios | 30-60-90 triangle = 1:√3:2 |
| Number System | Divisibility | 11 divisibility trick |
| Algebra | Value substitution | Put x=1 or x=0 to check |

---

## File Template

Use this as starting point for new patterns:

```json
{
  "id": "TOPIC-NNN",
  "topic_id": "topic-id",
  "name": "Pattern Name in English",
  "name_hi": "पैटर्न नाम हिंदी में",
  "slug": "pattern-name-slug",

  "signature": {
    "keywords": [],
    "structure": "",
    "variables": []
  },

  "trick": {
    "name": "",
    "name_hi": "",
    "one_liner": "",
    "steps": [],
    "formula": null,
    "memory_hook": ""
  },

  "common_mistakes": [],

  "teaching": {
    "deep": {
      "explanation": "",
      "duration": "3-4 minutes",
      "includes": ["concept", "why_it_works", "derivation", "mistakes"]
    },
    "shortcut": {
      "explanation": "",
      "duration": "1 minute",
      "includes": ["trick_steps", "quick_example"]
    },
    "instant": {
      "explanation": "",
      "duration": "10 seconds",
      "includes": ["one_liner"]
    }
  },

  "visual": {
    "has_diagram": false,
    "template_id": null,
    "description": "",
    "when_to_show": "on_request"
  },

  "metadata": {
    "difficulty": 2,
    "frequency": "medium",
    "years_appeared": [],
    "avg_time_target_seconds": 45,
    "related_patterns": [],
    "tags": []
  },

  "embedding": null
}
```

---

## Tips from Experience

1. **Watch coaching videos at 2x** - Most tricks are explained in first 2-3 minutes

2. **Test the trick yourself** - Solve 10 questions using it. If it's not faster, it's not a trick.

3. **Hinglish > Hindi > English** - Students think in Hinglish. Write in Hinglish.

4. **Memory hooks matter** - "Ulta karo" is remembered. "Reciprocal" is forgotten.

5. **Time yourself** - If you can't solve in target time, the trick needs work.

6. **One pattern = one trick** - If a pattern needs two different tricks, split it into two patterns.
