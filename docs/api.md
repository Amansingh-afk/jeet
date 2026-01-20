# API Reference

Complete API documentation for the Jeet backend.

**Base URL**: `http://localhost:3000`

---

## Overview

| Route Group | Base Path | Purpose |
|-------------|-----------|---------|
| [Health](#health) | `/` | Service status |
| [Topics](#topics) | `/topics` | Topic listing and details |
| [Patterns](#patterns) | `/patterns` | Pattern CRUD and tricks |
| [Questions](#questions) | `/questions` | Question retrieval and answer checking |
| [Chat](#chat) | `/chat` | Main AI chat interface |
| [Templates](#templates) | `/templates` | Excalidraw diagram templates |
| [Content](#content-ingestion) | `/content` | Studio content ingestion |

---

## Response Format

All endpoints return JSON with this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

---

## Health

### `GET /`

Service info and status.

**Response:**
```json
{
  "name": "Jeet API",
  "version": "1.0.0",
  "status": "healthy",
  "message": "Jeetu Bhaiya is ready to help! 🎯",
  "studio": "/studio - Content creation UI"
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Topics

### `GET /topics`

List all topics with pattern counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "profit-loss",
      "name": "Profit & Loss",
      "name_hi": "लाभ और हानि",
      "slug": "profit-loss",
      "order": 3,
      "pattern_count": 45,
      "question_count": 380
    }
  ]
}
```

### `GET /topics/:id`

Get topic details with its patterns.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | path | Topic ID (e.g., `profit-loss`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "profit-loss",
    "name": "Profit & Loss",
    "name_hi": "लाभ और हानि",
    "patterns": [
      {
        "id": "pl-007",
        "name": "Successive Profit/Loss",
        "name_hi": "क्रमिक लाभ/हानि",
        "difficulty": 2,
        "frequency": "high",
        "trick_one_liner": "Profit % को fraction में बदलो, उल्टा करके multiply करो"
      }
    ]
  }
}
```

---

## Patterns

### `GET /patterns`

List all patterns with summary info.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `topic_id` | string | Filter by topic (optional) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pl-007",
      "topic_id": "profit-loss",
      "name": "Successive Profit/Loss",
      "name_hi": "क्रमिक लाभ/हानि",
      "difficulty": 2,
      "frequency": "high",
      "avg_time_seconds": 30,
      "trick_one_liner": "Profit % को fraction में बदलो...",
      "tags": ["successive", "chain"],
      "question_count": 15
    }
  ]
}
```

### `GET /patterns/:id`

Get full pattern details including trick, teaching levels, and visual info.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | path | Pattern ID (e.g., `pl-007`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pl-007",
    "topic_id": "profit-loss",
    "name": "Successive Profit/Loss",
    "signature": {
      "embedding_text": "A sells to B at X percent profit...",
      "variables": ["profit_1", "profit_2", "final_price"]
    },
    "trick": {
      "name": "Fraction Reversal",
      "one_liner": "Profit % को fraction में बदलो...",
      "steps": [
        {
          "step": 1,
          "action": "Convert profit % to fraction",
          "example": "20% profit = 6/5"
        }
      ]
    },
    "teaching": {
      "deep": { "explanation": "...", "duration": "3-4 minutes" },
      "shortcut": { "explanation": "...", "duration": "1 minute" },
      "instant": { "explanation": "...", "duration": "10 seconds" }
    },
    "visual": {
      "has_diagram": true,
      "template_id": "flow-chain-3"
    },
    "common_mistakes": [...]
  }
}
```

### `GET /patterns/:id/questions`

Get questions for a specific pattern.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | path | Pattern ID |
| `limit` | query | Max questions to return (default: 10) |
| `difficulty` | query | Filter by difficulty (1-5) |

**Response:**
```json
{
  "success": true,
  "data": {
    "pattern_id": "pl-007",
    "pattern_name": "Successive Profit/Loss",
    "questions": [
      {
        "id": "pl-007-q-001",
        "text_en": "A sells to B at 20% profit...",
        "options": { "a": "₹350", "b": "₹400", "c": "₹450", "d": "₹500" },
        "difficulty": 2
      }
    ]
  }
}
```

### `GET /patterns/:id/trick`

Get just the trick for a pattern (lightweight endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "pattern_id": "pl-007",
    "pattern_name": "Successive Profit/Loss",
    "trick": {
      "name": "Fraction Reversal",
      "one_liner": "...",
      "steps": [...]
    },
    "common_mistakes": [...]
  }
}
```

---

## Questions

### `GET /questions/:id`

Get a specific question with solution.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | path | Question ID (e.g., `pl-007-q-001`) |
| `include_pattern` | query | Include pattern info (`true`/`false`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pl-007-q-001",
    "pattern_id": "pl-007",
    "topic_id": "profit-loss",
    "text_en": "A sells an article to B at 20% profit...",
    "text_hi": "A एक वस्तु B को 20% लाभ पर बेचता है...",
    "options": { "a": "₹350", "b": "₹400", "c": "₹450", "d": "₹500" },
    "correct_option": "b",
    "solution": {
      "trick_application": ["20% profit → 6/5 → reverse = 5/6", "..."],
      "answer": 400
    },
    "pattern": {
      "id": "pl-007",
      "name": "Successive Profit/Loss",
      "trick": { ... }
    }
  }
}
```

### `GET /questions/by-topic/:topicId`

Get questions for a topic with pagination.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `topicId` | path | Topic ID |
| `limit` | query | Page size (default: 20) |
| `offset` | query | Skip count (default: 0) |

**Response:**
```json
{
  "success": true,
  "data": {
    "topic_id": "profit-loss",
    "questions": [...],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### `POST /questions/:id/check`

Check an answer and get solution.

**Request Body:**
```json
{
  "selected_option": "b",
  "time_taken_seconds": 45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question_id": "pl-007-q-001",
    "is_correct": true,
    "correct_option": "b",
    "solution": {
      "trick_application": ["..."],
      "answer": 400
    },
    "time_taken_seconds": 45
  }
}
```

---

## Chat

### `POST /chat`

Main chat endpoint with streaming SSE response.

**Request Body:**
```json
{
  "message": "A sells to B at 20% profit, B sells to C at 25% profit. C pays 600, find A's cost?",
  "context": {
    "pattern_id": "pl-007",
    "level": "shortcut"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's question (max 2000 chars) |
| `context.pattern_id` | string | No | Force specific pattern |
| `context.level` | string | No | Teaching level: `deep`, `shortcut`, `instant` |

**Response (SSE Stream):**

Events are sent as Server-Sent Events:

```
data: {"type":"thinking","content":"Pattern match kar raha hoon..."}

data: {"type":"pattern","pattern_id":"pl-007","pattern_name":"Successive Profit/Loss","confidence":0.94,"matched_via":"question"}

data: {"type":"content","content":"Dekh bhai, ye successive profit wala question hai..."}

data: {"type":"content","content":" Step 1: 20% profit matlab 6/5..."}

data: {"type":"diagram","excalidraw_json":{...}}

data: {"type":"answer","value":400,"display":"₹400"}

data: {"type":"done"}
```

**Event Types:**

| Type | Description |
|------|-------------|
| `thinking` | Processing status |
| `pattern` | Matched pattern info |
| `content` | Streamed explanation text |
| `diagram` | Excalidraw JSON for visual |
| `answer` | Final answer |
| `error` | Error message |
| `done` | Stream complete |

### `POST /chat/match`

Pattern matching only (no LLM response). Useful for testing.

**Request Body:**
```json
{
  "message": "A sells to B at 20% profit..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "match": {
      "pattern_id": "pl-007",
      "pattern_name": "Successive Profit/Loss",
      "confidence": 0.94,
      "trick_one_liner": "Profit % को fraction में बदलो...",
      "matched_via": "question",
      "matched_question_id": "pl-007-q-001"
    },
    "alternatives": [
      {
        "pattern_id": "pl-008",
        "name": "Single Profit/Loss",
        "similarity": 0.72,
        "trick_one_liner": "..."
      }
    ]
  }
}
```

### `POST /chat/test`

Non-streaming chat endpoint for testing.

**Request Body:**
```json
{
  "message": "A sells to B at 20% profit...",
  "level": "shortcut"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pattern": {
      "id": "pl-007",
      "name": "Successive Profit/Loss",
      "confidence": 0.94
    },
    "extractedValues": {
      "profit_1": 20,
      "profit_2": 25,
      "final_price": 600
    },
    "response": {
      "explanation": "Dekh bhai...",
      "steps": [...],
      "answer": 400,
      "excalidraw_json": {...}
    }
  }
}
```

---

## Templates

### `GET /templates`

List all Excalidraw templates.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `category` | string | Filter by category (e.g., `flow`, `geometry`) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "flow-chain-3",
      "name": "Flow Chain (3 entities)",
      "category": "flow",
      "description": "A → B → C flow with labels",
      "param_count": 7,
      "preview_url": "/templates/previews/flow-chain-3.png"
    }
  ]
}
```

### `GET /templates/categories`

List template categories.

**Response:**
```json
{
  "success": true,
  "data": ["flow", "geometry", "graph", "number-line", "table", "comparison", "venn"]
}
```

### `GET /templates/:id`

Get full template with base elements.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow-chain-3",
    "name": "Flow Chain (3 entities)",
    "category": "flow",
    "params": [
      { "name": "entity_1", "type": "text", "default": "A" },
      { "name": "arrow_1_label", "type": "text", "default": "" }
    ],
    "base_elements": [
      { "type": "rectangle", "id": "box_1", "x": 100, "y": 100, ... }
    ]
  }
}
```

### `POST /templates/:id/render`

Render template with specific values.

**Request Body:**
```json
{
  "params": {
    "entity_1": "A",
    "entity_2": "B",
    "entity_3": "C",
    "arrow_1_label": "20% profit",
    "arrow_2_label": "25% profit",
    "value_1": "₹?",
    "value_3": "₹600"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "template_id": "flow-chain-3",
    "template_name": "Flow Chain (3 entities)",
    "elements": [
      { "type": "rectangle", "id": "box_1", ... },
      { "type": "text", "id": "text_entity_1", "text": "A", ... }
    ]
  }
}
```

---

## Content Ingestion

These endpoints power Jeet Studio for adding content via photo upload.

### `POST /content/process-photo`

Process a photo and extract content.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photo` | File | Yes | Image file (JPG, PNG, WebP, max 10MB) |
| `topic_id` | string | No | Override auto-detected topic |
| `pattern_id` | string | No | Add to existing pattern |
| `is_variation` | boolean | No | Create as lightweight variation |
| `force_new_pattern` | boolean | No | Force new pattern creation |

