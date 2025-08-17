-- Migration: 005_rollback_migration.sql
-- Description: Rollback migration to undo all changes
-- Date: 2024-01-01
-- WARNING: This will delete all data and schema changes!

-- Drop views first
DROP VIEW IF EXISTS participant_performance CASCADE;
DROP VIEW IF EXISTS campaign_performance CASCADE;
DROP VIEW IF EXISTS organization_stats CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS detect_fraud_trigger ON events;
DROP TRIGGER IF EXISTS create_reward_on_conversion_trigger ON conversions;
DROP TRIGGER IF EXISTS update_link_stats_trigger ON events;

-- Drop functions
DROP FUNCTION IF EXISTS detect_fraud() CASCADE;
DROP FUNCTION IF EXISTS create_reward_on_conversion() CASCADE;
DROP FUNCTION IF EXISTS update_link_stats() CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS ai_audit CASCADE;
DROP TABLE IF EXISTS fraud_signals CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS referral_links CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS org_users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS "pgcrypto";
DROP EXTENSION IF EXISTS "uuid-ossp";
