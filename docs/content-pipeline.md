# Content Pipeline

How to add new patterns and questions to Jeet using **Studio**.

---

## Jeet Studio

Studio is a web-based UI for adding content via photo upload. Access it at:

```
http://YOUR_IP:3000/studio
```

### Features

- **Photo upload** - Drag & drop or camera capture
- **Vision AI extraction** - Automatically extracts question, solution, values
- **Auto-generates JSON** - Creates pattern and question files
- **Preview & edit** - Review and modify before saving
- **Direct save** - Writes to `content/topics/` directory

---

## Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Photo of   │────▶│    Studio    │────▶│   Review &   │────▶│    Save to   │
│   Question   │     │   (Vision)   │     │     Edit     │     │    Files     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Step-by-Step

### 1. Open Studio

On your phone or computer browser:
```
http://192.168.x.x:3000/studio
```

Find your IP: `hostname -I` on your dev machine.

### 2. Upload Photo

- Click the upload zone or drag & drop
- On mobile: tap to open camera or gallery
- Supports: JPG, PNG, WebP (max 10MB)

### 3. Wait for Processing

Studio sends the image to GPT-4o Vision which extracts:
- Question text (English + Hindi if visible)
- MCQ options and correct answer
- Solution steps from handwritten work
- Numerical values
- Topic and pattern classification

### 4. Review Extracted Content

Check the auto-filled fields:

| Field | Description |
|-------|-------------|
| **Question Text** | The extracted question (editable) |
| **Topic** | Auto-detected topic (e.g., percentage) |
| **Pattern ID** | Auto-generated or existing pattern |
| **Question ID** | Auto-generated (e.g., `pc-009-q-001`) |
| **Difficulty** | 1-5 scale |
| **Confidence** | How confident the AI is (0-100%) |

### 5. Review JSON

Expand "Pattern JSON" and "Question JSON" to see the full generated content.

### 6. Edit if Needed

Common edits:
- Fix OCR errors in question text
- Adjust difficulty rating
- Change topic if misclassified
- Modify pattern/question IDs

### 7. Save or Cancel

- **Save** → Writes files to `content/topics/{topic}/`
- **Cancel** → Discards (no files created)

---

## After Saving

Run these commands to sync content to database:

```bash
# Load content into PostgreSQL
npm run seed

# Generate embeddings for pattern matching
npm run generate-embeddings
```

---

## Adding to Existing Pattern

If the question fits an existing pattern:

1. Upload the photo
2. Change **Pattern ID** to the existing pattern (e.g., `pc-006`)
3. Studio auto-increments the question ID (e.g., `pc-006-q-008`)
4. The pattern JSON section will show "N/A" (no new pattern created)
5. Save

---

## Creating a Variation

Variations are lightweight questions (text only, no full solution) used to expand embedding coverage:

1. Upload photo
2. Set Pattern ID to existing pattern
3. Check if it should be a variation (simple text, no need for full solution)
4. The generated question will have minimal fields

---

## API Reference

Studio uses these backend endpoints:

| Endpoint | Purpose |
|----------|---------|
| `POST /content/process-photo` | Send photo, get extracted content |
| `POST /content/save` | Save reviewed content to files |
| `GET /content/pending/:id` | Get pending content by session |
| `DELETE /content/pending/:id` | Cancel pending content |
| `GET /content/next-ids/:topic` | Get next available IDs |

---

## Tips

### Photo Quality

- **Clear photos** work best - avoid blur, shadows
- **Crop** to just the question if possible
- **Include solution** if handwritten work is visible

### Batch Processing

For many questions:
1. Take all photos first
2. Open Studio on laptop (bigger screen)
3. Process one by one
4. Save after reviewing each

### Mobile Shortcut

Add Studio to your home screen:
- **Safari**: Share → Add to Home Screen
- **Chrome**: Menu → Add to Home Screen

This gives you an app-like icon for quick access.

---

## Troubleshooting

### "Processing failed"

- Check if backend is running (`npm run dev`)
- Verify OPENAI_API_KEY is set in `.env`
- Check image is under 10MB

### Low confidence score

- Photo may be blurry or unclear
- Handwriting may be hard to read
- Review extracted text carefully

### Wrong pattern detected

- Manually change Pattern ID
- Or let it create new pattern and merge later

---

## Content Structure

Files are saved to:

```
content/topics/{topic}/
├── patterns/
│   └── {pattern-id}.json
└── questions/
    └── {question-id}.json
```

Example:
```
content/topics/percentage/
├── patterns/
│   └── pc-009.json
└── questions/
    └── pc-009-q-001.json
```

---

## Schema Enforcement

The content generator pipeline enforces strict JSON schema compliance.

### Pattern Schema

Generated patterns will have this exact structure:

```json
{
  "id": "pc-001",
  "topic_id": "percentage",
  "name": "Pattern Name",
  "name_hi": "पैटर्न नाम",
  "slug": "pattern-name",
  "signature": {
    "embedding_text": "Generic question with X for numbers",
    "variables": ["var1", "var2"]
  },
  "trick": {
    "name": "Trick Name",
    "name_hi": "ट्रिक नाम",
    "one_liner": "Hinglish one-liner",
    "steps": [...],
    "formula": "formula or null",
    "memory_hook": "...",
    "alternatives": []
  },
  "common_mistakes": [...],
  "teaching": {
    "deep": { "explanation": "...", "duration_seconds": 120, "includes": [...] },
    "shortcut": { "explanation": "...", "duration_seconds": 60, "includes": [...] },
    "instant": { "explanation": "...", "duration_seconds": 10, "includes": [...] }
  },
  "visual": { "has_diagram": false, "template_id": null, "description": "", "when_to_show": "on_request" },
  "prerequisites": { "patterns": [], "concepts": [] },
  "metadata": { "difficulty": 2, "frequency": "medium", "years_appeared": [], "avg_time_target_seconds": 45, "related_patterns": [], "tags": [] }
}
```

### Question Schema

Full questions:

```json
{
  "id": "pc-001-q-001",
  "pattern_id": "pc-001",
  "topic_id": "percentage",
  "text": { "en": "Question text", "hi": "प्रश्न" },
  "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
  "correct": "b",
  "extracted_values": { "percent": 20 },
  "solution": { "trick_application": ["Step 1", "Step 2"], "answer": 25, "answer_display": "25%" },
  "difficulty": 2,
  "is_pyq": false,
  "embedding": null
}
```

Variations (lightweight):

```json
{
  "id": "pc-001-q-002",
  "pattern_id": "pc-001",
  "topic_id": "percentage",
  "text": { "en": "Question text" },
  "is_variation": true
}
```

### Validation Rules

The pipeline automatically:

1. **Removes null values** - Optional fields without data are omitted
2. **Strips extra fields** - Only schema-defined fields are included
3. **Enforces types** - Numbers, strings, arrays coerced to correct types
4. **Sets defaults** - Missing required fields get sensible defaults

See `backend/src/services/content-generator.service.ts` for implementation details.

---

## Prompt Versioning

LLM prompts are versioned in `backend/src/config/prompts.ts`:

| Prompt | Version | Purpose |
|--------|---------|---------|
| `jeetu_bhaiya` | 1.1.0 | Teaching persona for explanations |
| `pattern_generation` | 1.1.0 | Generates pattern JSON from extracted content |
| `question_generation` | 1.1.0 | Generates question JSON from extracted content |
| `vision_extraction` | 1.0.0 | Extracts content from images |

To view/rollback prompts, check `_history` in the prompts config.
