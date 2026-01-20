# Jeet Documentation

> Technical documentation for building and maintaining Jeet - the SSC exam mentor.

## Quick Start

**Add new content via Studio:**
```
http://YOUR_IP:3000/studio
```

Upload a photo → Review extracted content → Save. That's it.

## Quick Links

| Document | Purpose |
|----------|---------|
| [Content Pipeline](./content-pipeline.md) | **Start here** - How to add content via Studio |
| [Pattern Authoring](./pattern-authoring.md) | Tips for writing quality patterns |
| [Schema](./schema.md) | Data structures for topics, patterns, questions |
| [Architecture](./architecture.md) | System design, components, data flow |
| [API Reference](./api.md) | REST API endpoints with examples |

## Core Concepts

```
TOPIC (25-30 topics)
   └── PATTERN (400-800 patterns)  ← This is the hero
         └── QUESTION (8000 questions)
```

**Pattern-first approach**: We don't solve questions from scratch. We match questions to known patterns and apply pre-documented tricks.

## Directory Map

```
jeet/
├── docs/                    # You are here
│   ├── architecture.md
│   ├── schema.md
│   ├── pattern-authoring.md
│   └── content-pipeline.md
│
├── content/                 # The knowledge base
│   ├── topics/              # Topic → Pattern → Question hierarchy
│   ├── templates/           # Excalidraw visual templates
│   └── embeddings/          # Precomputed vectors (generated)
│
└── roadmap.md               # Project phases and milestones
```

## Key Principles

1. **Tricks over theory** - Every pattern must have a shortcut method
2. **Hinglish first** - All explanations in natural Hinglish
3. **Visual when helpful** - Excalidraw diagrams for geometry, flows
4. **Progressive depth** - Deep → Shortcut → Instant recognition
5. **Finite problem space** - 8000 questions, ~500 patterns. It's solvable.
