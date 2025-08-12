// User model for authentication and user management
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findOne, findMany, insert, update, deleteRecord } = require('../../database/config');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.phone = data.phone;
    this.role = data.role;
    this.is_active = data.is_active;
    this.email_verified = data.email_verified;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.last_login = data.last_login;
    this.profile_image = data.profile_image;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const result = await findOne(query, [email]);
    return result ? new User(result) : null;
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
    const result = await findOne(query, [username]);
    return result ? new User(result) : null;
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
    const result = await findOne(query, [id]);
    return result ? new User(result) : null;
  }

  // Create new user
  static async create(userData) {
    try {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      const newUser = {
        username: userData.username,
        email: userData.email,
        password_hash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        role: userData.role || 'user'
      };

      const result = await insert('users', newUser);
      
      if (result.success) {
        return await User.findById(result.insertId);
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Generate JWT token
  generateToken() {
    const payload = {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  // Generate refresh token
  generateRefreshToken() {
    const payload = {
      id: this.id,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
  }

  // Update last login
  async updateLastLogin() {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    return await update('users', { last_login: new Date() }, 'id = ?', [this.id]);
  }

  // Update user profile
  async updateProfile(profileData) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'profile_image'];
    const updateData = {};

    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date();
      const result = await update('users', updateData, 'id = ?', [this.id]);
      return result.success;
    }

    return false;
  }

  // Change password
  async changePassword(newPassword) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      
      const result = await update('users', { password_hash, updated_at: new Date() }, 'id = ?', [this.id]);
      return result.success;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  // Verify email
  async verifyEmail() {
    const result = await update('users', { email_verified: true, updated_at: new Date() }, 'id = ?', [this.id]);
    return result.success;
  }

  // Deactivate user
  async deactivate() {
    const result = await update('users', { is_active: false, updated_at: new Date() }, 'id = ?', [this.id]);
    return result.success;
  }

  // Get all users (admin only)
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, username, email, first_name, last_name, phone, role, is_active, 
             email_verified, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const users = await findMany(query, [limit, offset]);
    return users.map(user => new User(user));
  }

  // Get user count
  static async getCount() {
    const query = 'SELECT COUNT(*) as count FROM users WHERE is_active = TRUE';
    const result = await findOne(query);
    return result ? result.count : 0;
  }

  // Search users
  static async search(searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT id, username, email, first_name, last_name, phone, role, is_active, 
             email_verified, created_at, last_login 
      FROM users 
      WHERE (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?) 
        AND is_active = TRUE
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const users = await findMany(query, [searchPattern, searchPattern, searchPattern, searchPattern, limit, offset]);
    return users.map(user => new User(user));
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
