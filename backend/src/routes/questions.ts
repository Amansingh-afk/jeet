import { Hono } from 'hono';
import { questionRepository } from '../repositories/question.repository.js';
import { patternRepository } from '../repositories/pattern.repository.js';
import { NotFoundError } from '../utils/errors.js';

const questions = new Hono();

/**
 * GET /questions/:id
 * Get a specific question with its solution
 */
questions.get('/:id', async (c) => {
  const id = c.req.param('id');
  const question = await questionRepository.findById(id);

  if (!question) {
    throw new NotFoundError('Question', id);
  }

  // Optionally include pattern info
  const includePattern = c.req.query('include_pattern') === 'true';
  let pattern = null;

  if (includePattern) {
    pattern = await patternRepository.findById(question.pattern_id);
  }

  return c.json({
    success: true,
    data: {
      ...question,
      pattern: pattern
        ? {
            id: pattern.id,
            name: pattern.name,
            trick: pattern.trick,
          }
        : undefined,
    },
  });
});

/**
 * GET /questions/by-topic/:topicId
 * Get questions for a topic
 */
questions.get('/by-topic/:topicId', async (c) => {
  const topicId = c.req.param('topicId');
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const questionList = await questionRepository.findByTopicId(topicId, {
    limit,
    offset,
  });

  return c.json({
    success: true,
    data: {
      topic_id: topicId,
      questions: questionList,
      pagination: {
        limit,
        offset,
        has_more: questionList.length === limit,
      },
    },
  });
});

/**
 * POST /questions/:id/check
 * Check an answer (for future progress tracking)
 */
questions.post('/:id/check', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { selected_option, time_taken_seconds } = body;

  const question = await questionRepository.findById(id);

  if (!question) {
    throw new NotFoundError('Question', id);
  }

  const isCorrect = selected_option === question.correct_option;

  return c.json({
    success: true,
    data: {
      question_id: id,
      is_correct: isCorrect,
      correct_option: question.correct_option,
      solution: question.solution,
      time_taken_seconds,
    },
  });
});

export { questions };
