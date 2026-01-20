import { Hono } from 'hono';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { visionService } from '../services/vision.service.js';
import {
  contentGeneratorService,
  type GenerationResult,
} from '../services/content-generator.service.js';
import { ValidationError } from '../utils/errors.js';

const contentIngestion = new Hono();

// Store pending content for review (in-memory, session-based)
// In production, you might want to use Redis or database
const pendingContent = new Map<string, GenerationResult>();

/**
 * POST /content/process-photo
 * Process a photo and extract content, return preview for review
 *
 * Body (multipart/form-data):
 * - photo: File (image/jpeg, image/png, image/webp)
 * - topic_id?: string (optional, will be guessed if not provided)
 * - pattern_id?: string (optional, for adding to existing pattern)
 * - is_variation?: boolean (default: false)
 * - force_new_pattern?: boolean (default: auto-detect)
 */
contentIngestion.post('/process-photo', async (c) => {
  const body = await c.req.parseBody();

  // Get the uploaded file
  const file = body['photo'];
  if (!file || !(file instanceof File)) {
    throw new ValidationError('No photo provided. Send as multipart form with field name "photo"');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`
    );
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError(
      `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: 10MB`
    );
  }

  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  // Extract content from image
  console.log('📷 Processing image...');
  const extracted = await visionService.extractFromImage(base64, true);
  console.log('✓ Content extracted:', {
    question: extracted.question_text_en.substring(0, 50) + '...',
    topic: extracted.topic_guess,
    confidence: extracted.confidence,
  });

  // Get optional parameters
  const topicId = (body['topic_id'] as string) || extracted.topic_guess;
  const patternId = body['pattern_id'] as string | undefined;
  const isVariation = body['is_variation'] === 'true';
  const forceNewPattern = body['force_new_pattern'] === 'true';

  // Determine pattern ID and question ID
  let finalPatternId = patternId;
  let finalQuestionId: string | undefined;

  if (!finalPatternId && !forceNewPattern && !extracted.is_likely_new_pattern) {
    // This looks like a variation, but no pattern ID provided
    console.log(
      '⚠ No pattern_id provided, but content looks like variation. Generating as new pattern.'
    );
  }

  // If pattern_id provided, generate next question ID
  if (finalPatternId) {
    finalQuestionId = await getNextQuestionId(topicId, finalPatternId);
  } else {
    // Generate new pattern ID
    finalPatternId = await getNextPatternId(topicId);
    finalQuestionId = `${finalPatternId}-q-001`;
  }

  // Generate content
  console.log('🔧 Generating JSON...');
  const result = await contentGeneratorService.generateFromExtracted(extracted, {
    topicId,
    patternId: finalPatternId,
    questionId: finalQuestionId,
    forceNewPattern: forceNewPattern || !patternId,
    isVariation,
  });

  // Generate a session ID for this pending content
  const sessionId = crypto.randomUUID();
  pendingContent.set(sessionId, result);

  // Auto-expire after 30 minutes
  setTimeout(() => {
    pendingContent.delete(sessionId);
  }, 30 * 60 * 1000);

  console.log('✓ Content generated, session:', sessionId);

  return c.json({
    status: 'preview',
    session_id: sessionId,
    extracted: {
      question_text: extracted.question_text_en,
      topic_guess: extracted.topic_guess,
      pattern_description: extracted.pattern_description,
      is_likely_new_pattern: extracted.is_likely_new_pattern,
      confidence: extracted.confidence,
      warnings: extracted.warnings,
    },
    generated: {
      is_new_pattern: result.is_new_pattern,
      pattern_id: result.suggested_pattern_id,
      question_id: result.suggested_question_id,
      pattern: result.pattern || null,
      question: result.question,
    },
    warnings: result.warnings,
    next_steps: {
      to_save: `POST /content/save with { "session_id": "${sessionId}" }`,
      to_modify: 'Send updated pattern/question in save request',
      to_cancel: 'Do nothing, session expires in 30 minutes',
    },
  });
});

/**
 * POST /content/process-photos
 * Process multiple photos (e.g., question + solution on separate images)
 */
contentIngestion.post('/process-photos', async (c) => {
  const body = await c.req.parseBody();

  // Get all uploaded files (photo1, photo2, etc. or photos[])
  const files: File[] = [];

  // Handle array format: photos[]
  for (let i = 0; i < 10; i++) {
    const file = body[`photos[${i}]`] || body[`photo${i + 1}`];
    if (file && file instanceof File) {
      files.push(file);
    }
  }

  // Also check for single photos array
  const photosArray = body['photos'];
  if (Array.isArray(photosArray)) {
    for (const file of photosArray) {
      if (file instanceof File) {
        files.push(file);
      }
    }
  }

  if (files.length === 0) {
    throw new ValidationError(
      'No photos provided. Send as multipart form with field names "photo1", "photo2", etc. or "photos[]"'
    );
  }

  if (files.length > 5) {
    throw new ValidationError('Maximum 5 photos allowed');
  }

  // Convert all files to base64
  const images: Array<{ data: string; isBase64: boolean }> = [];
  for (const file of files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError(`Invalid file type: ${file.type}`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    images.push({ data: base64, isBase64: true });
  }

  console.log(`📷 Processing ${images.length} images...`);
  const extracted = await visionService.extractFromMultipleImages(images);
  console.log('✓ Content extracted from multiple images');

  // Same flow as single photo
  const topicId = (body['topic_id'] as string) || extracted.topic_guess;
  const patternId = body['pattern_id'] as string | undefined;
  const isVariation = body['is_variation'] === 'true';
  const forceNewPattern = body['force_new_pattern'] === 'true';

  let finalPatternId = patternId;
  let finalQuestionId: string | undefined;

  if (finalPatternId) {
    finalQuestionId = await getNextQuestionId(topicId, finalPatternId);
  } else {
    finalPatternId = await getNextPatternId(topicId);
    finalQuestionId = `${finalPatternId}-q-001`;
  }

  const result = await contentGeneratorService.generateFromExtracted(extracted, {
    topicId,
    patternId: finalPatternId,
    questionId: finalQuestionId,
    forceNewPattern: forceNewPattern || !patternId,
    isVariation,
  });

  const sessionId = crypto.randomUUID();
  pendingContent.set(sessionId, result);

  setTimeout(() => {
    pendingContent.delete(sessionId);
  }, 30 * 60 * 1000);

  return c.json({
    status: 'preview',
    session_id: sessionId,
    images_processed: images.length,
    extracted: {
      question_text: extracted.question_text_en,
      topic_guess: extracted.topic_guess,
      pattern_description: extracted.pattern_description,
      is_likely_new_pattern: extracted.is_likely_new_pattern,
      confidence: extracted.confidence,
    },
    generated: {
      is_new_pattern: result.is_new_pattern,
      pattern_id: result.suggested_pattern_id,
      question_id: result.suggested_question_id,
      pattern: result.pattern || null,
      question: result.question,
    },
    warnings: result.warnings,
  });
});

/**
 * POST /content/save
 * Save the pending content to filesystem
 *
 * Body (JSON):
 * - session_id: string (required)
 * - pattern?: object (optional, override generated pattern)
 * - question?: object (optional, override generated question)
 */
contentIngestion.post('/save', async (c) => {
  const body = await c.req.json();

  const sessionId = body.session_id;
  if (!sessionId) {
    throw new ValidationError('session_id is required');
  }

  const pending = pendingContent.get(sessionId);
  if (!pending) {
    throw new ValidationError(
      'Session not found or expired. Please process the photo again.'
    );
  }

  // Allow overriding generated content
  const patternToSave = body.pattern || pending.pattern;
  const questionToSave = body.question || pending.question;

  // Validate IDs
  if (!questionToSave.id || !questionToSave.pattern_id || !questionToSave.topic_id) {
    throw new ValidationError(
      'Question must have id, pattern_id, and topic_id'
    );
  }

  if (pending.is_new_pattern && patternToSave) {
    if (!patternToSave.id || !patternToSave.topic_id) {
      throw new ValidationError('Pattern must have id and topic_id');
    }
  }

  const contentPath = path.resolve(config.content.path);
  const topicPath = path.join(contentPath, 'topics', questionToSave.topic_id);

  // Ensure directories exist
  const patternsDir = path.join(topicPath, 'patterns');
  const questionsDir = path.join(topicPath, 'questions');

  if (!existsSync(patternsDir)) {
    await mkdir(patternsDir, { recursive: true });
  }
  if (!existsSync(questionsDir)) {
    await mkdir(questionsDir, { recursive: true });
  }

  const savedFiles: string[] = [];

  // Save pattern if new
  if (pending.is_new_pattern && patternToSave) {
    const patternFile = path.join(patternsDir, `${patternToSave.id}.json`);

    if (existsSync(patternFile)) {
      throw new ValidationError(
        `Pattern file already exists: ${patternToSave.id}.json. Use a different ID or update manually.`
      );
    }

    await writeFile(patternFile, JSON.stringify(patternToSave, null, 2));
    savedFiles.push(`patterns/${patternToSave.id}.json`);
    console.log('✓ Saved pattern:', patternToSave.id);
  }

  // Save question
  const questionFile = path.join(questionsDir, `${questionToSave.id}.json`);

  if (existsSync(questionFile)) {
    throw new ValidationError(
      `Question file already exists: ${questionToSave.id}.json. Use a different ID or update manually.`
    );
  }

  await writeFile(questionFile, JSON.stringify(questionToSave, null, 2));
  savedFiles.push(`questions/${questionToSave.id}.json`);
  console.log('✓ Saved question:', questionToSave.id);

  // Clean up session
  pendingContent.delete(sessionId);

  return c.json({
    status: 'saved',
    topic: questionToSave.topic_id,
    files_created: savedFiles,
    pattern_id: questionToSave.pattern_id,
    question_id: questionToSave.id,
    next_steps: [
      'Run `npm run seed` to load content into database',
      'Run `npm run generate-embeddings` to generate embeddings',
    ],
  });
});

/**
 * GET /content/pending/:sessionId
 * Get pending content for a session
 */
contentIngestion.get('/pending/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId');
  const pending = pendingContent.get(sessionId);

  if (!pending) {
    throw new ValidationError('Session not found or expired');
  }

  return c.json({
    status: 'pending',
    session_id: sessionId,
    is_new_pattern: pending.is_new_pattern,
    pattern: pending.pattern || null,
    question: pending.question,
    warnings: pending.warnings,
  });
});

/**
 * DELETE /content/pending/:sessionId
 * Cancel pending content
 */
contentIngestion.delete('/pending/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId');
  const existed = pendingContent.delete(sessionId);

  return c.json({
    status: existed ? 'cancelled' : 'not_found',
    message: existed
      ? 'Pending content cancelled'
      : 'Session was already expired or not found',
  });
});

/**
 * GET /content/next-ids/:topicId
 * Get the next available pattern and question IDs for a topic
 */
contentIngestion.get('/next-ids/:topicId', async (c) => {
  const topicId = c.req.param('topicId');

  const nextPatternId = await getNextPatternId(topicId);
  const nextQuestionId = `${nextPatternId}-q-001`;

  return c.json({
    topic_id: topicId,
    next_pattern_id: nextPatternId,
    next_question_id: nextQuestionId,
  });
});

// Helper functions

/**
 * Get the next available pattern ID for a topic
 */
async function getNextPatternId(topicId: string): Promise<string> {
  const contentPath = path.resolve(config.content.path);
  const patternsDir = path.join(contentPath, 'topics', topicId, 'patterns');

  // Topic prefix mapping
  const prefixMap: Record<string, string> = {
    percentage: 'pc',
    'profit-loss': 'pl',
    'time-work': 'tw',
    'time-distance': 'td',
    'ratio-proportion': 'rp',
    'simple-interest': 'si',
    'compound-interest': 'ci',
    average: 'av',
    mixture: 'mx',
    algebra: 'al',
    geometry: 'gm',
    trigonometry: 'tr',
    mensuration: 'mn',
    'number-system': 'ns',
  };

  const prefix = prefixMap[topicId] || topicId.substring(0, 2);

  if (!existsSync(patternsDir)) {
    return `${prefix}-001`;
  }

  try {
    const files = await readdir(patternsDir);
    const patternFiles = files.filter(
      (f) => f.endsWith('.json') && !f.startsWith('_')
    );

    // Extract numbers from pattern IDs
    const numbers = patternFiles
      .map((f) => {
        const match = f.match(new RegExp(`^${prefix}-(\\d+)\\.json$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');

    return `${prefix}-${nextNumber}`;
  } catch {
    return `${prefix}-001`;
  }
}

/**
 * Get the next available question ID for a pattern
 */
async function getNextQuestionId(
  topicId: string,
  patternId: string
): Promise<string> {
  const contentPath = path.resolve(config.content.path);
  const questionsDir = path.join(contentPath, 'topics', topicId, 'questions');

  if (!existsSync(questionsDir)) {
    return `${patternId}-q-001`;
  }

  try {
    const files = await readdir(questionsDir);
    const questionFiles = files.filter(
      (f) => f.startsWith(`${patternId}-q-`) && f.endsWith('.json')
    );

    // Extract numbers from question IDs
    const numbers = questionFiles
      .map((f) => {
        const match = f.match(new RegExp(`^${patternId}-q-(\\d+)\\.json$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');

    return `${patternId}-q-${nextNumber}`;
  } catch {
    return `${patternId}-q-001`;
  }
}

export { contentIngestion };
