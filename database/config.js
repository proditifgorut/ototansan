// Database configuration for Automodern Indonesia
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'automodern_indonesia',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+07:00', // Indonesia timezone
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return { success: true, data: results };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
}

// Get single record
async function findOne(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database findOne error:', error);
    return null;
  }
}

// Get multiple records
async function findMany(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database findMany error:', error);
    return [];
  }
}

// Insert record
async function insert(table, data) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.execute(query, values);
    
    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error('Database insert error:', error);
    return { success: false, error: error.message };
  }
}

// Update record
async function update(table, data, whereClause, whereParams = []) {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const [result] = await pool.execute(query, [...values, ...whereParams]);
    
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Database update error:', error);
    return { success: false, error: error.message };
  }
}

// Delete record
async function deleteRecord(table, whereClause, whereParams = []) {
  try {
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    const [result] = await pool.execute(query, whereParams);
    
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Database delete error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  pool,
  testConnection,
  executeQuery,
  findOne,
  findMany,
  insert,
  update,
  deleteRecord
};
