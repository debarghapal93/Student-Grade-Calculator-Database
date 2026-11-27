# Student Marks and Grade Calculator
**Web Technology Mini Project Report**

---

## 1. Abstract and Introduction

The **Student Marks and Grade Calculator** is a full-stack web application that takes a student's marks in five core subjects, computes their total marks, percentage, letter grade, and pass/fail result, and persists every record into a MySQL database for historical tracking and review.

In many educational environments, teachers still calculate marks manually or in loosely organized spreadsheets. This manual process introduces arithmetic errors, inconsistent grade boundaries, and tedious record retrieval. This project replaces manual calculation with an automated, responsive web interface backed by a relational database. 

The front end is built with **HTML5, CSS3, and JavaScript**, the server-side business logic is implemented in **PHP 8**, and persistent storage is managed with **MySQL/MariaDB**. The application validates data in real time within the browser, enforces strict validation on the server, calculates performance based on standard academic criteria, prevents duplicate records, and provides full search and delete capabilities.

---

## 2. Objectives and Scope

### Objectives
- Provide a responsive form to accept a student's roll number, name, class, and marks across five subjects.
- Automatically calculate total score, percentage, grade, and pass/fail status using a uniform grading scheme.
- Perform dual-layer validation on both the client side (JavaScript) and server side (PHP).
- Prevent SQL injection vulnerabilities using prepared statements.
- Store student records in a structured MySQL database.
- Offer search and record deletion functionalities through a results dashboard.

### Scope
The system is tailored for teachers and academic administrators managing class grade sheets. It covers data capture, calculation, persistence, and listing. Advanced features such as role-based user authentication, PDF report-card downloads, and multi-semester CGPA calculations are planned for future versions.

---

## 3. Technologies and System Requirements

### Technology Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Structure** | HTML5 | Web forms, semantic layouts, and result tables |
| **Styling** | CSS3 | Responsive layouts, typography, and visual feedback |
| **Client-Side Logic** | JavaScript (ES6) | Real-time score preview and form validation |
| **Server-Side Logic** | PHP 8 | Business rules, grading logic, and database access |
| **Database** | MySQL / MariaDB | Relational storage for student marks and results |
| **Server Environment** | Apache (XAMPP / WAMP) | Local web server and runtime hosting |

### System Requirements
- **Hardware:** PC/Laptop with minimum 4 GB RAM and 1 GB available disk space.
- **Operating System:** Windows, macOS, or Linux.
- **Server Software:** XAMPP, WAMP, or LAMP stack with Apache, PHP 8+, and MySQL.
- **Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

---

## 4. System Analysis

### Existing vs. Proposed System
- **Existing System:** Teachers calculate scores using manual spreadsheets or handheld calculators. Errors frequently occur in formula propagation, manual grading thresholds, and duplicate entry detection. Retrieving records across terms requires opening multiple disjointed files.
- **Proposed System:** A centralized web application calculates grades instantly with identical business logic, validates constraints (e.g. 0–100 integer range, minimum passing mark of 35 per subject), enforces unique roll numbers, and allows instant search by name or roll number.

### Functional Requirements
1. Capture student details (Roll No, Name, Class) and marks for 5 subjects.
2. Calculate total marks (out of 500) and percentage to two decimal places.
3. Determine letter grade and pass/fail status based on institutional rules.
4. Insert validated records into MySQL database.
5. Display all saved records with search and delete capabilities.

### Non-Functional Requirements
1. **Data Integrity:** Marks restricted to integers between 0 and 100.
2. **Uniqueness:** Roll numbers must be strictly unique.
3. **Performance:** Page response time under two seconds in local environments.
4. **Security:** Use parameterized queries to eliminate SQL injection attacks and sanitize output to prevent XSS.

---

## 5. System Design

### Three-Tier Architecture
1. **Presentation Tier:** `index.html`, `style.css`, and `script.js` render the user interface and provide instant live calculations.
2. **Application Tier:** `calculate.php`, `results.php`, and `delete.php` execute validation, grading logic, and handle database queries.
3. **Data Tier:** `student_db` MySQL database stores records in the `students` table.

```
[ User Browser ]
       │  (HTTP POST / GET)
       ▼
[ Apache Web Server / PHP 8 Engine ]
       │  (MySQLi with Prepared Statements)
       ▼
[ MySQL Database (student_db) ]
```

### Module Breakdown
| Module | File(s) | Responsibility |
| :--- | :--- | :--- |
| Database Connection | `config.php` | Initializes MySQLi connection with UTF-8 character encoding |
| Data Entry Form | `index.html`, `style.css`, `script.js` | Collects inputs, validates boundaries, and provides live total/percentage |
| Calculation & Storage | `calculate.php` | Validates on server, applies grade logic, and inserts record |
| Results Dashboard | `results.php` | Lists records in tabular format with live search query |
| Record Deletion | `delete.php` | Safely deletes a specific student record by ID |

---

## 6. Database Design

