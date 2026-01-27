import { Hono } from 'hono';
import { patternRepository } from '../../repositories/pattern.repository.js';
import { questionRepository } from '../../repositories/question.repository.js';
import { generateEmbedding } from '../../utils/embeddings.js';
import { NotFoundError } from '../../utils/errors.js';

const studioEmbeddings = new Hono();

/**
 * POST /studio/embeddings/generate
 * Generate embeddings for items without them
 */
studioEmbeddings.post('/generate', async (c) => {
  const body = await c.req.json<{ type: 'patterns' | 'questions'; ids?: string[] }>();
  const { type, ids } = body;

  let processed = 0;

  if (type === 'patterns') {
    const patterns = ids
      ? await Promise.all(ids.map((id) => patternRepository.findById(id)))
      : await patternRepository.findWithoutEmbedding(100);

    for (const pattern of patterns) {
      if (!pattern) continue;

      try {
        const text = pattern.signature.embedding_text;
        if (!text) continue;

        const embedding = await generateEmbedding(text);
        await patternRepository.updateEmbedding(pattern.id, embedding);
        processed++;
      } catch (error) {
        console.error(`Failed to generate embedding for pattern ${pattern.id}:`, error);
      }
    }
  } else if (type === 'questions') {
    const questions = ids
      ? await Promise.all(ids.map((id) => questionRepository.findById(id)))
      : await questionRepository.findWithoutEmbedding(100);

    for (const question of questions) {
      if (!question) continue;

      try {
        const text = question.text.en;
        if (!text) continue;

        const embedding = await generateEmbedding(text);
        await questionRepository.updateEmbedding(question.id, embedding);
        processed++;
      } catch (error) {
        console.error(`Failed to generate embedding for question ${question.id}:`, error);
      }
    }
  }

  return c.json({
    success: true,
    data: { processed },
  });
});

/**
 * POST /studio/embeddings/pattern/:id
 * Regenerate embedding for a specific pattern
 */
studioEmbeddings.post('/pattern/:id', async (c) => {
  const id = c.req.param('id');
  const pattern = await patternRepository.findById(id);

  if (!pattern) {
    throw new NotFoundError('Pattern', id);
  }

  const text = pattern.signature.embedding_text;
  if (!text) {
    return c.json({ success: false, error: 'Pattern has no embedding_text' }, 400);
  }

  const embedding = await generateEmbedding(text);
  await patternRepository.updateEmbedding(id, embedding);

  return c.json({
    success: true,
    message: `Embedding regenerated for pattern ${id}`,
  });
});

/**
 * POST /studio/embeddings/question/:id
 * Regenerate embedding for a specific question
 */
studioEmbeddings.post('/question/:id', async (c) => {
  const id = c.req.param('id');
  const question = await questionRepository.findById(id);

  if (!question) {
    throw new NotFoundError('Question', id);
  }

  const text = question.text.en;
  const embedding = await generateEmbedding(text);
  await questionRepository.updateEmbedding(id, embedding);

  return c.json({
    success: true,
    message: `Embedding regenerated for question ${id}`,
  });
});

export { studioEmbeddings };
