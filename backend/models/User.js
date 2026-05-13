const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
let db;

const initUserModel = async () => {
  db = await connectDB();
};

const findByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.execute(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [userData.name, userData.email, hashedPassword, userData.role || 'user']
  );
  return result.insertId;
};

const getAllUsers = async () => {
  const [rows] = await db.execute(
    'SELECT id, name, email, role, created_at FROM users'
  );
  return rows;
};

module.exports = {
  initUserModel,
  findByEmail,
  findById,
  createUser,
  getAllUsers
};