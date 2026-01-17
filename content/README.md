# Jeet Content Repository

This folder contains all structured content for Jeet: topics, patterns, questions, and visual templates.

---

## Structure

```
content/
├── topics/                  # Topic definitions and content
│   ├── _template/           # Copy this for new topics
│   ├── profit-loss/         # Example: Profit & Loss
│   │   ├── meta.json        # Topic metadata
│   │   ├── patterns/        # All patterns for this topic
│   │   │   ├── pl-001.json
│   │   │   └── ...
│   │   └── questions/       # All questions for this topic
│   │       ├── pl-001-q-001.json
│   │       └── ...
│   └── ...
│
├── templates/               # Excalidraw visual templates
│   ├── excalidraw/          # Template JSON files
│   └── previews/            # PNG previews
│
└── embeddings/              # Precomputed vectors (generated)
    ├── patterns.parquet
    └── questions.parquet
```

---

## Topics List

| ID | Name | Patterns | Status |
|----|------|----------|--------|
| profit-loss | Profit & Loss | 45 | In Progress |
| percentage | Percentage | 30 | Not Started |
| ratio-proportion | Ratio & Proportion | 35 | Not Started |
| time-work | Time & Work | 35 | Not Started |
| time-distance | Time, Speed & Distance | 40 | Not Started |
| simple-interest | Simple Interest | 20 | Not Started |
| compound-interest | Compound Interest | 25 | Not Started |
| average | Average | 25 | Not Started |
| mixture-alligation | Mixture & Alligation | 30 | Not Started |
| geometry | Geometry | 60 | Not Started |
| mensuration | Mensuration | 50 | Not Started |
| trigonometry | Trigonometry | 40 | Not Started |
| algebra | Algebra | 45 | Not Started |
| number-system | Number System | 40 | Not Started |
| simplification | Simplification | 25 | Not Started |
| data-interpretation | Data Interpretation | 30 | Not Started |

---

## Quick Start

### Adding a New Topic

```bash
# 1. Copy template
cp -r topics/_template topics/your-topic-id

# 2. Edit meta.json
# 3. Add patterns to patterns/
# 4. Add questions to questions/
```

### Content Workflow

1. **Extract** questions from source PDFs
2. **Cluster** questions into patterns
3. **Author** tricks for each pattern (see docs/pattern-authoring.md)
4. **Validate** using scripts
5. **Import** to database

---

## File Naming

| Entity | Format | Example |
|--------|--------|---------|
| Topic folder | `{topic-id}/` | `profit-loss/` |
| Pattern file | `{topic-prefix}-{NNN}.json` | `pl-007.json` |
| Question file | `{pattern-id}-q-{NNN}.json` | `pl-007-q-001.json` |
| Template file | `{category}-{name}.json` | `flow-chain-3.json` |

---

## Validation

Run before importing:

```bash
# Validate all content
python scripts/validate_content.py

# Validate single topic
python scripts/validate_content.py --topic profit-loss
```

---

## Stats

<!-- Auto-generated, do not edit -->
```
Total Topics:     0 / 16
Total Patterns:   0 / ~500
Total Questions:  0 / ~8000
Total Templates:  0 / ~150
```
