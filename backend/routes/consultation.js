// Consultation routes for service requests and customer support
const express = require('express');
const router = express.Router();
const ConsultationController = require('../controllers/consultationController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireAdminOrManager,
  rateLimiter,
  validateRequest 
} = require('../middleware/auth');
const Joi = require('joi');

// Validation schemas
const consultationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).required(),
  serviceType: Joi.string().valid(
    'konsultasi-umum',
    'layanan-teknis', 
    'dukungan-produk',
    'keluhan-layanan',
    'permintaan-khusus'
  ).required(),
  message: Joi.string().min(10).max(1000).required(),
  preferredTime: Joi.string().optional(),
  urgency: Joi.string().valid('normal', 'urgent', 'very-urgent').optional()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-progress', 'responded', 'closed').required(),
  notes: Joi.string().max(500).optional()
});

// Public routes
router.post('/submit', 
  rateLimiter(3, 15 * 60 * 1000), // 3 requests per 15 minutes per IP
  validateRequest(consultationSchema),
  ConsultationController.submitConsultation
);

// Protected routes (Admin/Manager only)
router.get('/', 
  authenticateToken,
  requireAdminOrManager,
  ConsultationController.getAllConsultations
);

router.get('/stats', 
  authenticateToken,
  requireAdminOrManager,
  ConsultationController.getConsultationStats
);

router.get('/pending', 
  authenticateToken,
  requireAdminOrManager,
  ConsultationController.getPendingConsultations
);

router.get('/urgency/:urgency', 
  authenticateToken,
  requireAdminOrManager,
  ConsultationController.getConsultationsByUrgency
);

router.get('/:id', 
  authenticateToken,
  requireAdminOrManager,
  ConsultationController.getConsultationById
);

router.put('/:id/status', 
  authenticateToken,
  requireAdminOrManager,
  validateRequest(updateStatusSchema),
  ConsultationController.updateConsultationStatus
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Consultation service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
