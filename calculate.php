<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit;
}

$roll  = trim($_POST['roll_no'] ?? '');
$name  = trim($_POST['name'] ?? '');
$class = trim($_POST['class_name'] ?? '');

if ($roll === '' || $name === '' || $class === '') {
    die('All fields are required. <a href="index.html">Go Back</a>');
}

$subjects = ['web_tech', 'dbms', 'os', 'data_structures', 'maths'];
$marks = [];

foreach ($subjects as $s) {
    $v = filter_var($_POST[$s] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 0, 'max_range' => 100]
    ]);
    if ($v === false || $v === null) {
        die('Invalid marks entered. Marks must be whole numbers between 0 and 100. <a href="index.html">Go Back</a>');
    }
    $marks[$s] = $v;
}

$total = array_sum($marks);
$percentage = round($total / 5, 2);

// Grading Logic:
// A student passes only if every subject has at least 35 marks; otherwise grade is F
if (min($marks) < 35) {
    $grade = 'F';
} elseif ($percentage >= 90) {
    $grade = 'O';
} elseif ($percentage >= 80) {
    $grade = 'A+';
} elseif ($percentage >= 70) {
    $grade = 'A';
} elseif ($percentage >= 60) {
    $grade = 'B';
} elseif ($percentage >= 50) {
    $grade = 'C';
} elseif ($percentage >= 40) {
    $grade = 'D';
} else {
    $grade = 'F';
}

$result = ($grade === 'F') ? 'Fail' : 'Pass';

$sql = 'INSERT INTO students (roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

try {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        'sssiiiiiidss',
        $roll,
        $name,
        $class,
        $marks['web_tech'],
        $marks['dbms'],
        $marks['os'],
        $marks['data_structures'],
        $marks['maths'],
        $total,
        $percentage,
        $grade,
        $result
    );
    $stmt->execute();
} catch (mysqli_sql_exception $e) {
    if ($e->getCode() === 1062) {
        die('This roll number already exists. <a href="index.html">Go Back</a>');
    }
    die('Could not save the record: ' . $e->getMessage() . ' <a href="index.html">Go Back</a>');
}

header('Location: results.php');
exit;
