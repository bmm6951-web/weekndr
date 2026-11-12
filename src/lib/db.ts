import { Pool } from "pg";
import bcrypt from "bcryptjs";

// WEEKNDR_DATABASE_URL is the Neon connection string added by hand in Vercel;
// DATABASE_URL / POSTGRES_URL come from Vercel's Neon integration if it's connected.
const connectionString =
  process.env.WEEKNDR_DATABASE_URL ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

const globalForDb = globalThis as unknown as { pool?: Pool; schemaReady?: Promise<void> };

function getPool() {
  if (!connectionString) {
    throw new Error("No database configured. Set WEEKNDR_DATABASE_URL in Vercel.");
  }
  if (!globalForDb.pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
    globalForDb.pool = new Pool({
      connectionString,
      ssl: isLocal ? undefined : { rejectUnauthorized: true },
      max: 5,
    });
  }
  return globalForDb.pool;
}

export const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "password123!";

// Creates the tables (if missing) and makes sure the grader's demo account exists
// with full paid access. Runs once per server instance before the first query.
async function setupSchema() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_paid BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_customer_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      input JSONB NOT NULL,
      result JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS plans_user_id_idx ON plans(user_id);
    CREATE TABLE IF NOT EXISTS price_trackers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      weekend_index INTEGER NOT NULL,
      alerts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      flight JSONB,
      stays JSONB,
      flight_price NUMERIC,
      stay_price NUMERIC,
      prev_flight_price NUMERIC,
      prev_stay_price NUMERIC,
      checked_at TIMESTAMPTZ,
      UNIQUE (plan_id, weekend_index)
    );
    CREATE TABLE IF NOT EXISTS trip_reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      home_city TEXT NOT NULL,
      home_key TEXT NOT NULL,
      destination TEXT NOT NULL,
      dest_key TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      safety INTEGER NOT NULL CHECK (safety BETWEEN 1 AND 5),
      vibe TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      cost NUMERIC,
      currency TEXT NOT NULL DEFAULT 'EUR',
      trip_month TEXT,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, home_key, dest_key)
    );
    CREATE INDEX IF NOT EXISTS trip_reviews_home_idx ON trip_reviews(home_key);
  `);

  const demo = await pool.query("SELECT password_hash FROM users WHERE email = $1", [DEMO_EMAIL]);
  if (demo.rowCount === 0 || !(await bcrypt.compare(DEMO_PASSWORD, demo.rows[0].password_hash))) {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (email, name, password_hash, is_paid)
       VALUES ($1, 'Demo Student', $2, TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_paid = TRUE`,
      [DEMO_EMAIL, hash],
    );
  } else {
    await pool.query("UPDATE users SET is_paid = TRUE WHERE email = $1 AND is_paid = FALSE", [DEMO_EMAIL]);
  }
}

export async function db() {
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = setupSchema().catch((err) => {
      globalForDb.schemaReady = undefined; // retry on the next request
      throw err;
    });
  }
  await globalForDb.schemaReady;
  return getPool();
}
