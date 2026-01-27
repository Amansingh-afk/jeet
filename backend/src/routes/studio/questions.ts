import { Hono } from 'hono';
import { questionRepository } from '../../repositories/question.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import type { Question } from '../../types/index.js';

const studioQuestions = new Hono();

/**
 * GET /studio/questions
 * List questions with optional filters
 */
studioQuestions.get('/', async (c) => {
  const patternId = c.req.query('pattern_id');
  const topicId = c.req.query('topic_id');

  let questions: Question[];
  if (patternId) {
    questions = await questionRepository.findByPatternId(patternId);
  } else if (topicId) {
    questions = await questionRepository.findByTopicId(topicId);
  } else {
    questions = await questionRepository.findAll();
  }

  return c.json({
    success: true,
    data: questions.map((q) => ({
      id: q.id,
      pattern_id: q.pattern_id,
      topic_id: q.topic_id,
      text: q.text,
      difficulty: q.difficulty,
      is_pyq: q.is_pyq,
      is_variation: q.is_variation,
    })),
  });
});

/**
 * GET /studio/questions/:id
 * Get full question details
 */
studioQuestions.get('/:id', async (c) => {
  const id = c.req.param('id');
  const question = await questionRepository.findById(id);

  if (!question) {
    throw new NotFoundError('Question', id);
  }

  return c.json({
    success: true,
    data: question,
  });
});

/**
 * POST /studio/questions
 * Create a new question
 */
studioQuestions.post('/', async (c) => {
  const body = await c.req.json<Omit<Question, 'created_at'>>();

  if (!body.id || !body.pattern_id || !body.topic_id || !body.text?.en) {
    return c.json({ success: false, error: 'Missing required fields: id, pattern_id, topic_id, text.en' }, 400);
  }

  const question = await questionRepository.create(body);

  return c.json({
    success: true,
    data: question,
  }, 201);
});

/**
 * PUT /studio/questions/:id
 * Update an existing question
 */
studioQuestions.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Question>>();

  const existing = await questionRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Question', id);
  }

  const updated = await questionRepository.upsert({
    ...existing,
    ...body,
    id,
  });

  return c.json({
    success: true,
    data: updated,
  });
});

/**
 * DELETE /studio/questions/:id
 * Delete a question
 */
studioQuestions.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await questionRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Question', id);
  }

  await questionRepository.delete(id);

  return c.json({
    success: true,
    message: `Question ${id} deleted`,
  });
});

export { studioQuestions };
