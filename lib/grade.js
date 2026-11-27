const SUBJECT_KEYS = ['web_tech', 'dbms', 'os', 'data_structures', 'maths'];

function validateAndCalculate(data) {
  const roll_no = typeof data.roll_no === 'string' ? data.roll_no.trim() : '';
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const class_name = typeof data.class_name === 'string' ? data.class_name.trim() : '';

  if (!roll_no || !name || !class_name) {
    return { error: 'Roll number, student name, and class are required.' };
  }

  const marks = {};
  for (const key of SUBJECT_KEYS) {
    const raw = data[key];
    if (raw === undefined || raw === null || raw === '') {
      return { error: `Marks for ${key.replace('_', ' ')} are required.` };
    }
    const num = Number(raw);
    if (!Number.isInteger(num) || num < 0 || num > 100) {
      return { error: `Marks for ${key.replace('_', ' ')} must be a whole number between 0 and 100.` };
    }
    marks[key] = num;
  }

  const markValues = Object.values(marks);
  const total = markValues.reduce((sum, v) => sum + v, 0);
  const percentage = Number((total / 5.0).toFixed(2));

  let grade = 'F';
  if (Math.min(...markValues) < 35) {
    grade = 'F';
  } else if (percentage >= 90) {
    grade = 'O';
  } else if (percentage >= 80) {
    grade = 'A+';
  } else if (percentage >= 70) {
    grade = 'A';
  } else if (percentage >= 60) {
    grade = 'B';
  } else if (percentage >= 50) {
    grade = 'C';
  } else if (percentage >= 40) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  const result = grade === 'F' ? 'Fail' : 'Pass';

  return {
    student: {
      roll_no,
      name,
      class_name,
      ...marks,
      total,
      percentage,
      grade,
      result,
    },
  };
}

module.exports = {
  SUBJECT_KEYS,
  validateAndCalculate,
};
