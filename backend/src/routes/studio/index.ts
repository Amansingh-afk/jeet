import { Hono } from 'hono';
import { studioPatterns } from './patterns.js';
import { studioQuestions } from './questions.js';
import { studioTemplates } from './templates.js';
import { studioEmbeddings } from './embeddings.js';
import { studioExport } from './export.js';
import { studioStats } from './stats.js';

const studio = new Hono();

// Mount sub-routes
studio.route('/patterns', studioPatterns);
studio.route('/questions', studioQuestions);
studio.route('/templates', studioTemplates);
studio.route('/embeddings', studioEmbeddings);
studio.route('/export', studioExport);
studio.route('/stats', studioStats);

export { studio };
