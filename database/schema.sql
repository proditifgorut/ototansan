-- Automodern Indonesia Database Schema
-- Created for authentication and user management

-- Create database
CREATE DATABASE IF NOT EXISTS automodern_indonesia;
USE automodern_indonesia;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'user', 'manager') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_image VARCHAR(255) NULL
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
);

-- User sessions for login management
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_id (user_id)
);

-- Login attempts tracking (for security)
CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100),
    ip_address VARCHAR(45),
    success BOOLEAN DEFAULT FALSE,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_attempted_at (attempted_at)
);

-- User profiles (extended information)
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Indonesia',
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User preferences
CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, preference_key)
);

-- Audit log for user activities
CREATE TABLE user_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: admin123 - change this!)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, email_verified) VALUES
('admin', 'admin@automodern.id', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoS', 'Admin', 'User', 'admin', TRUE);

-- Consultations table for service requests
CREATE TABLE consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service_type ENUM('konsultasi-umum', 'layanan-teknis', 'dukungan-produk', 'keluhan-layanan', 'permintaan-khusus') NOT NULL,
    message TEXT NOT NULL,
    preferred_time DATETIME NULL,
    urgency ENUM('normal', 'urgent', 'very-urgent') DEFAULT 'normal',
    status ENUM('pending', 'in-progress', 'responded', 'closed') DEFAULT 'pending',
    assigned_to INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency),
    INDEX idx_service_type (service_type),
    INDEX idx_created_at (created_at)
);

-- Consultation activity logs
CREATE TABLE consultation_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    consultation_id INT NOT NULL,
    user_id INT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_consultation_id (consultation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Product categories table
CREATE TABLE product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INT NULL,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active)
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock_quantity INT DEFAULT 0,
    category_id INT NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    images JSON,
    specifications JSON,
    features JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_category_id (category_id),
    INDEX idx_brand (brand),
    INDEX idx_price (price),
    INDEX idx_is_featured (is_featured),
    INDEX idx_is_bestseller (is_bestseller),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Product reviews table
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_is_approved (is_approved),
    INDEX idx_created_at (created_at)
);

-- Insert product categories
INSERT INTO product_categories (name, slug, description) VALUES
('Kamera 360 Derajat', 'kamera-360', 'Kamera 360 derajat berkualitas tinggi untuk mobil'),
('Aksesoris Mobil', 'aksesoris-mobil', 'Berbagai aksesoris untuk kendaraan'),
('Sistem Keamanan', 'sistem-keamanan', 'Perangkat keamanan dan monitoring kendaraan'),
('Audio & Video', 'audio-video', 'Sistem audio dan video untuk mobil');

