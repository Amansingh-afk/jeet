import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler, notFound } from './middleware/error-handler.js';

// Routes
import { topics } from './routes/topics.js';
import { patterns } from './routes/patterns.js';
import { questions } from './routes/questions.js';
import { templates } from './routes/templates.js';
import { chat } from './routes/chat.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', errorHandler);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Jeet API',
    version: '1.0.0',
    status: 'healthy',
    message: 'Jeetu Bhaiya is ready to help! 🎯',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/topics', topics);
app.route('/patterns', patterns);
app.route('/questions', questions);
app.route('/templates', templates);
app.route('/chat', chat);

// 404 handler
app.notFound(notFound);

export { app };
