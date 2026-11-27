const { query } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST or DELETE.` });
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

    const rawId = body.id || req.query.id;
    const id = Number(rawId);

    if (!id || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'A valid student record ID is required.' });
    }

    const deleteSql = `DELETE FROM students WHERE id = $1 RETURNING id`;
    const result = await query(deleteSql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found or already deleted.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Student record deleted successfully.',
      deletedId: id,
    });
  } catch (err) {
    console.error('Error in /api/delete:', err);
    return res.status(500).json({
      error: 'Failed to delete student record from database.',
    });
  }
};
