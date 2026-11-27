-- PostgreSQL Schema / Migration for Student Marks and Grade Calculator
-- Compatible with Neon Postgres, Supabase, and standard PostgreSQL 12+

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

-- Index on roll_no and name for fast search
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students (roll_no);
CREATE INDEX IF NOT EXISTS idx_students_name ON students (name);
