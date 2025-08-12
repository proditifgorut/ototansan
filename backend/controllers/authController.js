// Authentication controller for login, register, and user management
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { insert, findOne, update } = require('../../database/config');

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { username, email, password, first_name, last_name, phone } = req.body;

      // Validation
      if (!username || !email || !password || !first_name || !last_name) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password,
        first_name,
        last_name,
        phone
      });

      if (!newUser) {
        return res.status(500).json({
          success: false,
          message: 'Gagal membuat akun pengguna'
        });
      }

      // Generate tokens
      const token = newUser.generateToken();
      const refreshToken = newUser.generateRefreshToken();

      // Log activity
      await AuthController.logActivity(newUser.id, 'register', 'User registered successfully', req);

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          user: newUser.toJSON(),
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi'
        });
      }

      // Check login attempts
      const isBlocked = await AuthController.checkLoginAttempts(email, req.ip);
      if (isBlocked) {
        return res.status(429).json({
          success: false,
          message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        await AuthController.logLoginAttempt(email, req.ip, false);
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        await AuthController.logLoginAttempt(email, req.ip, false);
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate tokens
      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();

      // Create session
      await AuthController.createSession(user.id, token, req);

      // Log successful login
      await AuthController.logLoginAttempt(email, req.ip, true);
      await AuthController.logActivity(user.id, 'login', 'User logged in successfully', req);

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: user.toJSON(),
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // User logout
  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Remove session
        await AuthController.removeSession(token);
        
        // Log activity
        if (req.user) {
          await AuthController.logActivity(req.user.id, 'logout', 'User logged out', req);
        }
      }

      res.json({
        success: true,
        message: 'Logout berhasil'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: user.toJSON()
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { first_name, last_name, phone } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan'
        });
      }

      const updated = await user.updateProfile({
        first_name,
        last_name,
        phone
      });

      if (updated) {
        const updatedUser = await User.findById(req.user.id);
        await AuthController.logActivity(req.user.id, 'profile_update', 'User updated profile', req);

        res.json({
          success: true,
          message: 'Profil berhasil diperbarui',
          data: updatedUser.toJSON()
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Gagal memperbarui profil'
        });
      }

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Password lama dan baru wajib diisi'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan'
        });
      }

      // Verify current password
      const isValidPassword = await user.verifyPassword(current_password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Password lama salah'
        });
      }

      // Update password
      const updated = await user.changePassword(new_password);
      if (updated) {
        await AuthController.logActivity(req.user.id, 'password_change', 'User changed password', req);

        res.json({
          success: true,
          message: 'Password berhasil diubah'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Gagal mengubah password'
        });
      }

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token wajib diisi'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }

      // Generate new tokens
      const newToken = user.generateToken();
      const newRefreshToken = user.generateRefreshToken();

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
  }

  // Helper methods
  static async logLoginAttempt(email, ipAddress, success) {
    try {
      await insert('login_attempts', {
        email,
        ip_address: ipAddress,
        success
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  static async checkLoginAttempts(email, ipAddress) {
    try {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      const lockoutTime = parseInt(process.env.LOCKOUT_TIME) || 15; // minutes

      const query = `
        SELECT COUNT(*) as attempts 
        FROM login_attempts 
        WHERE (email = ? OR ip_address = ?) 
          AND success = FALSE 
          AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `;

      const result = await findOne(query, [email, ipAddress, lockoutTime]);
      return result && result.attempts >= maxAttempts;
    } catch (error) {
      console.error('Error checking login attempts:', error);
      return false;
    }
  }

  static async createSession(userId, token, req) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

      await insert('user_sessions', {
        user_id: userId,
        session_token: token,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        expires_at: expiresAt
      });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  static async removeSession(token) {
    try {
      const query = 'DELETE FROM user_sessions WHERE session_token = ?';
      await executeQuery(query, [token]);
    } catch (error) {
      console.error('Error removing session:', error);
    }
  }

  static async logActivity(userId, activityType, description, req) {
    try {
      await insert('user_activity_logs', {
        user_id: userId,
        activity_type: activityType,
        description,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

module.exports = AuthController;
