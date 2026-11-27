const assert = require('assert');
const { validateAndCalculate } = require('./lib/grade');
const { query } = require('./lib/db');

async function runTests() {
  console.log('🧪 Starting PostgreSQL Automated Test Suite...\n');

  // Test 1: Valid record (87, 88, 95, 93, 79 -> 442/500, 88.40%, grade A+, Pass)
  console.log('Test 1: Valid record calculation (87, 88, 95, 93, 79)');
  const res1 = validateAndCalculate({
    roll_no: 'TEST-884',
    name: 'Debargha Pal',
    class_name: 'CSE-5A',
    web_tech: 87,
    dbms: 88,
    os: 95,
    data_structures: 93,
    maths: 79,
  });
  assert.strictEqual(res1.error, undefined, 'Should not return validation error');
  assert.strictEqual(res1.student.total, 442, 'Total marks must be exactly 442');
  assert.strictEqual(res1.student.percentage, 88.40, 'Percentage must be exactly 88.40');
  assert.strictEqual(res1.student.grade, 'A+', 'Grade must be A+');
  assert.strictEqual(res1.student.result, 'Pass', 'Result must be Pass');
  console.log('✓ Passed: Total 442/500, 88.40%, Grade A+, Result Pass\n');

  // Test 2: Subject failure rule (one mark below 35 -> F/Fail)
  console.log('Test 2: Subject failure rule (one mark below 35 -> F/Fail)');
  const res2 = validateAndCalculate({
    roll_no: 'TEST-FAIL',
    name: 'Sample Student',
    class_name: 'CSE-5A',
    web_tech: 34,
    dbms: 95,
    os: 92,
    data_structures: 90,
    maths: 94,
  });
  assert.strictEqual(res2.student.grade, 'F', 'Grade must be F when any subject < 35');
  assert.strictEqual(res2.student.result, 'Fail', 'Result must be Fail when any subject < 35');
  console.log('✓ Passed: Individual subject mark < 35 results in Grade F and Result Fail\n');

  // Test 3: Invalid marks rejected (> 100 or negative or non-integer)
  console.log('Test 3: Reject invalid marks (> 100, negative, non-numeric)');
  const res3High = validateAndCalculate({
    roll_no: 'TEST-HIGH',
    name: 'Invalid Student',
    class_name: 'CSE',
    web_tech: 105,
    dbms: 80,
    os: 80,
    data_structures: 80,
    maths: 80,
  });
  assert.ok(res3High.error, 'Must reject mark > 100');

  const res3Low = validateAndCalculate({
    roll_no: 'TEST-LOW',
    name: 'Invalid Student',
    class_name: 'CSE',
    web_tech: -10,
    dbms: 80,
    os: 80,
    data_structures: 80,
    maths: 80,
  });
  assert.ok(res3Low.error, 'Must reject negative mark');
  console.log('✓ Passed: Out of range marks properly rejected\n');

  // Test 4: Database insertion and duplicate roll number constraint
  console.log('Test 4: PostgreSQL insertion and duplicate roll number handling');
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
  console.log(`✓ Passed: Record inserted into PostgreSQL with ID ${insertedId}`);

  // Test duplicate roll number (Error code 23505)
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
  assert.strictEqual(duplicateCaught, true, 'Duplicate roll number must trigger unique constraint (23505)');
  console.log('✓ Passed: Duplicate roll number correctly caught and rejected\n');

  // Test 5: Search query using ILIKE
  console.log('Test 5: Search record by name or roll number using ILIKE');
  const searchSql = `
    SELECT id, roll_no, name, class_name, total, percentage, grade, result
    FROM students
    WHERE roll_no ILIKE $1 OR name ILIKE $1
    ORDER BY id DESC
  `;
  const searchRes = await query(searchSql, ['%debargha%']);
  assert.ok(searchRes.rows.length >= 1, 'Search query should return matching student');
  assert.strictEqual(searchRes.rows[0].roll_no, 'TEST-884', 'Search returned matching roll number');
  console.log(`✓ Passed: ILIKE search returned ${searchRes.rows.length} matching record(s)\n`);

  // Test 6: Delete record by ID
  console.log('Test 6: Delete record by ID using parameterized query');
  const delRes = await query('DELETE FROM students WHERE id = $1 RETURNING id', [insertedId]);
  assert.strictEqual(delRes.rows.length, 1, 'Should delete 1 row');
  assert.strictEqual(Number(delRes.rows[0].id), Number(insertedId), 'Deleted ID must match');
  console.log(`✓ Passed: Record ID ${insertedId} successfully deleted\n`);

  console.log('🎉 All PostgreSQL tests passed successfully!');
}

runTests().catch(err => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
