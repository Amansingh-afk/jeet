import { serve } from '@hono/node-server';
import { app } from './app.js';
import { config, validateConfig } from './config/index.js';
import { testConnection, closePool } from './config/database.js';

async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Jeet Backend Server');
  console.log('='.repeat(50));

  // Validate configuration
  try {
    validateConfig();
    console.log('✓ Configuration validated');
  } catch (error) {
    console.error('✗ Configuration error:', error);
    process.exit(1);
  }

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('✗ Database connection failed. Is PostgreSQL running?');
    console.log('\nTry: docker-compose up -d postgres');
    process.exit(1);
  }

  // Start server
  const server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  console.log(`\n🚀 Server running at http://localhost:${config.port}`);
  console.log(`📚 Environment: ${config.nodeEnv}`);
  console.log('\nEndpoints:');
  console.log(`  GET  /           - Health check`);
  console.log(`  GET  /topics     - List topics`);
  console.log(`  GET  /patterns   - List patterns`);
  console.log(`  GET  /questions  - Get questions`);
  console.log(`  GET  /templates  - List templates`);
  console.log(`  POST /chat       - Chat with Jeetu (streaming)`);
  console.log(`  POST /chat/test  - Test chat (non-streaming)`);
  console.log('\n' + '='.repeat(50) + '\n');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n\nShutting down gracefully...');
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
