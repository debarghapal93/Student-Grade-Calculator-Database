require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

let pool = null;
let tableInitialized = false;

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

function getPool() {
  if (pool) return pool;

  const connectionString = getConnectionString();

  if (!connectionString) {
    // If running in Vercel production or serverless environment, throw explicit config error
    if (process.env.VERCEL) {
      throw new Error(
        'DATABASE_URL or POSTGRES_URL environment variable is missing on Vercel. ' +
        'Please connect Neon Postgres via Vercel Marketplace (Storage tab) or add DATABASE_URL under Project Settings -> Environment Variables.'
      );
    }

    // In local development, if .env.local has not been pulled yet, fall back to in-memory Postgres emulator
    console.warn('⚠️ [DEV WARNING] DATABASE_URL is not set in .env.local. Using in-memory PostgreSQL emulator for local testing.');
    const { newDb } = require('pg-mem');
    const memDb = newDb();
    const { Pool } = memDb.adapters.createPg();
    pool = new Pool();
    return pool;
  }

  // Use @neondatabase/serverless for Neon cloud connections, or pg for standard PostgreSQL
  const isNeon = connectionString.includes('neon.tech');
  if (isNeon) {
    const { Pool } = require('@neondatabase/serverless');
    pool = new Pool({ connectionString });
  } else {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  return pool;
}

async function ensureTable(activePool) {
  if (tableInitialized) return;

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      roll_no VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      class_name VARCHAR(50) NOT NULL,
      web_tech SMALLINT NOT NULL CHECK (web_tech >= 0 AND web_tech <= 100),
      dbms SMALLINT NOT NULL CHECK (dbms >= 0 AND dbms <= 100),
      os SMALLINT NOT NULL CHECK (os >= 0 AND os <= 100),
      data_structures SMALLINT NOT NULL CHECK (data_structures >= 0 AND data_structures <= 100),
      maths SMALLINT NOT NULL CHECK (maths >= 0 AND maths <= 100),
      total SMALLINT NOT NULL,
      percentage NUMERIC(5,2) NOT NULL,
      grade VARCHAR(2) NOT NULL,
      result VARCHAR(4) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students (roll_no);
    CREATE INDEX IF NOT EXISTS idx_students_name ON students (name);
  `;

  await activePool.query(schemaSql);
  tableInitialized = true;
}

async function query(text, params = []) {
  const activePool = getPool();
  await ensureTable(activePool);
  return await activePool.query(text, params);
}

module.exports = {
  query,
  ensureTable: () => ensureTable(getPool()),
  getConnectionString,
};
