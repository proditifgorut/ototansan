// Product controller for managing automotive products
const Product = require('../models/Product');
const { findOne, findMany } = require('../../database/config');

class ProductController {
  // Get all products with filtering and pagination
  static async getAllProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const filters = {
        category_id: req.query.category_id,
        brand: req.query.brand,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        search: req.query.search,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order
      };

      const products = await Product.getAll(page, limit, filters);
      const totalProducts = await Product.getCount(filters);
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        data: {
          products: products.map(p => p.toJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get featured products
  static async getFeaturedProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await Product.getFeatured(limit);

      res.json({
        success: true,
        data: products.map(p => p.toJSON())
      });

    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get bestseller products
  static async getBestsellerProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await Product.getBestsellers(limit);

      res.json({
        success: true,
        data: products.map(p => p.toJSON())
      });

    } catch (error) {
      console.error('Get bestseller products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get product by ID or slug
  static async getProduct(req, res) {
    try {
      const identifier = req.params.id;
      let product;

      // Check if identifier is numeric (ID) or string (slug)
      if (/^\d+$/.test(identifier)) {
        product = await Product.findById(parseInt(identifier));
      } else {
        product = await Product.findBySlug(identifier);
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan'
        });
      }

      // Get related products
      const relatedProducts = await Product.getRelated(product.id, product.category_id, 4);

      res.json({
        success: true,
        data: {
          product: product.toJSON(),
          related_products: relatedProducts.map(p => p.toJSON())
        }
      });

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get products by category
  static async getProductsByCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      const products = await Product.getByCategory(categoryId, page, limit);
      const totalProducts = await Product.getCount({ category_id: categoryId });
      const totalPages = Math.ceil(totalProducts / limit);

      // Get category info
      const categoryQuery = 'SELECT * FROM product_categories WHERE id = ?';
      const category = await findOne(categoryQuery, [categoryId]);

      res.json({
        success: true,
        data: {
          category,
          products: products.map(p => p.toJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const searchTerm = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Parameter pencarian diperlukan'
        });
      }

      const products = await Product.search(searchTerm, page, limit);
      const totalProducts = await Product.getCount({ search: searchTerm });
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        data: {
          search_term: searchTerm,
          products: products.map(p => p.toJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get product categories
  static async getCategories(req, res) {
    try {
      const query = `
        SELECT c.*, 
               COUNT(p.id) as product_count
        FROM product_categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
      `;

      const categories = await findMany(query);

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get product brands
  static async getBrands(req, res) {
    try {
      const query = `
        SELECT brand, COUNT(*) as product_count
        FROM products 
        WHERE status = 'active'
        GROUP BY brand
        ORDER BY brand ASC
      `;

      const brands = await findMany(query);

      res.json({
        success: true,
        data: brands
      });

    } catch (error) {
      console.error('Get brands error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get 360 camera products specifically
  static async get360CameraProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      // Get 360 camera category
      const categoryQuery = 'SELECT id FROM product_categories WHERE slug = "kamera-360"';
      const category = await findOne(categoryQuery);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori kamera 360 tidak ditemukan'
        });
      }

      const products = await Product.getByCategory(category.id, 1, limit);

      res.json({
        success: true,
        data: {
          category: 'Kamera 360 Derajat',
          products: products.map(p => p.toJSON())
        }
      });

    } catch (error) {
      console.error('Get 360 camera products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  // Get product statistics (for admin dashboard)
  static async getProductStats(req, res) {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM products WHERE status = "active"';
      const featuredQuery = 'SELECT COUNT(*) as featured FROM products WHERE is_featured = TRUE AND status = "active"';
      const bestsellerQuery = 'SELECT COUNT(*) as bestseller FROM products WHERE is_bestseller = TRUE AND status = "active"';
      const outOfStockQuery = 'SELECT COUNT(*) as out_of_stock FROM products WHERE stock_quantity = 0 AND status = "active"';

      const [total, featured, bestseller, outOfStock] = await Promise.all([
        findOne(totalQuery),
        findOne(featuredQuery),
        findOne(bestsellerQuery),
        findOne(outOfStockQuery)
      ]);

      res.json({
        success: true,
        data: {
          total: total?.total || 0,
          featured: featured?.featured || 0,
          bestseller: bestseller?.bestseller || 0,
          out_of_stock: outOfStock?.out_of_stock || 0
        }
      });

    } catch (error) {
      console.error('Get product stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}

module.exports = ProductController;
