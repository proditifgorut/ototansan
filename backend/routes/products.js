// Product routes for managing automotive products catalog
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { 
  authenticateToken, 
  requireAdmin, 
  optionalAuth,
  rateLimiter 
} = require('../middleware/auth');

// Public routes
router.get('/', 
  rateLimiter(60, 15 * 60 * 1000), // 60 requests per 15 minutes
  ProductController.getAllProducts
);

router.get('/featured', 
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  ProductController.getFeaturedProducts
);

router.get('/bestsellers', 
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  ProductController.getBestsellerProducts
);

router.get('/360-cameras', 
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  ProductController.get360CameraProducts
);

router.get('/search', 
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  ProductController.searchProducts
);

router.get('/categories', 
  rateLimiter(20, 15 * 60 * 1000), // 20 requests per 15 minutes
  ProductController.getCategories
);

router.get('/brands', 
  rateLimiter(20, 15 * 60 * 1000), // 20 requests per 15 minutes
  ProductController.getBrands
);

router.get('/category/:categoryId', 
  rateLimiter(30, 15 * 60 * 1000), // 30 requests per 15 minutes
  ProductController.getProductsByCategory
);

router.get('/:id', 
  rateLimiter(60, 15 * 60 * 1000), // 60 requests per 15 minutes
  ProductController.getProduct
);

// Protected routes (Admin only)
router.get('/admin/stats', 
  authenticateToken,
  requireAdmin,
  ProductController.getProductStats
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Product service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
