// ============================================
// Topic Types
// ============================================

export interface Topic {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  sort_order: number;
  icon?: string;
  color?: string;
  description?: string;
  prerequisites: string[];
  exam_weightage: Record<string, string>;
  metadata: Record<string, unknown>;
  created_at: Date;
}

// ============================================
// Pattern Types
// ============================================

export interface PatternSignature {
  embedding_text: string;
  variables: string[];
}

export interface TrickStep {
  step: number;
  action: string;
  example: string;
  example_hi?: string;
}

export interface TrickAlternative {
  name: string;
  name_hi: string;
  one_liner: string;
  when_to_use: string;
  steps: TrickStep[];
}

export interface PatternTrick {
  name: string;
  name_hi: string;
  one_liner: string;
  steps: TrickStep[];
  formula?: string;
  formula_simple?: string;
  memory_hook?: string;
  quick_fractions?: Record<string, string>;
  alternatives?: TrickAlternative[];
}

export interface CommonMistake {
  mistake: string;
  wrong: string;
  right: string;
  why?: string;
}

export interface TeachingLevel {
  explanation: string;
  duration: string;
  includes: string[];
}

export interface PatternTeaching {
  deep: TeachingLevel;
  shortcut: TeachingLevel;
  instant: TeachingLevel;
}

export interface PatternVisual {
  has_diagram: boolean;
  template_id?: string;
  description?: string;
  when_to_show?: 'always' | 'on_request' | 'first_time';
  annotations?: Record<string, string>;
}

export interface PatternPrerequisites {
  patterns: string[];
  concepts: string[];
}

export interface Pattern {
  id: string;
  topic_id: string;
  name: string;
  name_hi: string;
  slug: string;
  signature: PatternSignature;
  trick: PatternTrick;
  common_mistakes: CommonMistake[];
  teaching: PatternTeaching;
  visual?: PatternVisual;
  prerequisites: PatternPrerequisites;
  difficulty: number;
  frequency: 'low' | 'medium' | 'high';
  avg_time_seconds: number;
  tags: string[];
  embedding?: number[];
  created_at: Date;
  updated_at: Date;
}

// ============================================
// Question Types
// ============================================

export interface QuestionText {
  en: string;
  hi?: string;
}

export interface QuestionOptions {
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface QuestionSolution {
  trick_application: string[];
  answer: number | string;
  answer_display: string;
}

export interface QuestionSource {
  book: string;
  edition?: string;
  chapter?: number;
  chapter_name?: string;
  question_number?: number;
  page?: number;
}

export interface ExamAppearance {
  exam: string;
  tier?: number;
  year: number;
  date?: string;
  shift?: number;
}

export interface Question {
  id: string;
  pattern_id: string;
  topic_id: string;
  text: QuestionText;
  options?: QuestionOptions;
  correct_option?: 'a' | 'b' | 'c' | 'd';
  extracted_values?: Record<string, unknown>;
  solution?: QuestionSolution;
  source?: QuestionSource;
  exam_history?: ExamAppearance[];
  difficulty?: number;
  is_pyq?: boolean;
  is_variation?: boolean;
  embedding?: number[];
  created_at?: Date;
}

// ============================================
// Template Types
// ============================================

export interface TemplateParam {
  name: string;
  type: 'text' | 'number' | 'color';
  element_id?: string;
  position?: string;
  default?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  params: TemplateParam[];
  base_elements: unknown[];
  use_cases?: string[];
  preview_url?: string;
  created_at: Date;
}

// ============================================
// Chat Types
// ============================================

export type TeachingLevelType = 'deep' | 'shortcut' | 'instant';

export interface ChatRequest {
  message: string;
  context?: {
    pattern_id?: string;
    level?: TeachingLevelType;
  };
}

export interface PatternMatch {
  pattern_id: string;
  confidence: number;
  pattern: Pattern;
}

export type ChatChunkType = 'thinking' | 'pattern' | 'content' | 'diagram' | 'done' | 'error';

export interface ChatChunk {
  type: ChatChunkType;
  content?: string;
  pattern_id?: string;
  confidence?: number;
  template_id?: string;
  params?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
