-- ============================================================
-- Migration: 002_create_users
-- Description: Creates the users table for local authentication.
--              Stores hashed passwords (bcrypt) and a role that
--              maps to the application's UserRole type.
--
--              Roles stored in DB: 'authorized' | 'admin'
--              (guests are unauthenticated — never stored)
-- ============================================================

-- ── Enable pgcrypto (idempotent — already present from 001) ──────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(100) NOT NULL,
    password_hash TEXT         NOT NULL,
    role          VARCHAR(20)  NOT NULL
                      CHECK (role IN ('authorized', 'admin')),
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Uniqueness: one account per username ──────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
    ON users (username);
