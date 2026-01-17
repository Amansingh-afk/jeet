import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { closePool } from '../src/config/database.js';
import { config } from '../src/config/index.js';
import { topicRepository } from '../src/repositories/topic.repository.js';
import { patternRepository } from '../src/repositories/pattern.repository.js';
import { questionRepository } from '../src/repositories/question.repository.js';
import { templateRepository } from '../src/repositories/template.repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '..', config.content.path);

interface TopicMeta {
  id: string;
  name: string;
  name_hi: string;
  slug: string;
  order: number;
  icon?: string;
  color?: string;
  description?: string;
  prerequisites?: string[];
  exam_weightage?: Record<string, string>;
  status?: string;
}

interface PatternFile {
  id: string;
  topic_id: string;
  name: string;
  name_hi: string;
  slug: string;
  signature: unknown;
  trick: unknown;
  common_mistakes: unknown[];
  teaching: unknown;
  visual?: unknown;
  prerequisites?: unknown;
  metadata?: {
    difficulty?: number;
    frequency?: string;
    avg_time_target_seconds?: number;
    tags?: string[];
  };
}

interface QuestionFile {
  id: string;
  pattern_id: string;
  topic_id: string;
  text: { en: string; hi?: string };
  options: { a: string; b: string; c: string; d: string };
  correct: string;
  extracted_values: unknown;
  solution: unknown;
  source?: unknown;
  exam_history?: unknown[];
  difficulty?: number;
  is_pyq?: boolean;
}

interface TemplateFile {
  id: string;
  name: string;
  category: string;
  description?: string;
  params: unknown[];
  base_elements: unknown[];
  use_cases?: string[];
  preview_url?: string;
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

async function seedTopics(): Promise<number> {
  console.log('\nSeeding topics...');
  const topicsDir = path.join(contentDir, 'topics');
  let count = 0;

  if (!fs.existsSync(topicsDir)) {
    console.log('  No topics directory found');
    return 0;
  }

  const topicDirs = fs
    .readdirSync(topicsDir)
    .filter((d) => !d.startsWith('_') && fs.statSync(path.join(topicsDir, d)).isDirectory());

  for (const topicDir of topicDirs) {
    const metaPath = path.join(topicsDir, topicDir, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;

    const meta = readJsonFile<TopicMeta>(metaPath);
    if (!meta) continue;

    await topicRepository.upsert({
      id: meta.id,
      name: meta.name,
      name_hi: meta.name_hi,
      slug: meta.slug || meta.id,
      sort_order: meta.order || 999,
      icon: meta.icon,
      color: meta.color,
      description: meta.description,
      prerequisites: meta.prerequisites || [],
      exam_weightage: meta.exam_weightage || {},
      metadata: { status: meta.status },
    });

    console.log(`  ✓ ${meta.name}`);
    count++;
  }

  return count;
}

async function seedPatterns(): Promise<number> {
  console.log('\nSeeding patterns...');
  const topicsDir = path.join(contentDir, 'topics');
  let count = 0;

  if (!fs.existsSync(topicsDir)) return 0;

  const topicDirs = fs
    .readdirSync(topicsDir)
    .filter((d) => !d.startsWith('_') && fs.statSync(path.join(topicsDir, d)).isDirectory());

  for (const topicDir of topicDirs) {
    const patternsDir = path.join(topicsDir, topicDir, 'patterns');
    if (!fs.existsSync(patternsDir)) continue;

    const patternFiles = fs
      .readdirSync(patternsDir)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

    for (const patternFile of patternFiles) {
      const pattern = readJsonFile<PatternFile>(path.join(patternsDir, patternFile));
      if (!pattern) continue;

      await patternRepository.upsert({
        id: pattern.id,
        topic_id: pattern.topic_id,
        name: pattern.name,
        name_hi: pattern.name_hi,
        slug: pattern.slug,
        signature: pattern.signature as any,
        trick: pattern.trick as any,
        common_mistakes: (pattern.common_mistakes || []) as any,
        teaching: pattern.teaching as any,
        visual: pattern.visual as any,
        prerequisites: (pattern.prerequisites || { patterns: [], concepts: [] }) as any,
        difficulty: pattern.metadata?.difficulty || 2,
        frequency: (pattern.metadata?.frequency || 'medium') as any,
        avg_time_seconds: pattern.metadata?.avg_time_target_seconds || 45,
        tags: pattern.metadata?.tags || [],
      });

      console.log(`  ✓ ${pattern.id}: ${pattern.name}`);
      count++;
    }
  }

  return count;
}

async function seedQuestions(): Promise<number> {
  console.log('\nSeeding questions...');
  const topicsDir = path.join(contentDir, 'topics');
  let count = 0;

  if (!fs.existsSync(topicsDir)) return 0;

  const topicDirs = fs
    .readdirSync(topicsDir)
    .filter((d) => !d.startsWith('_') && fs.statSync(path.join(topicsDir, d)).isDirectory());

  for (const topicDir of topicDirs) {
    const questionsDir = path.join(topicsDir, topicDir, 'questions');
    if (!fs.existsSync(questionsDir)) continue;

    const questionFiles = fs
      .readdirSync(questionsDir)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

    for (const questionFile of questionFiles) {
      const question = readJsonFile<QuestionFile>(path.join(questionsDir, questionFile));
      if (!question) continue;

      await questionRepository.upsert({
        id: question.id,
        pattern_id: question.pattern_id,
        topic_id: question.topic_id,
        text: question.text,
        options: question.options as any,
        correct_option: question.correct as any,
        extracted_values: question.extracted_values as any,
        solution: question.solution as any,
        source: question.source as any,
        exam_history: (question.exam_history || []) as any,
        difficulty: question.difficulty || 2,
        is_pyq: question.is_pyq || false,
      });

      console.log(`  ✓ ${question.id}`);
      count++;
    }
  }

  return count;
}

async function seedTemplates(): Promise<number> {
  console.log('\nSeeding templates...');
  const templatesDir = path.join(contentDir, 'templates', 'excalidraw');
  let count = 0;

  if (!fs.existsSync(templatesDir)) {
    console.log('  No templates directory found');
    return 0;
  }

  const templateFiles = fs
    .readdirSync(templatesDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

  for (const templateFile of templateFiles) {
    const template = readJsonFile<TemplateFile>(path.join(templatesDir, templateFile));
    if (!template) continue;

    await templateRepository.upsert({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      params: template.params as any,
      base_elements: template.base_elements,
      use_cases: template.use_cases,
      preview_url: template.preview_url,
    });

    console.log(`  ✓ ${template.id}: ${template.name}`);
    count++;
  }

  return count;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Jeet Content Seeder');
  console.log('='.repeat(50));
  console.log(`\nContent directory: ${contentDir}`);

  if (!fs.existsSync(contentDir)) {
    console.error(`\nError: Content directory not found: ${contentDir}`);
    process.exit(1);
  }

  try {
    const topics = await seedTopics();
    const patterns = await seedPatterns();
    const questions = await seedQuestions();
    const templates = await seedTemplates();

    console.log('\n' + '='.repeat(50));
    console.log('Seeding complete!');
    console.log(`  Topics:    ${topics}`);
    console.log(`  Patterns:  ${patterns}`);
    console.log(`  Questions: ${questions}`);
    console.log(`  Templates: ${templates}`);
    console.log('='.repeat(50));
  } finally {
    await closePool();
  }
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
