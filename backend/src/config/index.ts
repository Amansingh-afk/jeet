import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://jeet:jeet@localhost:5432/jeet',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  content: {
    path: process.env.CONTENT_PATH || '../content',
  },
} as const;

// Validate required config
export function validateConfig() {
  const required = ['OPENAI_API_KEY', 'DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && !config.isDev) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not set. LLM features will not work.');
  }
}
