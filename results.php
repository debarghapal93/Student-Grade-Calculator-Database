<?php
require 'config.php';

$q = trim($_GET['q'] ?? '');
$like = '%' . $q . '%';

$stmt = $conn->prepare('SELECT * FROM students WHERE roll_no LIKE ? OR name LIKE ? ORDER BY id DESC');
$stmt->bind_param('ss', $like, $like);
$stmt->execute();
$rows = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Student Records</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="table-container">
    <h1>Student Records</h1>
    
    <form class="search-bar" method="get">
      <input type="text" name="q" placeholder="Search by roll no or name" value="<?= htmlspecialchars($q) ?>">
      <button type="submit">Search</button>
      <?php if (!empty($q)): ?>
        <a href="results.php">Clear</a>
      <?php endif; ?>
      <a href="index.html">+ Add New</a>
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
        <?php if ($rows->num_rows === 0): ?>
          <tr>
            <td colspan="8" class="empty-state">No student records found.</td>
          </tr>
        <?php else: ?>
          <?php while ($r = $rows->fetch_assoc()): ?>
            <tr>
              <td><strong><?= htmlspecialchars($r['roll_no']) ?></strong></td>
              <td><?= htmlspecialchars($r['name']) ?></td>
              <td><?= htmlspecialchars($r['class_name']) ?></td>
              <td><?= htmlspecialchars($r['total']) ?> / 500</td>
              <td><?= number_format($r['percentage'], 2) ?>%</td>
              <td><strong><?= htmlspecialchars($r['grade']) ?></strong></td>
              <td>
                <span class="badge <?= $r['result'] === 'Pass' ? 'badge-pass' : 'badge-fail' ?>">
                  <?= htmlspecialchars($r['result']) ?>
                </span>
              </td>
              <td>
                <form action="delete.php" method="post" onsubmit="return confirm('Delete record for <?= htmlspecialchars(addslashes($r['name'])) ?>?');" style="margin: 0;">
                  <input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
                  <button type="submit" class="btn-danger">Delete</button>
                </form>
              </td>
            </tr>
          <?php endwhile; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
