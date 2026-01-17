-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Topics
-- ============================================
CREATE TABLE topics (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  description TEXT,
  prerequisites VARCHAR(50)[] DEFAULT '{}',
  exam_weightage JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Patterns (core entity)
-- ============================================
CREATE TABLE patterns (
  id VARCHAR(50) PRIMARY KEY,
  topic_id VARCHAR(50) REFERENCES topics(id) ON DELETE CASCADE,

  name VARCHAR(200) NOT NULL,
  name_hi VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,

  -- Core content (stored as JSONB for flexibility)
  signature JSONB NOT NULL,
  trick JSONB NOT NULL,
  common_mistakes JSONB DEFAULT '[]',
  teaching JSONB NOT NULL,
  visual JSONB,
  prerequisites JSONB DEFAULT '{"patterns": [], "concepts": []}',

  -- Metadata
  difficulty SMALLINT DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
  frequency VARCHAR(10) DEFAULT 'medium',
  avg_time_seconds INTEGER DEFAULT 45,
  tags VARCHAR(50)[] DEFAULT '{}',

  -- Vector for semantic search (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Questions
-- ============================================
CREATE TABLE questions (
  id VARCHAR(100) PRIMARY KEY,
  pattern_id VARCHAR(50) REFERENCES patterns(id) ON DELETE CASCADE,
  topic_id VARCHAR(50) REFERENCES topics(id) ON DELETE CASCADE,

  text_en TEXT NOT NULL,
  text_hi TEXT,

  options JSONB NOT NULL,
  correct_option CHAR(1) NOT NULL,

  extracted_values JSONB NOT NULL,
  solution JSONB NOT NULL,

  source JSONB,
  exam_history JSONB DEFAULT '[]',
  difficulty SMALLINT DEFAULT 2,
  is_pyq BOOLEAN DEFAULT FALSE,

  embedding vector(1536),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Excalidraw Templates
-- ============================================
CREATE TABLE templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,

  params JSONB NOT NULL,
  base_elements JSONB NOT NULL,
  use_cases VARCHAR(200)[] DEFAULT '{}',

  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Users (for later)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),

  target_exam VARCHAR(20),
  attempt_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- ============================================
-- Progress tracking (for later)
-- ============================================
CREATE TABLE user_pattern_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_id VARCHAR(50) REFERENCES patterns(id) ON DELETE CASCADE,

  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,

  avg_time_seconds INTEGER,
  best_time_seconds INTEGER,

  level VARCHAR(20) DEFAULT 'deep',

  last_seen_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,

  PRIMARY KEY (user_id, pattern_id)
);

CREATE TABLE question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(100) REFERENCES questions(id) ON DELETE CASCADE,
  pattern_id VARCHAR(50) REFERENCES patterns(id) ON DELETE CASCADE,

  selected_option CHAR(1),
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

-- Topic indexes
CREATE INDEX idx_topics_slug ON topics(slug);

-- Pattern indexes
CREATE INDEX idx_patterns_topic ON patterns(topic_id);
CREATE INDEX idx_patterns_slug ON patterns(slug);
CREATE INDEX idx_patterns_difficulty ON patterns(difficulty);
CREATE INDEX idx_patterns_tags ON patterns USING GIN (tags);

-- Question indexes
CREATE INDEX idx_questions_pattern ON questions(pattern_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_is_pyq ON questions(is_pyq);

-- Template indexes
CREATE INDEX idx_templates_category ON templates(category);

-- User indexes
CREATE INDEX idx_users_phone ON users(phone);

-- Progress indexes
CREATE INDEX idx_progress_user ON user_pattern_progress(user_id);
CREATE INDEX idx_progress_pattern ON user_pattern_progress(pattern_id);
CREATE INDEX idx_progress_next_review ON user_pattern_progress(next_review_at);

CREATE INDEX idx_attempts_user ON question_attempts(user_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_attempts_created ON question_attempts(created_at);

-- Vector indexes (IVFFlat for approximate nearest neighbor search)
-- Note: These should be created AFTER data is loaded for better performance
-- CREATE INDEX idx_patterns_embedding ON patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX idx_questions_embedding ON questions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
