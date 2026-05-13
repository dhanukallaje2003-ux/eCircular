const connectDB = require('../config/db');
let db;

const initCircularModel = async () => {
  db = await connectDB();
};

const createCircular = async (circularData) => {
  const [result] = await db.execute(
    `INSERT INTO circulars (title, description, document_type, priority, target_group, file_path, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      circularData.title,
      circularData.description,
      circularData.documentType || circularData.document_type,
      circularData.priority || null,
      circularData.targetGroup || circularData.target_group || null,
      circularData.file_path || null,
      circularData.created_by
    ]
  );
  return result.insertId;
};

const getAllCirculars = async () => {
  const [rows] = await db.execute(`
    SELECT c.*, u.name as created_by_name 
    FROM circulars c 
    LEFT JOIN users u ON c.created_by = u.id 
    WHERE c.is_archived = 0 AND c.is_hidden = 0
    ORDER BY c.created_at DESC
  `);
  return rows;
};

const getArchivedCirculars = async () => {
  const [rows] = await db.execute(`
    SELECT c.*, u.name as created_by_name 
    FROM circulars c 
    LEFT JOIN users u ON c.created_by = u.id 
    WHERE c.is_archived = 1
    ORDER BY c.created_at DESC
  `);
  return rows;
};

const getHiddenCirculars = async () => {
  const [rows] = await db.execute(`
    SELECT c.*, u.name as created_by_name 
    FROM circulars c 
    LEFT JOIN users u ON c.created_by = u.id 
    WHERE c.is_hidden = 1
    ORDER BY c.created_at DESC
  `);
  return rows;
};

const getCircularById = async (id) => {
  const [rows] = await db.execute(`
    SELECT c.*, u.name as created_by_name 
    FROM circulars c 
    LEFT JOIN users u ON c.created_by = u.id 
    WHERE c.id = ?
  `, [id]);
  return rows[0];
};

const deleteCircular = async (id) => {
  await db.execute('DELETE FROM circular_views WHERE circular_id = ?', [id]);
  const [result] = await db.execute('DELETE FROM circulars WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const archiveCircular = async (id) => {
  await db.execute('UPDATE circulars SET is_archived = 1 WHERE id = ?', [id]);
  return true;
};

const hideCircular = async (id) => {
  await db.execute('UPDATE circulars SET is_hidden = 1 WHERE id = ?', [id]);
  return true;
};

const restoreCircular = async (id) => {
  await db.execute('UPDATE circulars SET is_hidden = 0 WHERE id = ?', [id]);
  return true;
};

const markAsViewed = async (userId, circularId) => {
  const [existing] = await db.execute(
    'SELECT id FROM circular_views WHERE user_id = ? AND circular_id = ?',
    [userId, circularId]
  );
  if (existing.length === 0) {
    await db.execute(
      'INSERT INTO circular_views (user_id, circular_id) VALUES (?, ?)',
      [userId, circularId]
    );
  }
  return true;
};

const getCircularViewStats = async () => {
  const [rows] = await db.execute(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.created_at,
      COUNT(DISTINCT cv.circular_id) as total_viewed
    FROM users u
    LEFT JOIN circular_views cv ON u.id = cv.user_id
    WHERE u.role = 'user'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  return rows;
};

const updateCircular = async (id, data) => {
  await db.execute(
    `UPDATE circulars SET 
      title = ?, 
      description = ?, 
      document_type = ?, 
      priority = ?, 
      target_group = ?
     WHERE id = ?`,
    [
      data.title,
      data.description,
      data.documentType || data.document_type,
      data.priority || null,
      data.targetGroup || data.target_group,
      id
    ]
  );
  return true;
};

module.exports = {
  initCircularModel,
  createCircular,
  getAllCirculars,
  getArchivedCirculars,
  getHiddenCirculars,
  getCircularById,
  deleteCircular,
  archiveCircular,
  hideCircular,
  restoreCircular,
  markAsViewed,
  getCircularViewStats,
  updateCircular
};