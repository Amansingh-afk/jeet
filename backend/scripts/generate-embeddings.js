import { closePool, query } from '../src/config/database.js';
import { generateEmbedding, formatEmbeddingForPg, createPatternEmbeddingText, normalizeForEmbedding, } from '../src/utils/embeddings.js';
// Parse command line args
const args = process.argv.slice(2);
const mode = args.includes('--all') ? 'all' : 'new';
const skipPatterns = args.includes('--skip-patterns');
const skipQuestions = args.includes('--skip-questions');
async function clearEmbeddings() {
    console.log('Clearing all existing embeddings...');
    await query('UPDATE patterns SET embedding = NULL');
    await query('UPDATE questions SET embedding = NULL');
    console.log('  ✓ Cleared\n');
}
async function generatePatternEmbeddings() {
    console.log('Generating pattern embeddings...\n');
    // Get patterns based on mode
    const whereClause = mode === 'all' ? '' : 'WHERE embedding IS NULL';
    const result = await query(`
    SELECT id, name, signature
    FROM patterns
    ${whereClause}
  `);
    const patterns = result.rows;
    console.log(`Found ${patterns.length} patterns to process`);
    if (patterns.length === 0) {
        console.log('Nothing to do.');
        return { success: 0, failed: 0 };
    }
    let success = 0;
    let failed = 0;
    for (const pattern of patterns) {
        try {
            const text = createPatternEmbeddingText(pattern);
            console.log(`  [${pattern.id}] "${pattern.name.slice(0, 40)}..."`);
            const embedding = await generateEmbedding(text);
            const embeddingStr = formatEmbeddingForPg(embedding);
            await query('UPDATE patterns SET embedding = $1::vector, updated_at = NOW() WHERE id = $2', [embeddingStr, pattern.id]);
            console.log(`         ✓ Generated (${embedding.length} dimensions)`);
            success++;
            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        catch (error) {
            console.error(`         ✗ Failed:`, error);
            failed++;
        }
    }
    console.log(`\nPattern embeddings: ${success} success, ${failed} failed`);
    return { success, failed };
}
async function generateQuestionEmbeddings() {
    console.log('\nGenerating question embeddings...\n');
    // Get questions based on mode
    const whereClause = mode === 'all' ? '' : 'WHERE embedding IS NULL';
    const result = await query(`
    SELECT id, text_en
    FROM questions
    ${whereClause}
  `);
    const questions = result.rows;
    console.log(`Found ${questions.length} questions to process`);
    if (questions.length === 0) {
        console.log('Nothing to do.');
        return { success: 0, failed: 0 };
    }
    let success = 0;
    let failed = 0;
    for (const question of questions) {
        try {
            const normalizedText = normalizeForEmbedding(question.text_en);
            console.log(`  [${question.id}] "${normalizedText.slice(0, 50)}..."`);
            const embedding = await generateEmbedding(normalizedText);
            const embeddingStr = formatEmbeddingForPg(embedding);
            await query('UPDATE questions SET embedding = $1::vector WHERE id = $2', [embeddingStr, question.id]);
            console.log(`         ✓ Generated`);
            success++;
            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        catch (error) {
            console.error(`         ✗ Failed:`, error);
            failed++;
        }
    }
    console.log(`\nQuestion embeddings: ${success} success, ${failed} failed`);
    return { success, failed };
}
async function createVectorIndexes() {
    console.log('\nCreating/updating vector indexes...');
    try {
        // Drop existing indexes first if regenerating all
        if (mode === 'all') {
            console.log('  Dropping existing indexes...');
            await query('DROP INDEX IF EXISTS idx_patterns_embedding');
            await query('DROP INDEX IF EXISTS idx_questions_embedding');
        }
        // Check patterns count
        const patternCount = await query("SELECT COUNT(*) as count FROM patterns WHERE embedding IS NOT NULL");
        const pCount = parseInt(patternCount.rows[0].count, 10);
        if (pCount > 0) {
            const lists = Math.max(1, Math.floor(Math.sqrt(pCount)));
            console.log(`  Creating index on patterns (${pCount} rows, ${lists} lists)...`);
            await query(`
        CREATE INDEX IF NOT EXISTS idx_patterns_embedding
        ON patterns USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = ${lists})
      `);
            console.log('  ✓ Pattern index created');
        }
        // Check questions count
        const questionCount = await query("SELECT COUNT(*) as count FROM questions WHERE embedding IS NOT NULL");
        const qCount = parseInt(questionCount.rows[0].count, 10);
        if (qCount > 0) {
            const lists = Math.max(1, Math.floor(Math.sqrt(qCount)));
            console.log(`  Creating index on questions (${qCount} rows, ${lists} lists)...`);
            await query(`
        CREATE INDEX IF NOT EXISTS idx_questions_embedding
        ON questions USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = ${lists})
      `);
            console.log('  ✓ Question index created');
        }
    }
    catch (error) {
        console.error('  ✗ Index creation failed:', error);
    }
}
async function main() {
    console.log('='.repeat(50));
    console.log('Jeet Embedding Generator');
    console.log('='.repeat(50));
    console.log(`\nMode: ${mode === 'all' ? 'REGENERATE ALL' : 'NEW ONLY (incremental)'}`);
    if (skipPatterns)
        console.log('Skipping patterns');
    if (skipQuestions)
        console.log('Skipping questions');
    console.log('');
    try {
        // Clear embeddings if regenerating all
        if (mode === 'all') {
            await clearEmbeddings();
        }
        let patternStats = { success: 0, failed: 0 };
        let questionStats = { success: 0, failed: 0 };
        if (!skipPatterns) {
            patternStats = await generatePatternEmbeddings();
        }
        if (!skipQuestions) {
            questionStats = await generateQuestionEmbeddings();
        }
        await createVectorIndexes();
        console.log('\n' + '='.repeat(50));
        console.log('Embedding generation complete!');
        console.log(`  Patterns:  ${patternStats.success} success, ${patternStats.failed} failed`);
        console.log(`  Questions: ${questionStats.success} success, ${questionStats.failed} failed`);
        console.log('='.repeat(50));
    }
    finally {
        await closePool();
    }
}
// Help text
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Jeet Embedding Generator

Usage:
  npm run generate-embeddings [options]

Options:
  (no args)         Generate embeddings for NEW entries only (incremental)
  --all             Regenerate ALL embeddings from scratch
  --skip-patterns   Skip pattern embeddings
  --skip-questions  Skip question embeddings
  --help, -h        Show this help

Examples:
  npm run generate-embeddings              # Only new entries
  npm run generate-embeddings -- --all     # Regenerate everything
  npm run generate-embeddings -- --all --skip-questions  # Patterns only, from scratch
`);
    process.exit(0);
}
main().catch((error) => {
    console.error('Embedding generation failed:', error);
    process.exit(1);
});
//# sourceMappingURL=generate-embeddings.js.map