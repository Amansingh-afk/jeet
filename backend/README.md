# Jeet Backend

Backend API for Jeet - the SSC exam mentor that teaches tricks, not textbooks.

## Tech Stack

- **Runtime**: Node.js 24+
- **Framework**: Hono (lightweight, fast)
- **Database**: PostgreSQL + pgvector
- **LLM**: OpenAI GPT-4o-mini
- **Language**: TypeScript

## Prerequisites

- Node.js 24+ (`nvm use 24`)
- Docker & Docker Compose
- OpenAI API key

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL with pgvector
docker-compose up -d postgres

# 3. Copy environment file and add your OpenAI key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...

# 4. Run database migrations
npm run migrate

# 5. Seed content from JSON files
npm run seed

# 6. Generate embeddings (requires OpenAI key)
npm run generate-embeddings

# 7. Start development server
npm run dev
```

Server runs at `http://localhost:3000`

**Studio UI**: `http://localhost:3000/studio` - Upload photos to add content

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Import content from `../content/` |
| `npm run generate-embeddings` | Generate embeddings (new entries only) |
| `npm run generate-embeddings -- --all` | Regenerate ALL embeddings from scratch |

## Embedding Generation

```bash
# Generate for new entries only (incremental)
npm run generate-embeddings

# Regenerate ALL embeddings from scratch
npm run generate-embeddings -- --all

# Selective generation
npm run generate-embeddings -- --all --skip-questions  # Patterns only
npm run generate-embeddings -- --all --skip-patterns   # Questions only

# Show help
npm run generate-embeddings -- --help
```

Use `--all` when:
- You change the embedding formula
- You want to rebuild indexes
- You suspect embeddings are corrupted

## Docker Commands

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Start PostgreSQL + Redis
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (reset data)
docker-compose down -v
```

## API Endpoints

### Health

```
GET /              # API info
GET /health        # Health check
```

### Topics

```
GET /topics        # List all topics with pattern counts
GET /topics/:id    # Get topic with its patterns
```

### Patterns

```
GET /patterns              # List all patterns
GET /patterns?topic_id=x   # Filter by topic
GET /patterns/:id          # Get full pattern details
GET /patterns/:id/questions # Get questions for pattern
GET /patterns/:id/trick    # Get just the trick
```

### Questions

```
GET /questions/:id                  # Get question with solution
GET /questions/by-topic/:topicId    # Get questions for topic
POST /questions/:id/check           # Check answer
```

### Templates

```
GET /templates              # List all templates
GET /templates/categories   # Get template categories
GET /templates/:id          # Get template with Excalidraw elements
POST /templates/:id/render  # Render template with params
```

### Chat (Core Feature)

```
POST /chat         # Chat with Jeetu (SSE streaming)
POST /chat/match   # Pattern matching only (no LLM)
POST /chat/test    # Non-streaming test endpoint
```

### Content Ingestion (Studio)

```
GET  /studio                    # Studio UI for adding content
POST /content/process-photo     # Process photo via Vision API
POST /content/process-photos    # Process multiple photos
POST /content/save              # Save generated content to files
GET  /content/pending/:id       # Get pending content
DELETE /content/pending/:id     # Cancel pending content
GET  /content/next-ids/:topic   # Get next available IDs
```

## Testing the Chat

### Streaming (SSE)

```bash
curl -N -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "A sells to B at 20% profit, B sells to C at 25%. C pays 600. Find A cost?",
    "context": {"level": "shortcut"}
  }'
```

### Non-Streaming Test

```bash
curl -X POST http://localhost:3000/chat/test \
  -H "Content-Type: application/json" \
  -d '{
    "message": "A sells to B at 20% profit, B sells to C at 25%. C pays 600. Find A cost?",
    "level": "shortcut"
  }'
```

### Pattern Match Only

```bash
curl -X POST http://localhost:3000/chat/match \
  -H "Content-Type: application/json" \
  -d '{"message": "A sells to B at 20% profit..."}'
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://jeet:jeet@localhost:5432/jeet

# OpenAI (required for chat and embeddings)
OPENAI_API_KEY=sk-...

# Content path (relative to backend/)
CONTENT_PATH=../content
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Hono app setup
│   ├── config/               # Configuration
│   │   ├── index.ts          # Environment config
│   │   └── database.ts       # PostgreSQL connection
│   ├── routes/               # API routes
│   │   ├── chat.ts           # /chat (streaming)
│   │   ├── content-ingestion.ts  # /content (Studio API)
│   │   ├── topics.ts         # /topics
│   │   ├── patterns.ts       # /patterns
│   │   ├── questions.ts      # /questions
│   │   └── templates.ts      # /templates
│   ├── services/             # Business logic
│   │   ├── pattern-matcher.service.ts
│   │   ├── llm.service.ts
│   │   ├── vision.service.ts        # GPT-4o Vision extraction
│   │   └── content-generator.service.ts  # JSON generation
│   ├── repositories/         # Database access
│   ├── middleware/           # Error handling
│   ├── utils/                # Helpers
│   └── types/                # TypeScript types
├── public/                   # Static files
│   └── studio.html           # Content creation UI
├── scripts/                  # CLI scripts
├── migrations/               # SQL migrations
├── docker-compose.yml        # Local services
└── package.json
```

## How It Works

1. **User sends question** → `/chat` endpoint
2. **Pattern Matcher** generates embedding, searches pgvector for similar patterns
3. **Value Extractor** pulls numbers/percentages from question
4. **LLM Service** uses matched pattern's trick + extracted values to generate response
5. **Streaming** sends response chunks via SSE as they're generated
6. **Diagram** (optional) returns Excalidraw template with filled params

## Database Schema

- `topics` - Math topics (Profit & Loss, Time & Work, etc.)
- `patterns` - Problem patterns with tricks (~500)
- `questions` - Individual questions (~8000)
- `templates` - Excalidraw visual templates
- `users` - User accounts (for later)
- `user_pattern_progress` - Learning progress (for later)

## Troubleshooting

### Database connection failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Start it if not
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### Embeddings not generating

- Ensure `OPENAI_API_KEY` is set in `.env`
- Check you have API credits
- Run `npm run generate-embeddings` after seeding

### Pattern matching returns no results

- Ensure you've run `npm run seed` to import content
- Ensure you've run `npm run generate-embeddings`
- Check that patterns have embeddings:
  ```sql
  SELECT COUNT(*) FROM patterns WHERE embedding IS NOT NULL;
  ```

### Port already in use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it or use different port
PORT=3001 npm run dev
```

## Development

### Adding a new route

1. Create route file in `src/routes/`
2. Import and mount in `src/app.ts`

### Adding a new service

1. Create service file in `src/services/`
2. Import where needed

### Running with different content

```bash
CONTENT_PATH=/path/to/other/content npm run seed
```