-- Insert 360 camera products
INSERT INTO products (name, slug, description, short_description, price, sale_price, sku, stock_quantity, category_id, brand, model, images, specifications, features, is_featured, is_bestseller, status, meta_title, meta_description) VALUES
(
    'Kamera 360 Derajat Premium AutoView Pro',
    'kamera-360-autoview-pro',
    'Kamera 360 derajat premium dengan teknologi terdepan untuk memberikan pandangan menyeluruh di sekitar kendaraan Anda. Dilengkapi dengan resolusi 4K Ultra HD, night vision, dan sistem perekaman otomatis. Cocok untuk semua jenis kendaraan dan mudah dipasang.',
    'Kamera 360° premium dengan resolusi 4K, night vision, dan perekaman otomatis',
    8500000,
    7650000,
    'CAM360-AVP-001',
    25,
    1,
    'AutoView',
    'Pro 4K',
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"]',
    '{"resolusi": "4K Ultra HD (3840x2160)", "sudut_pandang": "360 derajat penuh", "night_vision": "Ya, dengan sensor inframerah", "storage": "Micro SD hingga 256GB", "konektivitas": "WiFi, Bluetooth, USB", "power": "12V DC dari mobil", "dimensi": "15cm x 15cm x 8cm", "berat": "850 gram", "waterproof": "IP67", "garansi": "2 tahun"}',
    '["Pandangan 360 derajat tanpa blind spot", "Resolusi 4K Ultra HD", "Night vision dengan sensor inframerah", "Perekaman otomatis saat parkir", "Aplikasi mobile untuk monitoring", "Easy installation plug & play", "Waterproof IP67", "G-sensor untuk deteksi benturan", "Loop recording", "Wide dynamic range (WDR)"]',
    1,
    1,
    'active',
    'Kamera 360 Derajat Premium AutoView Pro 4K - Automodern Indonesia',
    'Kamera 360 derajat premium dengan resolusi 4K Ultra HD, night vision, dan sistem perekaman otomatis. Garansi 2 tahun.'
),
(
    'Kamera 360 Derajat Smart Vision X1',
    'kamera-360-smart-vision-x1',
    'Kamera 360 derajat dengan teknologi AI dan machine learning untuk deteksi objek otomatis. Dilengkapi dengan fitur parking assist, lane departure warning, dan collision detection. Interface yang user-friendly dan instalasi yang mudah.',
    'Kamera 360° dengan AI detection, parking assist, dan collision warning',
    12500000,
    11250000,
    'CAM360-SVX1-002',
    15,
    1,
    'Smart Vision',
    'X1 AI',
    '["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800"]',
    '{"resolusi": "4K Ultra HD dengan AI Enhancement", "sudut_pandang": "360 derajat + AI object detection", "ai_features": "Object detection, Lane assist, Collision warning", "storage": "Internal 64GB + Micro SD 512GB", "konektivitas": "WiFi 6, Bluetooth 5.0, 4G LTE", "power": "12V/24V DC compatible", "dimensi": "18cm x 18cm x 10cm", "berat": "1.2 kg", "waterproof": "IP68", "garansi": "3 tahun"}',
    '["AI-powered object detection", "Parking assist dengan guidelines", "Lane departure warning", "Collision detection dan alert", "4K recording dengan AI enhancement", "Cloud storage integration", "Voice control support", "Advanced night vision", "Real-time streaming ke smartphone", "Professional installation support"]',
    1,
    1,
    'active',
    'Kamera 360 Derajat Smart Vision X1 dengan AI - Automodern Indonesia',
    'Kamera 360 derajat dengan teknologi AI untuk deteksi objek, parking assist, dan collision warning. Garansi 3 tahun.'
),
(
    'Kamera 360 Derajat Compact Drive 360',
    'kamera-360-compact-drive-360',
    'Solusi kamera 360 derajat yang compact dan terjangkau tanpa mengurangi kualitas. Perfect untuk kendaraan compact dan sedan. Mudah dipasang dan digunakan dengan fitur-fitur essential untuk keamanan berkendara.',
    'Kamera 360° compact dengan harga terjangkau, kualitas HD, mudah dipasang',
    4500000,
    3950000,
    'CAM360-CD360-003',
    40,
    1,
    'Compact Drive',
    '360 HD',
    '["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"]',
    '{"resolusi": "Full HD 1080p", "sudut_pandang": "360 derajat", "night_vision": "Basic night mode", "storage": "Micro SD hingga 128GB", "konektivitas": "WiFi, USB", "power": "12V DC", "dimensi": "12cm x 12cm x 6cm", "berat": "450 gram", "waterproof": "IP65", "garansi": "1 tahun"}',
    '["360 derajat full coverage", "Full HD 1080p recording", "Compact design", "Easy plug & play installation", "Basic night vision", "Loop recording", "G-sensor", "Mobile app support", "Affordable price", "1 year warranty"]',
    1,
    1,
    'active',
    'Kamera 360 Derajat Compact Drive 360 HD - Automodern Indonesia',
    'Kamera 360 derajat compact dengan harga terjangkau, kualitas Full HD, dan instalasi mudah. Garansi 1 tahun.'
),
(
    'Kamera 360 Derajat Professional CarGuard Elite',
    'kamera-360-carguard-elite',
    'Kamera 360 derajat professional grade untuk kendaraan komersial dan luxury cars. Dilengkapi dengan multiple sensors, advanced analytics, dan sistem monitoring 24/7. Built untuk durability dan performance maksimal.',
    'Kamera 360° professional grade dengan multiple sensors dan monitoring 24/7',
    18500000,
    16650000,
    'CAM360-CGE-004',
    8,
    1,
    'CarGuard',
    'Elite Pro',
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800"]',
    '{"resolusi": "8K Ultra HD dengan HDR", "sudut_pandang": "360 derajat + multiple angle views", "sensors": "6 kamera + 4 sensor ultrasonik", "storage": "Internal 256GB + Cloud storage", "konektivitas": "5G, WiFi 6E, Bluetooth 5.2", "power": "12V/24V dengan backup battery", "dimensi": "25cm x 25cm x 12cm", "berat": "2.5 kg", "waterproof": "IP69K", "garansi": "5 tahun"}',
    '["8K Ultra HD recording", "6 kamera + 4 sensor system", "24/7 monitoring dengan backup power", "Advanced driver assistance", "Fleet management integration", "Professional installation", "5G connectivity", "Cloud storage unlimited", "Weather resistant IP69K", "5 tahun garansi premium"]',
    1,
    1,
    'active',
    'Kamera 360 Derajat Professional CarGuard Elite 8K - Automodern Indonesia',
    'Kamera 360 derajat professional grade dengan 8K recording, multiple sensors, dan monitoring 24/7. Garansi 5 tahun.'
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
