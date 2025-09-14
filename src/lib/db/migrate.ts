import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, migrationClient } from './index';

async function runMigrations() {
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './src/lib/db/migrations' });
  
  await migrationClient.end();
  
  console.log('Migrations completed!');
}
runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});
