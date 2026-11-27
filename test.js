const assert = require('assert');
const { validateAndCalculate } = require('./lib/grade');
const { query } = require('./lib/db');

async function runTests() {
  console.log('🧪 Starting automated tests...\n');

  // Test 1: Valid record (78, 85, 69, 72, 91 -> total 395, 79.00%, A, Pass)
  console.log('Test 1: Valid record calculation (78, 85, 69, 72, 91)');
  const res1 = validateAndCalculate({
    roll_no: 'TEST-001',
    name: 'Debargha Pal',
    class_name: 'CSE-5A',
    web_tech: 78,
    dbms: 85,
    os: 69,
    data_structures: 72,
    maths: 91,
  });
  assert.strictEqual(res1.error, undefined, 'Should not return error');
  assert.strictEqual(res1.student.total, 395, 'Total must be 395');
  assert.strictEqual(res1.student.percentage, 79.00, 'Percentage must be 79.00');
  assert.strictEqual(res1.student.grade, 'A', 'Grade must be A');
  assert.strictEqual(res1.student.result, 'Pass', 'Result must be Pass');
  console.log('✓ Passed: Total 395, 79.00%, Grade A, Result Pass\n');

  // Test 2: One mark below 35 (Subject failure rule)
  console.log('Test 2: Subject failure rule (one mark below 35 -> F/Fail)');
  const res2 = validateAndCalculate({
    roll_no: 'TEST-002',
    name: 'Jane Smith',
    class_name: 'CSE-5A',
    web_tech: 34,
    dbms: 95,
    os: 90,
    data_structures: 88,
    maths: 92,
  });
  assert.strictEqual(res2.student.grade, 'F', 'Grade must be F despite high average');
  assert.strictEqual(res2.student.result, 'Fail', 'Result must be Fail');
  console.log('✓ Passed: Grade F, Result Fail when any subject < 35\n');

  // Test 3: Out of range marks (> 100 or negative)
  console.log('Test 3: Reject out-of-range marks (> 100 or negative)');
  const res3High = validateAndCalculate({
    roll_no: 'TEST-003',
    name: 'Invalid Student',
    class_name: 'CSE-5A',
    web_tech: 101,
    dbms: 80,
    os: 80,
    data_structures: 80,
    maths: 80,
  });
  assert.ok(res3High.error, 'Should reject marks > 100');

  const res3Low = validateAndCalculate({
    roll_no: 'TEST-004',
    name: 'Invalid Student',
    class_name: 'CSE-5A',
    web_tech: -5,
    dbms: 80,
    os: 80,
    data_structures: 80,
    maths: 80,
  });
  assert.ok(res3Low.error, 'Should reject negative marks');
  console.log('✓ Passed: Out of range marks properly rejected\n');

  // Test 4: Database operations (Insert, Duplicate, Search, Delete)
  console.log('Test 4: Database insertion and duplicate check');
  // Clean up any test records first
  await query('DELETE FROM students WHERE roll_no LIKE $1', ['TEST-%']);

  const insertSql = `
    INSERT INTO students (
      roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const s1 = res1.student;
  const dbRes1 = await query(insertSql, [
    s1.roll_no, s1.name, s1.class_name,
    s1.web_tech, s1.dbms, s1.os, s1.data_structures, s1.maths,
    s1.total, s1.percentage, s1.grade, s1.result
  ]);
  assert.strictEqual(dbRes1.rows.length, 1, 'Should insert 1 row');
  const insertedId = dbRes1.rows[0].id;
  console.log(`✓ Passed: Record inserted with ID ${insertedId}`);

  // Test duplicate roll number
  let duplicateCaught = false;
  try {
    await query(insertSql, [
      s1.roll_no, s1.name, s1.class_name,
      s1.web_tech, s1.dbms, s1.os, s1.data_structures, s1.maths,
      s1.total, s1.percentage, s1.grade, s1.result
    ]);
  } catch (err) {
    if (err.code === '23505' || (err.message && err.message.toLowerCase().includes('unique'))) {
      duplicateCaught = true;
    }
  }
  assert.strictEqual(duplicateCaught, true, 'Duplicate roll number must trigger unique constraint');
  console.log('✓ Passed: Duplicate roll number correctly caught and rejected\n');

  // Test 5: Search
  console.log('Test 5: Search record by name or roll number');
  const searchRes = await query('SELECT * FROM students WHERE LOWER(roll_no) LIKE $1 OR LOWER(name) LIKE $1', ['%debargha%']);
  assert.ok(searchRes.rows.length >= 1, 'Should find at least 1 record');
  console.log(`✓ Passed: Search returned ${searchRes.rows.length} record(s)\n`);

  // Test 6: Delete
  console.log('Test 6: Delete record by ID');
  const delRes = await query('DELETE FROM students WHERE id = $1 RETURNING id', [insertedId]);
  assert.strictEqual(delRes.rows.length, 1, 'Should delete 1 row');
  console.log(`✓ Passed: Record ${insertedId} successfully deleted\n`);

  console.log('🎉 All tests passed successfully!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
