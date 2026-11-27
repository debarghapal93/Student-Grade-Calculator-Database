# 🎓 Student Marks and Grade Calculator (Vercel + PostgreSQL)

> A modern full-stack Web application featuring automatic grade calculation, real-time client-side preview, serverless backend architecture, and persistent cloud PostgreSQL storage (via Neon Postgres). Deployed seamlessly on **Vercel**.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel)](#-how-to-deploy-on-vercel)
[![Database](https://img.shields.io/badge/Database-Neon%20Postgres-00e599.svg?logo=postgresql)](#-database-design--postgres-schema)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Grading Logic](#-grading-logic)
- [Postgres Database Schema](#-postgres-database-schema)
- [Vercel Serverless API Routes](#-vercel-serverless-api-routes)
- [Environment Variables](#-environment-variables)
- [How to Deploy on Vercel (Step-by-Step)](#-how-to-deploy-on-vercel-step-by-step)
- [How to Run Locally](#-how-to-run-locally)
- [Testing Matrix](#-testing-matrix)

---

## 📌 Project Overview
The **Student Marks and Grade Calculator** is a responsive web application that accepts a student's marks in five core subjects, calculates their total marks, percentage, letter grade, and pass/fail result, and persists records in a cloud PostgreSQL database.

### Core Highlights
- **100% Serverless & Cloud-Ready:** Built without PHP dependencies; uses Vercel Serverless Functions (`/api/*`) and cloud PostgreSQL.
- **Real-Time Client Preview:** Dynamic score updates without page reloads using vanilla JavaScript.
- **Dual-Layer Validation:** Inputs are checked in both the browser and serverless functions to guarantee data integrity (0–100 integer range).
- **Academic Grading Scheme:** Automatic failure (`F` grade) if any subject mark is below 35, regardless of total percentage.
- **SQL Injection Defense:** Fully parameterized queries (`$1, $2, ...`) using the official `pg` library.
- **XSS Sanitization:** All user-supplied output is safely escaped prior to DOM rendering.
- **No Resubmission Warnings:** Form submissions use asynchronous `fetch()` calls to prevent browser "Confirm Form Resubmission" prompts on reload.

---

## 🛠 Architecture & Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6) | Responsive UI, real-time calculation preview, search, and dynamic records table |
| **Backend** | Node.js (Vercel Serverless Functions) | Business logic, score validation, and database operations |
| **Database** | Neon Postgres / PostgreSQL | Cloud relational database connected via `DATABASE_URL` |
| **Hosting** | Vercel | Global edge hosting for frontend static files and serverless APIs |

---

## 🎯 Grading Logic

1. **Total:** Sum of marks across all 5 subjects (maximum 500).
2. **Percentage:** $\text{Total} \div 5$, rounded to two decimal places.
3. **Minimum Subject Qualification:** A student **must score $\ge 35$ in every subject**. If any subject score is $< 35$, the grade is automatically **`F`** and the result is **`Fail`**.
4. **Letter Grade Thresholds (when all subjects $\ge 35$):**
   - $\ge 90.00\% \implies$ **O** (Outstanding) — Pass
   - $80.00\% - 89.99\% \implies$ **A+** (Excellent) — Pass
   - $70.00\% - 79.99\% \implies$ **A** (Very Good) — Pass
   - $60.00\% - 69.99\% \implies$ **B** (Good) — Pass
   - $50.00\% - 59.99\% \implies$ **C** (Average) — Pass
   - $40.00\% - 49.99\% \implies$ **D** (Pass) — Pass
   - $< 40.00\% \implies$ **F** (Fail) — Fail

---

## 🗄 Postgres Database Schema

The schema is defined in [db/schema.sql](db/schema.sql) (and mirrored in [database.sql](database.sql)):

```sql
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
```

*(Note: The application executes this idempotent init step automatically once per cold start, ensuring the table exists without requiring manual SQL setup).*

---

## ⚡ Vercel Serverless API Routes

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/calculate` | `POST` | Validates student marks, calculates grade/result, and inserts record |
| `/api/records` | `GET` | Fetches all student records, with optional query `?q=` to search by name/roll |
| `/api/delete` | `POST` / `DELETE` | Deletes a student record by ID using a parameterized query |

---

## 🔑 Environment Variables

The application requires a PostgreSQL connection string to connect to your hosted database:

| Variable Name | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Connection string for Neon Postgres or PostgreSQL | `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `POSTGRES_URL` | Optional | Auto-populated if using Vercel Marketplace Neon integration | `postgresql://user:password@...` |

---

## 🚀 How to Deploy on Vercel (Step-by-Step)

### Step 1: Connect Neon Postgres (Vercel Marketplace)
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Open your project (e.g. `student-grade-calculator`).
3. Click on the **Storage** tab (or **Integrations** / **Marketplace**).
4. Click **Create Database** and select **Neon** (Serverless Postgres).
5. Follow the quick prompts to create the database in your preferred region.
6. Vercel will automatically add `DATABASE_URL` (and `POSTGRES_URL`) to your Project Environment Variables!

*(Alternatively, if you already have a Neon database on [neon.tech](https://neon.tech), copy your connection string and add it in **Settings** ➔ **Environment Variables** as `DATABASE_URL`).*

### Step 2: Push Your Code to GitHub
Push your latest changes to GitHub:
```bash
git add .
git commit -m "Migrate to Vercel Serverless Functions with Neon Postgres"
git push origin main
```

### Step 3: Verify Deployment
1. Vercel automatically detects the push and deploys your site.
2. Visit your live URL (e.g. `https://student-grade-calculator-one-khaki.vercel.app/`).
3. Fill out the form and submit: the record will calculate, save to Neon Postgres, and redirect to `results.html`!

---

## 💻 How to Run Locally

### Option 1: Standard Node.js Runner
1. Pull your live Neon Postgres environment variables or set `DATABASE_URL` in `.env.local`:
   ```bash
   vercel env pull .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm start
   ```
4. Open your browser at:
   👉 **[http://localhost:3000](http://localhost:3000)**

### Option 2: Using Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Link your project and pull environment variables:
   ```bash
   vercel link
   vercel env pull .env.local
   ```
3. Run the development server:
   ```bash
   vercel dev
   ```

### Option 3: Run Automated PostgreSQL Tests
```bash
npm test
```

---

## 🧪 Testing Matrix

| Test Case | Inputs Tested | Expected Result | Verified Status |
| :--- | :--- | :--- | :---: |
| **Standard Valid Record** | Web: 87, DBMS: 88, OS: 95, DS: 93, Maths: 79 | Total: 442, 88.40%, Grade: A+, Result: Pass | ✅ Passed |
| **Subject Failure Rule** | Web: 34, DBMS: 95, OS: 92, DS: 90, Maths: 94 | Grade: F, Result: Fail (failed individual subject) | ✅ Passed |
| **Out-of-Range (> 100)** | Web mark = 105 | Form submission rejected (400 Bad Request) | ✅ Passed |
| **Negative Mark** | Web mark = -10 | Form submission rejected (400 Bad Request) | ✅ Passed |
| **Duplicate Roll Number** | Same roll number submitted twice | HTTP 409 Conflict (PostgreSQL error 23505 caught) | ✅ Passed |
| **Dynamic Search** | Querying substring with `ILIKE` | Filtered records returned instantly | ✅ Passed |
| **Record Deletion** | Click Delete with confirmation prompt | Record removed from Postgres & table refreshed | ✅ Passed |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
