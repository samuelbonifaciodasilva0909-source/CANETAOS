-- =====================================================
-- CanetaOS - Schema v3: Expand Tracker
-- Adds measurements, mood, energy, sleep, water,
-- protein, dose, photo to tracker_entries
-- =====================================================

-- Add columns to tracker_entries
ALTER TABLE tracker_entries
  ADD COLUMN IF NOT EXISTS hip_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS chest_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS arm_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS thigh_measurement NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS water_intake_ml INTEGER,
  ADD COLUMN IF NOT EXISTS protein_intake_g NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS dose_applied BOOLEAN,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add mood and energy to symptom_entries
ALTER TABLE symptom_entries
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5);
