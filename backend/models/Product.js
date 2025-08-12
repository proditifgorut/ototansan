// Product model for managing automotive products
const { findOne, findMany, insert, update, deleteRecord } = require('../../database/config');

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.short_description = data.short_description;
    this.price = data.price;
    this.sale_price = data.sale_price;
    this.sku = data.sku;
    this.stock_quantity = data.stock_quantity;
    this.category_id = data.category_id;
    this.brand = data.brand;
    this.model = data.model;
    this.images = data.images ? JSON.parse(data.images) : [];
    this.specifications = data.specifications ? JSON.parse(data.specifications) : {};
    this.features = data.features ? JSON.parse(data.features) : [];
    this.is_featured = data.is_featured;
    this.is_bestseller = data.is_bestseller;
    this.status = data.status;
    this.meta_title = data.meta_title;
    this.meta_description = data.meta_description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.category_name = data.category_name;
    this.rating = data.rating || 0;
    this.review_count = data.review_count || 0;
  }

  // Find product by ID
  static async findById(id) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.id = ? AND p.status = 'active'
      GROUP BY p.id
    `;
    const result = await findOne(query, [id]);
    return result ? new Product(result) : null;
  }

  // Find product by slug
  static async findBySlug(slug) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.slug = ? AND p.status = 'active'
      GROUP BY p.id
    `;
    const result = await findOne(query, [slug]);
    return result ? new Product(result) : null;
  }

  // Get all products with pagination
  static async getAll(page = 1, limit = 12, filters = {}) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.status = 'active'
    `;
    let params = [];

    // Apply filters
    if (filters.category_id) {
      query += ' AND p.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.brand) {
      query += ' AND p.brand = ?';
      params.push(filters.brand);
    }

    if (filters.min_price) {
      query += ' AND p.price >= ?';
      params.push(filters.min_price);
    }

    if (filters.max_price) {
      query += ' AND p.price <= ?';
      params.push(filters.max_price);
    }

    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' GROUP BY p.id';

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'DESC';
    
    if (sortBy === 'price') {
      query += ` ORDER BY p.price ${sortOrder}`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY rating ${sortOrder}`;
    } else if (sortBy === 'name') {
      query += ` ORDER BY p.name ${sortOrder}`;
    } else {
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await findMany(query, params);
    return products.map(product => new Product(product));
  }

  // Get featured products
  static async getFeatured(limit = 8) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.is_featured = TRUE AND p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const products = await findMany(query, [limit]);
    return products.map(product => new Product(product));
  }

  // Get bestseller products
  static async getBestsellers(limit = 8) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.is_bestseller = TRUE AND p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const products = await findMany(query, [limit]);
    return products.map(product => new Product(product));
  }

  // Get products by category
  static async getByCategory(categoryId, page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.category_id = ? AND p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const products = await findMany(query, [categoryId, limit, offset]);
    return products.map(product => new Product(product));
  }

  // Search products
  static async search(searchTerm, page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR c.name LIKE ?) 
        AND p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const products = await findMany(query, [
      searchPattern, searchPattern, searchPattern, searchPattern, limit, offset
    ]);
    return products.map(product => new Product(product));
  }

  // Get related products
  static async getRelated(productId, categoryId, limit = 4) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      GROUP BY p.id
      ORDER BY RAND()
      LIMIT ?
    `;
    
    const products = await findMany(query, [categoryId, productId, limit]);
    return products.map(product => new Product(product));
  }

  // Create new product
  static async create(productData) {
    try {
      const newProduct = {
        name: productData.name,
        slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: productData.description,
        short_description: productData.short_description,
        price: productData.price,
        sale_price: productData.sale_price || null,
        sku: productData.sku,
        stock_quantity: productData.stock_quantity || 0,
        category_id: productData.category_id,
        brand: productData.brand,
        model: productData.model || null,
        images: JSON.stringify(productData.images || []),
        specifications: JSON.stringify(productData.specifications || {}),
        features: JSON.stringify(productData.features || []),
        is_featured: productData.is_featured || false,
        is_bestseller: productData.is_bestseller || false,
        status: productData.status || 'active',
        meta_title: productData.meta_title || productData.name,
        meta_description: productData.meta_description || productData.short_description
      };

      const result = await insert('products', newProduct);
      
      if (result.success) {
        return await Product.findById(result.insertId);
      }
      
      return null;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  // Update product
  async update(productData) {
    try {
      const updateData = {};
      
      const allowedFields = [
        'name', 'slug', 'description', 'short_description', 'price', 'sale_price',
        'sku', 'stock_quantity', 'category_id', 'brand', 'model', 'images',
        'specifications', 'features', 'is_featured', 'is_bestseller', 'status',
        'meta_title', 'meta_description'
      ];

      for (const field of allowedFields) {
        if (productData[field] !== undefined) {
          if (['images', 'specifications', 'features'].includes(field)) {
            updateData[field] = JSON.stringify(productData[field]);
          } else {
            updateData[field] = productData[field];
          }
        }
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date();
        const result = await update('products', updateData, 'id = ?', [this.id]);
        return result.success;
      }

      return false;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  // Get product count
  static async getCount(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM products WHERE status = "active"';
    let params = [];

    if (filters.category_id) {
      query += ' AND category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const result = await findOne(query, params);
    return result ? result.count : 0;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      short_description: this.short_description,
      price: parseFloat(this.price),
      sale_price: this.sale_price ? parseFloat(this.sale_price) : null,
      sku: this.sku,
      stock_quantity: this.stock_quantity,
      category_id: this.category_id,
      category_name: this.category_name,
      brand: this.brand,
      model: this.model,
      images: this.images,
      specifications: this.specifications,
      features: this.features,
      is_featured: Boolean(this.is_featured),
      is_bestseller: Boolean(this.is_bestseller),
      status: this.status,
      meta_title: this.meta_title,
      meta_description: this.meta_description,
      rating: parseFloat(this.rating),
      review_count: parseInt(this.review_count),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Product;
