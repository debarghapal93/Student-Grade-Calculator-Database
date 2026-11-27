const { query } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use GET.` });
  }

  try {
    const q = typeof req.query?.q === 'string' ? req.query.q.trim() : '';

    let sql;
    let params = [];

    if (q) {
      sql = `
        SELECT id, roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result, created_at
        FROM students
        WHERE roll_no ILIKE $1 OR name ILIKE $1
        ORDER BY id DESC
      `;
      params = [`%${q}%`];
    } else {
      sql = `
        SELECT id, roll_no, name, class_name, web_tech, dbms, os, data_structures, maths, total, percentage, grade, result, created_at
        FROM students
        ORDER BY id DESC
      `;
    }

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      records: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('API Error [/api/records]:', err);
    return res.status(500).json({
      error: err.message || 'Failed to fetch student records from database.',
    });
  }
};
