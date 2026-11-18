import pg from 'pg';

// Один раз перед всеми e2e-тестами: создаём базу meetup_test, если её ещё нет.
// Нужен запущенный Postgres: npm run db:up
export default async function setup() {
  const client = new pg.Client({ connectionString: 'postgres://meetup:meetup@localhost:5437/postgres' });
  await client.connect();
  const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = 'meetup_test'");
  if (rowCount === 0) await client.query('CREATE DATABASE meetup_test');
  await client.end();
}
