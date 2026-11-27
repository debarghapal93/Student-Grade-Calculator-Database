# 🎓 Student Marks and Grade Calculator with Database Management

> A complete full-stack Web Technology project implementing student mark assessment, automatic grade calculation, real-time client-side preview, server-side data validation, and persistent relational database storage with full CRUD capabilities.

[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20PHP%20%7C%20MySQL-blue.svg)](#-technologies-and-tools-used)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technologies and Tools Used](#-technologies-and-tools-used)
- [System Architecture](#-system-architecture)
- [Database Design & Schema](#-database-design--schema)
- [Grading Logic & Algorithm](#-grading-logic--algorithm)
- [File & Directory Structure](#-file--directory-structure)
- [How It Works (Implementation Details)](#-how-it-works-implementation-details)
  - [1. User Input & Real-Time Preview](#1-user-input--real-time-preview)
  - [2. Dual-Layer Validation](#2-dual-layer-validation)
  - [3. Backend Processing & Database Persistence](#3-backend-processing--database-persistence)
  - [4. Records Retrieval & Search](#4-records-retrieval--search)
  - [5. Record Deletion](#5-record-deletion)
- [Security Implementations](#-security-implementations)
- [Setup & Installation Guide](#-setup--installation-guide)
  - [Option A: Running with XAMPP (Apache + MySQL)](#option-a-running-with-xampp-apache--mysql)
  - [Option B: Instant Local Server (Python / Zero Dependencies)](#option-b-instant-local-server-python--zero-dependencies)
- [Testing Matrix](#-testing-matrix)

---

## 📌 Project Overview
In many academic institutions, mark tabulation and grade assignments are performed manually or with unstandardized spreadsheets. This conventional workflow frequently leads to calculation discrepancies, subjective grading boundary errors, duplicate records, and tedious record retrieval.

The **Student Marks and Grade Calculator** is a robust, responsive web application engineered to solve this challenge. It provides:
1. A streamlined web form to enter student details and marks for **five subjects**:
   - Web Technology
   - Database Management Systems (DBMS)
   - Operating Systems (OS)
   - Data Structures
   - Mathematics
2. Real-time dynamic preview of total marks (out of 500) and percentage as marks are typed.
3. Automated letter grade assignment and Pass/Fail result determination.
4. Permanent storage in a **MySQL** relational database with unique roll-number enforcement.
5. An interactive dashboard to view, filter/search by roll number or name, and delete records.

---

## ✨ Key Features
- **Real-Time Client Preview:** Dynamic score updates without page reloads using vanilla JavaScript event listeners.
- **Strict Dual-Layer Validation:** Inputs are checked in both the browser (JavaScript) and the backend (PHP) to prevent malformed data.
- **Fail-Safe Academic Rules:** If a student scores below 35 in any single subject, they are awarded an **F (Fail)** grade regardless of total percentage.
- **SQL Injection Defense:** Prepared statements (`bind_param`) parameterized queries for every database interaction.
- **Cross-Site Scripting (XSS) Prevention:** Output sanitization using `htmlspecialchars()` across all rendered dynamic data.
- **Duplicate Prevention:** Unique constraint on `roll_no` caught gracefully with user-friendly notices.
- **Live Search & Filter:** Instant search across roll numbers and student names.
- **Clean Responsive UI:** Modern card-based design with mobile responsiveness, clean typography, and status badges.

---

## 🛠 Technologies and Tools Used

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Markup & Structure** | **HTML5** | Standard | Semantic forms, inputs, tables, and modal elements |
| **Styling & Layout** | **CSS3** | Standard | Responsive layout, flexbox, custom form controls, color palettes, and badges |
| **Client-Side Scripting** | **JavaScript (ES6)** | ECMAScript 2015+ | Event handling, DOM manipulation, live score computation, and form validation |
| **Server-Side Engine** | **PHP** | 8.x / 7.4+ | Request processing, data validation, mathematical grading rules, and database CRUD |
| **Relational Database** | **MySQL / MariaDB** | 8.0+ / 10.4+ | Persistent storage, index management, unique key enforcement, and relational querying |
| **Local Web Server** | **Apache (via XAMPP / WAMP)** | 2.4+ | Hosts PHP and manages HTTP requests on localhost |
| **Dev Environment Runner** | **Python** | 3.8+ | Provides zero-dependency instant local test server (`server.py`) with SQLite |

---

## 🏛 System Architecture

The application adopts a classic **Three-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Tier                        │
│   (HTML5, CSS3, JavaScript - index.html, style.css, script.js)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP POST / GET
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Tier                        │
│   (PHP 8 / Apache Server - calculate.php, results.php,       │
│    delete.php, config.php)                                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ MySQLi (Prepared Statements)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Tier                            │
│   (MySQL / MariaDB - Database: student_db, Table: students)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Design & Schema

### Database: `student_db`
### Table: `students`

| Field | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique internal record identifier |
| `roll_no` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE` | Student's official roll number |
| `name` | `VARCHAR(100)` | `NOT NULL` | Student full name |
| `class_name` | `VARCHAR(50)` | `NOT NULL` | Class / section / department |
| `web_tech` | `TINYINT UNSIGNED`| `NOT NULL` (0 to 100) | Marks in Web Technology |
| `dbms` | `TINYINT UNSIGNED`| `NOT NULL` (0 to 100) | Marks in Database Management Systems |
| `os` | `TINYINT UNSIGNED`| `NOT NULL` (0 to 100) | Marks in Operating Systems |
| `data_structures` | `TINYINT UNSIGNED`| `NOT NULL` (0 to 100) | Marks in Data Structures |
| `maths` | `TINYINT UNSIGNED`| `NOT NULL` (0 to 100) | Marks in Mathematics |
| `total` | `SMALLINT UNSIGNED`| `NOT NULL` | Aggregate marks scored (out of 500) |
| `percentage` | `DECIMAL(5,2)` | `NOT NULL` | Total percentage ($total \div 5$) |
| `grade` | `VARCHAR(2)` | `NOT NULL` | Computed letter grade (O, A+, A, B, C, D, F) |
| `result` | `VARCHAR(4)` | `NOT NULL` | Pass or Fail result |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Date and time when the record was inserted |

### SQL Script (`database.sql`)
```sql
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    web_tech TINYINT UNSIGNED NOT NULL,
    dbms TINYINT UNSIGNED NOT NULL,
    os TINYINT UNSIGNED NOT NULL,
    data_structures TINYINT UNSIGNED NOT NULL,
    maths TINYINT UNSIGNED NOT NULL,
    total SMALLINT UNSIGNED NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2) NOT NULL,
    result VARCHAR(4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Grading Logic & Algorithm

The grading engine enforces standard academic regulations:
1. **Minimum Subject Qualification:** A student **must score $\ge 35$ in all 5 subjects**. If any subject score is $< 35$, the grade is automatically set to **`F`** and the result is **`Fail`**, regardless of how high the aggregate percentage is.
2. **Percentage Grading Thresholds:** When all subjects have passing marks ($\ge 35$), the letter grade is assigned as follows:

| Percentage Range | Grade | Description | Result Status |
| :---: | :---: | :---: | :---: |
| $\ge 90.00\%$ | **O** | Outstanding | Pass |
| $80.00\% - 89.99\%$ | **A+** | Excellent | Pass |
| $70.00\% - 79.99\%$ | **A** | Very Good | Pass |
| $60.00\% - 69.99\%$ | **B** | Good | Pass |
| $50.00\% - 59.99\%$ | **C** | Average | Pass |
| $40.00\% - 49.99\%$ | **D** | Pass Category | Pass |
| $< 40.00\%$ or any subject $< 35$ | **F** | Fail | Fail |

---

## 📂 File & Directory Structure

```
Student-Grade-Calculator-Database/
│
├── database.sql        # Database initialization & table DDL queries
├── config.php          # Database connection using PHP MySQLi driver
├── index.html          # Web form for student data input & live calculation
├── style.css           # Modern stylesheet with responsive flexbox layout
├── script.js           # Client-side validation & live DOM updating
├── calculate.php       # Server-side validation, grade algorithm & MySQL insert
├── results.php         # Student record list with search filter & delete action
├── delete.php          # Secure record deletion using parameterized query
├── server.py           # Zero-dependency Python test server (localhost:8000)
├── PROJECT_REPORT.md   # Complete academic mini-project report
├── .gitignore          # Git exclusion rules
└── README.md           # Project documentation and setup guide
```

---

## 🔍 How It Works (Implementation Details)

### 1. User Input & Real-Time Preview
- The user fills out the form in `index.html`.
- As each mark input is changed, `script.js` captures the `input` event on all `.mark` elements.
- The total is summed dynamically and divided by 5 to calculate percentage.
- The values are rendered live into the `#total` and `#percent` spans before form submission.

### 2. Dual-Layer Validation
- **Client Side (`script.js`):** Intercepts form submission, checks whether every subject is an integer between 0 and 100, and alerts the user if any value is out-of-bounds or non-numeric.
- **Server Side (`calculate.php`):** Validates all inputs using PHP's `filter_var()` with `FILTER_VALIDATE_INT` and min/max range constraints:
  ```php
  $v = filter_var($_POST[$s] ?? null, FILTER_VALIDATE_INT, [
      'options' => ['min_range' => 0, 'max_range' => 100]
  ]);
  ```

### 3. Backend Processing & Database Persistence
- `calculate.php` computes the total score, rounded percentage, letter grade, and pass/fail result.
- A MySQL prepared statement is executed:
  ```php
  $sql = 'INSERT INTO students (roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('sssiiiiiidss', $roll, $name, $class, ...);
  $stmt->execute();
  ```
- If a duplicate roll number is submitted, MySQL error `1062` is caught gracefully and displays a clear explanation to the user.

### 4. Records Retrieval & Search
- `results.php` retrieves records sorted in descending order of `id`.
- If a query parameter `?q=...` is provided, a parameterized search query filters matching roll numbers or names:
  ```php
  $stmt = $conn->prepare('SELECT * FROM students WHERE roll_no LIKE ? OR name LIKE ? ORDER BY id DESC');
  ```
- Data is rendered into an HTML table with styled status badges (`badge-pass` or `badge-fail`).

### 5. Record Deletion
- Each row in `results.php` has a Delete button enclosed in a POST form with a confirmation dialog:
  ```html
  <form action="delete.php" method="post" onsubmit="return confirm('Delete this record?');">
      <input type="hidden" name="id" value="<?= $r['id'] ?>">
      <button type="submit" class="btn-danger">Delete</button>
  </form>
  ```
- `delete.php` safely deletes the row using `$stmt->bind_param('i', $id)` and redirects back to `results.php`.

---

## 🔒 Security Implementations

1. **SQL Injection Defense:** All queries in `calculate.php`, `results.php`, and `delete.php` use parameterized prepared statements. Raw user input is never concatenated into SQL strings.
2. **Cross-Site Scripting (XSS) Mitigation:** All user-supplied strings are escaped via `htmlspecialchars()` before being echoed to HTML.
3. **HTTP Method Enforcement:** Action scripts (`calculate.php`, `delete.php`) strictly require `POST` requests and redirect unauthorized `GET` attempts.
4. **Relational Constraints:** A unique index on `roll_no` ensures database-level integrity against race conditions or double submissions.

---

## 🚀 Setup & Installation Guide

### Option A: Running with XAMPP (Apache + MySQL)

#### Step 1: Install XAMPP
1. Download **XAMPP** from [apachefriends.org](https://www.apachefriends.org/).
2. Run the installer and complete the setup.
3. Open the **XAMPP Control Panel** and click **Start** for **Apache** and **MySQL**.

#### Step 2: Set Up Database
1. Open your browser and navigate to `http://localhost/phpmyadmin/`.
2. Click on the **SQL** tab.
3. Open [database.sql](database.sql), copy its contents, paste them into phpMyAdmin, and click **Go**.
   *(This creates the database `student_db` and the table `students`).*

#### Step 3: Deploy Project Files
1. Copy this project folder into your XAMPP web root:
   - **Path:** `C:\xampp\htdocs\student-marks`
2. Verify `config.php`:
   ```php
   $host = 'localhost';
   $user = 'root';
   $pass = '';
   $db   = 'student_db';
   ```

#### Step 4: Open in Browser
- **Student Data Entry:** [http://localhost/student-marks/index.html](http://localhost/student-marks/index.html)
- **View Records Dashboard:** [http://localhost/student-marks/results.php](http://localhost/student-marks/results.php)

---

### Option B: Instant Local Server (Python / Zero Dependencies)

If you want to immediately run and test the application on localhost without installing or configuring XAMPP:

1. Open your terminal in this project folder.
2. Run:
   ```bash
   python server.py
   ```
3. Open your browser at:
   👉 **[http://localhost:8000](http://localhost:8000)**

*The Python server mirrors the entire PHP + MySQL functionality using an automated SQLite database.*

---

## 🧪 Testing Matrix

| Test Case | Inputs Tested | Expected Result | Verified Status |
| :--- | :--- | :--- | :---: |
| **Normal Valid Entry** | Web: 78, DBMS: 85, OS: 69, DS: 72, Maths: 91 | Total: 395, 79.00%, Grade: A, Result: Pass | ✅ Passed |
| **Perfect Score** | All marks = 100 | Total: 500, 100.00%, Grade: O, Result: Pass | ✅ Passed |
| **Pass Boundary** | One subject = 35, others = 60 | Total: 275, 55.00%, Grade: C, Result: Pass | ✅ Passed |
| **Subject Failure Rule**| One subject = 34, others = 90 | Grade: F, Result: Fail (Subject $< 35$) | ✅ Passed |
| **Zero Score** | All marks = 0 | Total: 0, 0.00%, Grade: F, Result: Fail | ✅ Passed |
| **Upper Bound Violation**| Any mark = 101 | Client and server block submission | ✅ Passed |
| **Negative Mark** | Any mark = -5 | Client and server block submission | ✅ Passed |
| **Blank Field** | Name or Roll No omitted | Form submission blocked | ✅ Passed |
| **Duplicate Roll No** | Re-entering an existing roll number | Database error 1062 caught; error displayed | ✅ Passed |
| **Dynamic Search** | Typing partial roll number or name | Filters results table in real-time | ✅ Passed |
| **Record Deletion** | Clicking Delete and confirming | Row removed from database and refreshed | ✅ Passed |
| **SQL Injection Attempt**| Name = `' OR 1=1 --` | Treated as literal text; sanitized safely | ✅ Passed |

---

## 📄 License
This project is developed for academic learning and is available under the [MIT License](LICENSE).