**Response:**
```json
{
  "status": "preview",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "extracted": {
    "question_text": "A sells to B at 20% profit...",
    "topic_guess": "profit-loss",
    "pattern_description": "Successive profit chain",
    "is_likely_new_pattern": false,
    "confidence": 0.92,
    "warnings": []
  },
  "generated": {
    "is_new_pattern": true,
    "pattern_id": "pl-008",
    "question_id": "pl-008-q-001",
    "pattern": { ... },
    "question": { ... }
  },
  "warnings": [],
  "next_steps": {
    "to_save": "POST /content/save with { \"session_id\": \"...\" }",
    "to_modify": "Send updated pattern/question in save request",
    "to_cancel": "Do nothing, session expires in 30 minutes"
  }
}
```

### `POST /content/process-photos`

Process multiple photos (question + solution on separate images).

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `photo1`, `photo2`, etc. | File | Image files (max 5) |
| `photos[]` | File[] | Alternative array format |

Same response format as `/process-photo`.

### `POST /content/save`

Save reviewed content to filesystem.

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "pattern": { ... },
  "question": { ... }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | Yes | Session from process-photo |
| `pattern` | object | No | Override generated pattern |
| `question` | object | No | Override generated question |

**Response:**
```json
{
  "status": "saved",
  "topic": "profit-loss",
  "files_created": [
    "patterns/pl-008.json",
    "questions/pl-008-q-001.json"
  ],
  "pattern_id": "pl-008",
  "question_id": "pl-008-q-001",
  "next_steps": [
    "Run `npm run seed` to load content into database",
    "Run `npm run generate-embeddings` to generate embeddings"
  ]
}
```

