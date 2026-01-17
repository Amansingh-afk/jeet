import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query, closePool } from '../src/config/database.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'migrations');
async function ensureMigrationsTable() {
    await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
async function getAppliedMigrations() {
    const result = await query('SELECT name FROM _migrations ORDER BY id');
    return result.rows.map((r) => r.name);
}
async function recordMigration(name) {
    await query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
}
async function runMigrations() {
    console.log('Starting migrations...\n');
    try {
        // Ensure migrations table exists
        await ensureMigrationsTable();
        // Get list of applied migrations
        const applied = await getAppliedMigrations();
        console.log(`Already applied: ${applied.length} migrations`);
        // Get migration files
        const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();
        // Run pending migrations
        let newMigrations = 0;
        for (const file of files) {
            if (applied.includes(file)) {
                console.log(`  [skip] ${file}`);
                continue;
            }
            console.log(`  [run]  ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            // Run migration in a transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                newMigrations++;
                console.log(`         ✓ Applied successfully`);
            }
            catch (error) {
                await client.query('ROLLBACK');
                console.error(`         ✗ Failed:`, error);
                throw error;
            }
            finally {
                client.release();
            }
        }
        console.log(`\nMigrations complete. Applied ${newMigrations} new migration(s).`);
    }
    finally {
        await closePool();
    }
}
// Run
runMigrations().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map