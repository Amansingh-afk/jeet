import { Hono } from 'hono';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { patternRepository } from '../../repositories/pattern.repository.js';
import { questionRepository } from '../../repositories/question.repository.js';
import { NotFoundError } from '../../utils/errors.js';

const studioExport = new Hono();

const CONTENT_DIR = join(process.cwd(), '..', 'content');

/**
 * POST /studio/export/pattern/:id
 * Export a single pattern to JSON file
 */
studioExport.post('/pattern/:id', async (c) => {
  const id = c.req.param('id');
  const pattern = await patternRepository.findById(id);

  if (!pattern) {
    throw new NotFoundError('Pattern', id);
  }

  const patternJson = formatPatternForExport(pattern);
  const filePath = join(CONTENT_DIR, 'topics', pattern.topic_id, 'patterns', `${id}.json`);

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(patternJson, null, 2));

  return c.json({
    success: true,
    data: { path: filePath },
  });
});

/**
 * POST /studio/export/topic/:id
 * Export all patterns and questions for a topic
 */
studioExport.post('/topic/:id', async (c) => {
  const topicId = c.req.param('id');
  const paths: string[] = [];

  // Export patterns
  const patterns = await patternRepository.findByTopicId(topicId);
  for (const pattern of patterns) {
    const patternJson = formatPatternForExport(pattern);
    const filePath = join(CONTENT_DIR, 'topics', topicId, 'patterns', `${pattern.id}.json`);

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(patternJson, null, 2));
    paths.push(filePath);
  }

  // Export questions
  const questions = await questionRepository.findByTopicId(topicId);
  for (const question of questions) {
    const questionJson = formatQuestionForExport(question);
    const filePath = join(CONTENT_DIR, 'topics', topicId, 'questions', `${question.id}.json`);

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(questionJson, null, 2));
    paths.push(filePath);
  }

  return c.json({
    success: true,
    data: { paths },
  });
});

function formatPatternForExport(pattern: any) {
  // Remove database-specific fields
  const { created_at, updated_at, embedding, question_count, ...rest } = pattern;

  // Restructure to match the JSON file format
  return {
    id: rest.id,
    topic_id: rest.topic_id,
    name: rest.name,
    name_hi: rest.name_hi,
    slug: rest.slug,
    signature: rest.signature,
    trick: rest.trick,
    common_mistakes: rest.common_mistakes,
    teaching: rest.teaching,
    visual: rest.visual,
    prerequisites: rest.prerequisites,
    metadata: {
      difficulty: rest.difficulty,
      frequency: rest.frequency,
      avg_time_target_seconds: rest.avg_time_seconds,
      tags: rest.tags,
    },
  };
}

function formatQuestionForExport(question: any) {
  const { created_at, embedding, ...rest } = question;
  return rest;
}

export { studioExport };
