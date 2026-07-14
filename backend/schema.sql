-- ============================================
-- SCHEMA DATABASE: monitoring_kkn
-- Untuk PostgreSQL (Supabase)
-- ============================================

-- ============================================
-- TABEL USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa',
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABEL DIVISI
-- ============================================
CREATE TABLE IF NOT EXISTS divisi (
    id SERIAL PRIMARY KEY,
    nama_divisi VARCHAR(255) NOT NULL,
    deskripsi TEXT
);

-- ============================================
-- TABEL MAHASISWA
-- ============================================
CREATE TABLE IF NOT EXISTS mahasiswa (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    nim VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    prodi VARCHAR(255),
    no_hp VARCHAR(50),
    jabatan VARCHAR(100),
    divisi_id INTEGER REFERENCES divisi(id) ON DELETE SET NULL,
    foto VARCHAR(255)
);

-- ============================================
-- TABEL KEHADIRAN (Absensi)
-- ============================================
CREATE TABLE IF NOT EXISTS kehadiran (
    id SERIAL PRIMARY KEY,
    mahasiswa_id INTEGER REFERENCES mahasiswa(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_masuk TIME NOT NULL DEFAULT CURRENT_TIME,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    status VARCHAR(50) NOT NULL DEFAULT 'hadir'
);

-- ============================================
-- TABEL AKTIVITAS
-- ============================================
CREATE TABLE IF NOT EXISTS aktivitas (
    id SERIAL PRIMARY KEY,
    mahasiswa_id INTEGER REFERENCES mahasiswa(id) ON DELETE CASCADE,
    judul_kegiatan VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    foto VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABEL QR_CODE
-- ============================================
CREATE TABLE IF NOT EXISTS qr_code (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    expired_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'aktif'
);

-- ============================================
-- TABEL LOKASI KKN
-- ============================================
CREATE TABLE IF NOT EXISTS lokasi_kkn (
    id SERIAL PRIMARY KEY,
    nama_lokasi VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    radius DECIMAL(10, 2) NOT NULL DEFAULT 100
);

-- ============================================
-- TABEL PENILAIAN
-- ============================================
CREATE TABLE IF NOT EXISTS penilaian (
    id SERIAL PRIMARY KEY,
    mahasiswa_id INTEGER UNIQUE REFERENCES mahasiswa(id) ON DELETE CASCADE,
    nilai DECIMAL(5, 2),
    grade VARCHAR(5),
    catatan TEXT
);