### Schema: `students` Table
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Internal record identifier |
| `roll_no` | VARCHAR(20) | UNIQUE, NOT NULL | Student roll number |
| `name` | VARCHAR(100) | NOT NULL | Student's full name |
| `class_name` | VARCHAR(50) | NOT NULL | Class / section name |
| `web_tech` | TINYINT UNSIGNED | 0 to 100, NOT NULL | Marks in Web Technology |
| `dbms` | TINYINT UNSIGNED | 0 to 100, NOT NULL | Marks in Database Management Systems |
| `os` | TINYINT UNSIGNED | 0 to 100, NOT NULL | Marks in Operating Systems |
| `data_structures` | TINYINT UNSIGNED | 0 to 100, NOT NULL | Marks in Data Structures |
| `maths` | TINYINT UNSIGNED | 0 to 100, NOT NULL | Marks in Mathematics |
| `total` | SMALLINT UNSIGNED | NOT NULL | Total marks (out of 500) |
| `percentage` | DECIMAL(5,2) | NOT NULL | Percentage score |
| `grade` | VARCHAR(2) | NOT NULL | Letter grade (O, A+, A, B, C, D, F) |
| `result` | VARCHAR(4) | NOT NULL | Pass or Fail |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

## 7. Grading Logic

An essential institutional rule is that **a student must score at least 35 marks in each individual subject** to qualify for a passing grade. If any mark is below 35, the grade is automatically **F (Fail)**, regardless of the overall percentage.

When all subjects are $\ge 35$:
| Percentage Range | Grade | Result |
| :---: | :---: | :---: |
| 90.00% and above | **O** (Outstanding) | Pass |
| 80.00% – 89.99% | **A+** (Excellent) | Pass |
| 70.00% – 79.99% | **A** (Very Good) | Pass |
| 60.00% – 69.99% | **B** (Good) | Pass |
| 50.00% – 59.99% | **C** (Average) | Pass |
| 40.00% – 49.99% | **D** (Pass) | Pass |
| Below 40.00% | **F** (Fail) | Fail |

---

## 8. Testing and Quality Assurance

| No. | Test Case | Test Input | Expected Result | Outcome |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Standard Valid Record | Marks: 78, 85, 69, 72, 91 | Total: 395, 79.00%, Grade: A, Result: Pass | Passed |
| 2 | Maximum Score | All marks = 100 | Total: 500, 100.00%, Grade: O, Result: Pass | Passed |
| 3 | Boundary Pass | One mark = 35, others = 60 | Total: 275, 55.00%, Grade: C, Result: Pass | Passed |
| 4 | Subject Failure | One mark = 34, others = 90 | Grade: F, Result: Fail (failed individual subject) | Passed |
| 5 | Minimum Boundary | All marks = 0 | Total: 0, 0.00%, Grade: F, Result: Fail | Passed |
| 6 | Out of Range (>100) | Mark = 101 | Form submission blocked by client and server | Passed |
| 7 | Negative Value | Mark = -5 | Form submission blocked by client and server | Passed |
| 8 | Empty Required Field | Name left blank | HTML5 & JS form submission prevented | Passed |
| 9 | Duplicate Roll Number | Existing roll number re-entered | Database error caught (Code 1062), friendly alert shown | Passed |
| 10 | Search Functionality | Search by substring of roll number or name | Matching records filtered dynamically | Passed |
| 11 | Delete Record | Click delete with confirmation dialog | Record removed from MySQL and table refreshed | Passed |
| 12 | SQL Injection Attempt | Name: `' OR 1=1 --` | Treated as literal text; sanitized via prepared statements | Passed |

---

## 9. Limitations and Future Enhancements

### Limitations
- Currently relies on local network / intranet access without role-based authentication.
- Subject count and grading tiers are configured within the code rather than an admin settings panel.
- Records can be deleted and re-added, but direct inline editing is not implemented in this version.

### Future Enhancements
- **Authentication & Authorization:** Secure login for teachers and administrators with encrypted passwords and session tracking.
- **Dynamic Curriculum:** Ability to define dynamic subjects, credits, and GPA schemes per semester.
- **Export Capabilities:** One-click PDF report card generation and Excel spreadsheet export.
- **Analytics Dashboard:** Graphical charts illustrating class performance, grade distributions, and highest/lowest scorers.

---

## 10. Conclusion and References

The **Student Marks and Grade Calculator** successfully integrates HTML5, CSS3, JavaScript, PHP 8, and MySQL to automate student assessment. By eliminating manual calculations and enforcing server-side and client-side integrity checks, the application provides an accurate, secure, and user-friendly experience for academic grading.

### References
1. PHP Manual: MySQL Improved Extension (MySQLi) — `https://www.php.net/manual/en/book.mysqli.php`
2. MySQL 8.0 Reference Manual — `https://dev.mysql.com/doc/refman/8.0/en/`
3. Mozilla Developer Network (MDN): HTML5, CSS3, and JavaScript Guides — `https://developer.mozilla.org/`
4. Apache Friends XAMPP Documentation — `https://www.apachefriends.org/docs/`
