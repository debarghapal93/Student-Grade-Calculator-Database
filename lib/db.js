const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;
let sqliteDb = null;

if (connectionString) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  // Built-in SQLite fallback for zero-config local testing when DATABASE_URL is not set
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(process.cwd(), 'students.db');
  sqliteDb = new DatabaseSync(dbPath);
}

let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;

  const createTablePostgres = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      roll_no VARCHAR(20) NOT NULL UNIQUE,
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTableSqlite = `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_no TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      web_tech INTEGER NOT NULL CHECK (web_tech >= 0 AND web_tech <= 100),
      dbms INTEGER NOT NULL CHECK (dbms >= 0 AND dbms <= 100),
      os INTEGER NOT NULL CHECK (os >= 0 AND os <= 100),
      data_structures INTEGER NOT NULL CHECK (data_structures >= 0 AND data_structures <= 100),
      maths INTEGER NOT NULL CHECK (maths >= 0 AND maths <= 100),
      total INTEGER NOT NULL,
      percentage REAL NOT NULL,
      grade TEXT NOT NULL,
      result TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  if (pool) {
    const client = await pool.connect();
    try {
      await client.query(createTablePostgres);
      tableInitialized = true;
    } finally {
      client.release();
    }
  } else if (sqliteDb) {
    sqliteDb.exec(createTableSqlite);
    tableInitialized = true;
  }
}

async function query(text, params = []) {
  await ensureTable();

  if (pool) {
    // PostgreSQL
    return await pool.query(text, params);
  }

  // SQLite fallback
  // Map $1, $2, ... to ?1, ?2, ... for exact positional parameter re-use in SQLite
  const sqliteSql = text.replace(/\$(\d+)/g, '?$1');
  const isSelect = /^\s*SELECT/i.test(sqliteSql);

  const statement = sqliteDb.prepare(sqliteSql);
  if (isSelect) {
    const rows = statement.all(...params);
    return { rows, rowCount: rows.length };
  } else {
    // For INSERT / UPDATE / DELETE with RETURNING
    try {
      if (/RETURNING/i.test(sqliteSql)) {
        const rows = statement.all(...params);
        return { rows, rowCount: rows.length };
      }
      const result = statement.run(...params);
      return { rows: [], rowCount: Number(result.changes) };
    } catch (err) {
      // Normalize unique constraint error
      if (err.message && (err.message.includes('UNIQUE constraint failed') || err.message.includes('PRIMARY KEY'))) {
        const customErr = new Error('Unique constraint violation');
        customErr.code = '23505'; // PostgreSQL unique_violation code
        throw customErr;
      }
      throw err;
    }
  }
}

module.exports = {
  query,
  ensureTable,
  isPostgres: () => Boolean(pool),
};
