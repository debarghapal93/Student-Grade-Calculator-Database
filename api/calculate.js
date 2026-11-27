const { query } = require('../lib/db');
const { validateAndCalculate } = require('../lib/grade');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST.` });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        const querystring = require('querystring');
        body = querystring.parse(body);
      }
    } else if (!body) {
      body = {};
    }

    const { error, student } = validateAndCalculate(body);
    if (error) {
      return res.status(400).json({ error });
    }

    const insertSql = `
      INSERT INTO students (
        roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const params = [
      student.roll_no,
      student.name,
      student.class_name,
      student.web_tech,
      student.dbms,
      student.os,
      student.data_structures,
      student.maths,
      student.total,
      student.percentage,
      student.grade,
      student.result,
    ];

    const result = await query(insertSql, params);
    const savedRecord = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Student record saved successfully.',
      student: savedRecord,
    });
  } catch (err) {
    console.error('API Error [/api/calculate]:', err);

    // 23505 is PostgreSQL unique_violation error code
    if (err.code === '23505' || (err.message && err.message.toLowerCase().includes('unique'))) {
      const roll = (req.body && req.body.roll_no) ? String(req.body.roll_no).trim() : '';
      return res.status(409).json({
        error: `A student with roll number "${roll}" already exists. Please use a unique roll number.`,
      });
    }

    return res.status(500).json({
      error: err.message || 'An error occurred while saving the record to the database.',
    });
  }
};
