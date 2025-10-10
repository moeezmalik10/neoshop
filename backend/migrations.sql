-- Create database (run once if needed)
-- CREATE DATABASE IF NOT EXISTS neoshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE neoshop;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  stock INT DEFAULT 0,
  category VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_price DECIMAL(10,2),
  status ENUM('pending','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  expires_at DATETIME NULL
);

-- Add role column to existing users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('customer', 'admin') DEFAULT 'customer';

-- Add missing columns to products table if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Seed products
INSERT INTO products (name, price, description, image, stock, category) VALUES
('Aurora Headphones', 129.99, 'Immersive over-ear headphones.', 'https://images.unsplash.com/photo-1518447654495-6a1b6e155b43?q=80&w=800&auto=format&fit=crop', 25, 'Electronics'),
('Nebula Smartwatch', 199.00, 'Track health metrics and workouts.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', 40, 'Electronics'),
('Stellar Drone', 549.00, 'Compact 4K drone with smart flight modes.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop', 8, 'Electronics')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample orders and order items removed - use real data from user interactions


