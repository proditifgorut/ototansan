// Authentication routes for login, register, and user management
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { 
  authenticateToken, 
  requireAdmin, 
  rateLimiter,
  validateRequest 
} = require('../middleware/auth');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional()
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(6).required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Public routes
router.post('/register', 
  rateLimiter(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  validateRequest(registerSchema),
  AuthController.register
);

router.post('/login', 
  rateLimiter(10, 15 * 60 * 1000), // 10 requests per 15 minutes
  validateRequest(loginSchema),
  AuthController.login
);

router.post('/refresh-token',
  rateLimiter(20, 15 * 60 * 1000), // 20 requests per 15 minutes
  validateRequest(refreshTokenSchema),
  AuthController.refreshToken
);

// Protected routes
router.post('/logout', 
  authenticateToken,
  AuthController.logout
);

router.get('/profile', 
  authenticateToken,
  AuthController.getProfile
);

router.put('/profile', 
  authenticateToken,
  validateRequest(updateProfileSchema),
  AuthController.updateProfile
);

router.put('/change-password', 
  authenticateToken,
  rateLimiter(3, 60 * 60 * 1000), // 3 requests per hour
  validateRequest(changePasswordSchema),
  AuthController.changePassword
);

// Admin routes
router.get('/users', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;

      let users;
      if (search) {
        users = await User.search(search, page, limit);
      } else {
        users = await User.getAll(page, limit);
      }

      const totalUsers = await User.getCount();
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
);

router.get('/users/:id', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
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
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
);

router.put('/users/:id/deactivate', 
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan'
        });
      }

      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menonaktifkan akun sendiri'
        });
      }

      const deactivated = await user.deactivate();
      
      if (deactivated) {
        res.json({
          success: true,
          message: 'Pengguna berhasil dinonaktifkan'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Gagal menonaktifkan pengguna'
        });
      }

    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