### `GET /content/pending/:sessionId`

Get pending content for review.

**Response:**
```json
{
  "status": "pending",
  "session_id": "...",
  "is_new_pattern": true,
  "pattern": { ... },
  "question": { ... },
  "warnings": []
}
```

### `DELETE /content/pending/:sessionId`

Cancel pending content.

**Response:**
```json
{
  "status": "cancelled",
  "message": "Pending content cancelled"
}
```

### `GET /content/next-ids/:topicId`

Get next available IDs for a topic.

**Response:**
```json
{
  "topic_id": "profit-loss",
  "next_pattern_id": "pl-046",
  "next_question_id": "pl-046-q-001"
}
```

---

## Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

**Error Response Example:**
```json
{
  "success": false,
  "error": "Pattern not found",
  "details": {
    "entity": "Pattern",
    "id": "pl-999"
  }
}
```

---

## Testing with cURL

**Get all topics:**
```bash
curl http://localhost:3000/topics
```

**Test pattern matching:**
```bash
curl -X POST http://localhost:3000/chat/match \
  -H "Content-Type: application/json" \
  -d '{"message": "A sells to B at 20% profit, B sells to C at 25% profit. C pays 600, find A cost?"}'
```

**Test chat (non-streaming):**
```bash
curl -X POST http://localhost:3000/chat/test \
  -H "Content-Type: application/json" \
  -d '{"message": "20% profit pe becha, 25% profit pe aage becha, final 600 hai, original cost?", "level": "shortcut"}'
```

**Upload photo to Studio:**
```bash
curl -X POST http://localhost:3000/content/process-photo \
  -F "photo=@question.jpg" \
  -F "topic_id=profit-loss"
```
