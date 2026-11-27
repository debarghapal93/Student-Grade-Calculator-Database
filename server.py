"""
Local Development Server for Student Marks and Grade Calculator
Runs out-of-the-box with Python's standard library (no dependencies needed).
Provides an immediate working localhost server with SQLite backend matching the PHP/MySQL specifications.
"""

import http.server
import socketserver
import urllib.parse
import sqlite3
import os
import html

PORT = 8000
DB_FILE = os.path.join(os.path.dirname(__file__), "students.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        web_tech INTEGER NOT NULL,
        dbms INTEGER NOT NULL,
        os INTEGER NOT NULL,
        data_structures INTEGER NOT NULL,
        maths INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percentage REAL NOT NULL,
        grade TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    conn.close()

class StudentAppHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["", "/", "/index.html"]:
            self.serve_file("index.html", "text/html; charset=utf-8")
        elif path == "/style.css":
            self.serve_file("style.css", "text/css; charset=utf-8")
        elif path == "/script.js":
            self.serve_file("script.js", "application/javascript; charset=utf-8")
        elif path == "/results.php":
            self.handle_results(parsed.query)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")
        params = urllib.parse.parse_qs(post_data)

        if path == "/calculate.php":
            self.handle_calculate(params)
        elif path == "/delete.php":
            self.handle_delete(params)
        else:
            self.send_error(404, "Page Not Found")

    def serve_file(self, filename, content_type):
        filepath = os.path.join(os.path.dirname(__file__), filename)
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_error(404, f"{filename} not found")

    def handle_calculate(self, params):
        roll_no = params.get("roll_no", [""])[0].strip()
        name = params.get("name", [""])[0].strip()
        class_name = params.get("class_name", [""])[0].strip()

        if not roll_no or not name or not class_name:
            self.send_response(400)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"All fields are required. <a href='/'>Go Back</a>")
            return

        subject_keys = ["web_tech", "dbms", "os", "data_structures", "maths"]
        marks = {}
        for s in subject_keys:
            raw_val = params.get(s, [""])[0]
            try:
                val = int(raw_val)
                if val < 0 or val > 100:
                    raise ValueError()
                marks[s] = val
            except (ValueError, TypeError):
                self.send_response(400)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(b"Invalid marks. Must be integers 0 to 100. <a href='/'>Go Back</a>")
                return

        total = sum(marks.values())
        percentage = round(total / 5.0, 2)

        # Grading logic
        if min(marks.values()) < 35:
            grade = "F"
        elif percentage >= 90:
            grade = "O"
        elif percentage >= 80:
            grade = "A+"
        elif percentage >= 70:
            grade = "A"
        elif percentage >= 60:
            grade = "B"
        elif percentage >= 50:
            grade = "C"
        elif percentage >= 40:
            grade = "D"
        else:
            grade = "F"

        result = "Fail" if grade == "F" else "Pass"

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        try:
            cursor.execute("""
            INSERT INTO students (roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                roll_no, name, class_name,
                marks["web_tech"], marks["dbms"], marks["os"],
                marks["data_structures"], marks["maths"],
                total, percentage, grade, result
            ))
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            self.send_response(409)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            msg = f"<p style='font-family:sans-serif;color:#c53030;'>This roll number (<strong>{html.escape(roll_no)}</strong>) already exists.</p><a href='/'>Go Back</a>"
            self.wfile.write(msg.encode("utf-8"))
            return
        finally:
            conn.close()

        # Redirect to results page
        self.send_response(303)
        self.send_header("Location", "/results.php")
        self.end_headers()

    def handle_delete(self, params):
        student_id = params.get("id", ["0"])[0]
        try:
            sid = int(student_id)
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM students WHERE id = ?", (sid,))
            conn.commit()
            conn.close()
        except Exception:
            pass

        self.send_response(303)
        self.send_header("Location", "/results.php")
        self.end_headers()

    def handle_results(self, query_string):
        params = urllib.parse.parse_qs(query_string)
        q = params.get("q", [""])[0].strip()

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        if q:
            like = f"%{q}%"
            cursor.execute("SELECT id, roll_no, name, class_name, total, percentage, grade, result FROM students WHERE roll_no LIKE ? OR name LIKE ? ORDER BY id DESC", (like, like))
        else:
            cursor.execute("SELECT id, roll_no, name, class_name, total, percentage, grade, result FROM students ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()

        table_rows_html = ""
        if not rows:
            table_rows_html = "<tr><td colspan='8' class='empty-state'>No student records found.</td></tr>"
        else:
            for r in rows:
                r_id, roll, name, cls, total, pct, grade, result = r
                badge_class = "badge-pass" if result == "Pass" else "badge-fail"
                escaped_name = html.escape(name).replace("'", "\\'")
                table_rows_html += f"""
                <tr>
                  <td><strong>{html.escape(roll)}</strong></td>
                  <td>{html.escape(name)}</td>
                  <td>{html.escape(cls)}</td>
                  <td>{total} / 500</td>
                  <td>{pct:.2f}%</td>
                  <td><strong>{html.escape(grade)}</strong></td>
                  <td><span class="badge {badge_class}">{html.escape(result)}</span></td>
                  <td>
                    <form action="/delete.php" method="post" onsubmit="return confirm('Delete record for {escaped_name}?');" style="margin:0;">
                      <input type="hidden" name="id" value="{r_id}">
                      <button type="submit" class="btn-danger">Delete</button>
                    </form>
                  </td>
                </tr>
                """

        clear_btn = "<a href='/results.php'>Clear</a>" if q else ""
        escaped_q = html.escape(q)

        page_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Student Records</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="table-container">
    <h1>Student Records</h1>
    
    <form class="search-bar" method="get" action="/results.php">
      <input type="text" name="q" placeholder="Search by roll no or name" value="{escaped_q}">
      <button type="submit">Search</button>
      {clear_btn}
      <a href="/index.html">+ Add New</a>
    </form>

    <table>
      <thead>
        <tr>
          <th>Roll No</th>
          <th>Name</th>
          <th>Class</th>
          <th>Total</th>
          <th>%</th>
          <th>Grade</th>
          <th>Result</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {table_rows_html}
      </tbody>
    </table>
  </div>
</body>
</html>"""

        content = page_html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

if __name__ == "__main__":
    init_db()
    with socketserver.TCPServer(("", PORT), StudentAppHandler) as httpd:
        print(f"🚀 Student Grade Calculator server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
