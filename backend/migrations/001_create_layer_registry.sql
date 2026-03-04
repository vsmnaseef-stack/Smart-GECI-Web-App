-- ============================================================
-- Migration: 001_create_layer_registry
-- Description: Creates the layer_registry table that stores all
--              GIS layer definitions, their GeoServer mapping,
--              parent–child hierarchy and access-control flags.
-- ============================================================

-- ── Enable pgcrypto for gen_random_uuid() ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Main table ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS layer_registry (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255) NOT NULL,
    geoserver_name VARCHAR(255) NOT NULL,
    parent_id      UUID         NULL
                       REFERENCES layer_registry(id)
                       ON DELETE CASCADE
                       ON UPDATE CASCADE,
    restricted     BOOLEAN      NOT NULL DEFAULT FALSE,
    visible        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fast lookup by GeoServer layer name
CREATE UNIQUE INDEX IF NOT EXISTS idx_layer_registry_geoserver_name
    ON layer_registry (geoserver_name);

-- Efficient tree traversal (parent → children)
CREATE INDEX IF NOT EXISTS idx_layer_registry_parent_id
    ON layer_registry (parent_id);

-- Filter by access flags
CREATE INDEX IF NOT EXISTS idx_layer_registry_restricted
    ON layer_registry (restricted);

CREATE INDEX IF NOT EXISTS idx_layer_registry_visible
    ON layer_registry (visible);

-- ── GIST index placeholder ────────────────────────────────────────────────────
-- Uncomment once the `geometry` column is added to this table or a linked
-- spatial table (e.g. facility_features) is created.
--
-- CREATE EXTENSION IF NOT EXISTS "postgis";
--
-- ALTER TABLE layer_registry ADD COLUMN IF NOT EXISTS
--     geom geometry(Geometry, 4326);
--
-- CREATE INDEX IF NOT EXISTS idx_layer_registry_geom
--     ON layer_registry USING GIST (geom);

-- ── Auto-update updated_at on every row change ────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_layer_registry_updated_at ON layer_registry;

CREATE TRIGGER set_layer_registry_updated_at
    BEFORE UPDATE ON layer_registry
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at();

-- ── Seed data (optional — comment out in production) ─────────────────────────
-- INSERT INTO layer_registry (name, geoserver_name, restricted, visible)
-- VALUES
--   ('Buildings',     'smart_geci:buildings',     FALSE, TRUE),
--   ('Infrastructure','smart_geci:infrastructure', FALSE, TRUE),
--   ('Security',      'smart_geci:security',       TRUE,  TRUE),
--   ('Green Spaces',  'smart_geci:green_spaces',   FALSE, TRUE)
-- ON CONFLICT (geoserver_name) DO NOTHING;
