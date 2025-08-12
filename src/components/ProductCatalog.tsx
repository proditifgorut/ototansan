import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  Filter, 
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Award,
  Shield,
  Truck,
  RefreshCw
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  category_id: number;
  category_name: string;
  brand: string;
  model?: string;
  images: string[];
  specifications: Record<string, any>;
  features: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  status: string;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock API calls (replace with actual API calls)
  useEffect(() => {
    fetchProducts();
    fetchFeaturedProducts();
    fetchBestsellerProducts();
    fetchCategories();
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Kamera 360 Derajat Premium AutoView Pro',
          slug: 'kamera-360-autoview-pro',
          description: 'Kamera 360 derajat premium dengan teknologi terdepan untuk memberikan pandangan menyeluruh di sekitar kendaraan Anda.',
          short_description: 'Kamera 360° premium dengan resolusi 4K, night vision, dan perekaman otomatis',
          price: 8500000,
          sale_price: 7650000,
          sku: 'CAM360-AVP-001',
          stock_quantity: 25,
          category_id: 1,
          category_name: 'Kamera 360 Derajat',
          brand: 'AutoView',
          model: 'Pro 4K',
          images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
          ],
          specifications: {
            resolusi: '4K Ultra HD (3840x2160)',
            sudut_pandang: '360 derajat penuh',
            night_vision: 'Ya, dengan sensor inframerah',
            storage: 'Micro SD hingga 256GB',
            konektivitas: 'WiFi, Bluetooth, USB',
            power: '12V DC dari mobil',
            dimensi: '15cm x 15cm x 8cm',
            berat: '850 gram',
            waterproof: 'IP67',
            garansi: '2 tahun'
          },
          features: [
            'Pandangan 360 derajat tanpa blind spot',
            'Resolusi 4K Ultra HD',
            'Night vision dengan sensor inframerah',
            'Perekaman otomatis saat parkir',
            'Aplikasi mobile untuk monitoring'
          ],
          is_featured: true,
          is_bestseller: true,
          status: 'active',
          rating: 4.8,
          review_count: 127,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Kamera 360 Derajat Smart Vision X1',
          slug: 'kamera-360-smart-vision-x1',
          description: 'Kamera 360 derajat dengan teknologi AI dan machine learning untuk deteksi objek otomatis.',
          short_description: 'Kamera 360° dengan AI detection, parking assist, dan collision warning',
          price: 12500000,
          sale_price: 11250000,
          sku: 'CAM360-SVX1-002',
          stock_quantity: 15,
          category_id: 1,
          category_name: 'Kamera 360 Derajat',
          brand: 'Smart Vision',
          model: 'X1 AI',
          images: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
          ],
          specifications: {
            resolusi: '4K Ultra HD dengan AI Enhancement',
            sudut_pandang: '360 derajat + AI object detection',
            ai_features: 'Object detection, Lane assist, Collision warning',
            storage: 'Internal 64GB + Micro SD 512GB',
            konektivitas: 'WiFi 6, Bluetooth 5.0, 4G LTE',
            power: '12V/24V DC compatible',
            dimensi: '18cm x 18cm x 10cm',
            berat: '1.2 kg',
            waterproof: 'IP68',
            garansi: '3 tahun'
          },
          features: [
            'AI-powered object detection',
            'Parking assist dengan guidelines',
            'Lane departure warning',
            'Collision detection dan alert',
            '4K recording dengan AI enhancement'
          ],
          is_featured: true,
          is_bestseller: true,
          status: 'active',
          rating: 4.9,
          review_count: 89,
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z'
        }
      ];
      
      setProducts(mockProducts);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      // Mock featured products
      setFeaturedProducts(products.filter(p => p.is_featured));
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const fetchBestsellerProducts = async () => {
    try {
      // Mock bestseller products
      setBestsellerProducts(products.filter(p => p.is_bestseller));
    } catch (error) {
      console.error('Error fetching bestseller products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const mockCategories: Category[] = [
        { id: 1, name: 'Kamera 360 Derajat', slug: 'kamera-360', description: 'Kamera 360 derajat berkualitas tinggi untuk mobil', product_count: 4 },
        { id: 2, name: 'Aksesoris Mobil', slug: 'aksesoris-mobil', description: 'Berbagai aksesoris untuk kendaraan', product_count: 12 },
        { id: 3, name: 'Sistem Keamanan', slug: 'sistem-keamanan', description: 'Perangkat keamanan dan monitoring kendaraan', product_count: 8 },
        { id: 4, name: 'Audio & Video', slug: 'audio-video', description: 'Sistem audio dan video untuk mobil', product_count: 15 }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (price: number, salePrice?: number) => {
    if (!salePrice) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
              <Award className="w-3 h-3 mr-1" />
              Unggulan
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Terlaris
            </span>
          )}
          {product.sale_price && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              -{calculateDiscount(product.price, product.sale_price)}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 font-semibold">{product.brand}</span>
          <span className="text-xs text-gray-500">{product.category_name}</span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.short_description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.review_count} ulasan)
          </span>
        </div>

        {/* Key Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.sale_price ? (
              <div>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Stok: {product.stock_quantity}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Beli Sekarang
          </button>
          <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            Detail
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kamera 360 Derajat Berkualitas Tinggi
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Dapatkan pandangan menyeluruh di sekitar kendaraan Anda dengan teknologi kamera 360 derajat terdepan
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white/20 rounded-full px-6 py-3">
                <Shield className="w-5 h-5 mr-2" />
                <span>Garansi Resmi</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-6 py-3">
                <Truck className="w-5 h-5 mr-2" />
                <span>Gratis Instalasi</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-6 py-3">
                <RefreshCw className="w-5 h-5 mr-2" />
                <span>After Sales Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk kamera 360..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name} ({category.product_count})
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Terbaru</option>
                <option value="price">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="name">Nama A-Z</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Kamera 360 dari Kami?
            </h2>
            <p className="text-xl text-gray-600">
              Keunggulan dan jaminan yang kami berikan untuk setiap produk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garansi Resmi</h3>
              <p className="text-gray-600">Garansi resmi hingga 5 tahun dengan layanan after sales terpercaya</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instalasi Gratis</h3>
              <p className="text-gray-600">Instalasi profesional gratis oleh teknisi berpengalaman</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600">Produk berkualitas tinggi dari brand terpercaya dunia</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Support 24/7</h3>
              <p className="text-gray-600">Dukungan teknis dan customer service 24 jam setiap hari</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductCatalog;
