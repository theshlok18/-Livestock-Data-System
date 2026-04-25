-- Livestock Animal Data Digitization System
-- MySQL Schema

CREATE DATABASE IF NOT EXISTS livestock_db;
USE livestock_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) DEFAULT 'field_officer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_no VARCHAR(50) NOT NULL UNIQUE,
    animal_type VARCHAR(50),
    breed VARCHAR(100),
    age VARCHAR(50),
    owner_name VARCHAR(150),
    village VARCHAR(100),
    contact VARCHAR(20),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monthly_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_no VARCHAR(50) NOT NULL,
    record_date DATE NOT NULL,
    milk_per_day DECIMAL(10,2),
    fat DECIMAL(5,2),
    snf DECIMAL(5,2),
    rate DECIMAL(10,2),
    feeding VARCHAR(255),
    expenses DECIMAL(10,2),
    health_status VARCHAR(100),
    vaccination VARCHAR(255),
    deworming VARCHAR(100),
    pregnancy_status VARCHAR(100),
    lactation_no INT,
    dry_date DATE,
    calving_date DATE,
    calf_tag VARCHAR(50),
    calf_sex VARCHAR(10),
    body_weight DECIMAL(8,2),
    body_condition_score VARCHAR(10),
    notes TEXT,
    is_draft BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tag_no) REFERENCES animals(tag_no) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sample users (password: admin123)
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhN3uXWZEHGJnB4Vc2YGKK', 'Admin User', 'admin'),
('officer1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhN3uXWZEHGJnB4Vc2YGKK', 'Field Officer 1', 'field_officer');

-- Sample animals
INSERT INTO animals (tag_no, animal_type, breed, age, owner_name, village, contact) VALUES
('TAG001', 'Cow', 'HF Cross', '4 Years', 'Ramesh Kumar', 'Nagpur Village', '9876543210'),
('TAG002', 'Buffalo', 'Murrah', '5 Years', 'Suresh Patil', 'Wardha', '9123456789');

-- Sample monthly records
INSERT INTO monthly_records (tag_no, record_date, milk_per_day, fat, snf, rate, feeding, expenses, health_status, notes) VALUES
('TAG001', '2026-03-01', 12.50, 4.2, 8.5, 35.00, 'Green fodder + Concentrate', 150.00, 'Healthy', 'Normal lactation'),
('TAG001', '2026-04-01', 11.80, 4.0, 8.3, 35.00, 'Green fodder + Concentrate', 150.00, 'Healthy', 'Slight decrease in milk');
