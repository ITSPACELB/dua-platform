-- Migration 004: Add Collective Prayer Tables
-- Created: 2025-01-15
-- Description: Tables for collective prayer feature (for qualified users 98%+)

-- Create collective_prayers table
CREATE TABLE IF NOT EXISTS collective_prayers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP NOT NULL,
    intention TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT collective_prayers_future_date CHECK (scheduled_date > created_at)
);

-- Create collective_prayer_participants table
CREATE TABLE IF NOT EXISTS collective_prayer_participants (
    id SERIAL PRIMARY KEY,
    collective_prayer_id INTEGER NOT NULL REFERENCES collective_prayers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    confirmed BOOLEAN DEFAULT FALSE,
    remind_before_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(collective_prayer_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collective_prayers_user_id ON collective_prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_collective_prayers_scheduled_date ON collective_prayers(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_collective_prayers_status ON collective_prayers(status);
CREATE INDEX IF NOT EXISTS idx_collective_prayer_participants_prayer_id ON collective_prayer_participants(collective_prayer_id);
CREATE INDEX IF NOT EXISTS idx_collective_prayer_participants_user_id ON collective_prayer_participants(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_collective_prayers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collective_prayers_updated_at
BEFORE UPDATE ON collective_prayers
FOR EACH ROW
EXECUTE FUNCTION update_collective_prayers_updated_at();

-- Create trigger to update participants count
CREATE OR REPLACE FUNCTION update_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE collective_prayers
    SET participants_count = (
        SELECT COUNT(*) 
        FROM collective_prayer_participants 
        WHERE collective_prayer_id = NEW.collective_prayer_id
    )
    WHERE id = NEW.collective_prayer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participants_count
AFTER INSERT OR DELETE ON collective_prayer_participants
FOR EACH ROW
EXECUTE FUNCTION update_participants_count();

-- Add comments
COMMENT ON TABLE collective_prayers IS 'جدول الدعاء الجماعي - للمستخدمين المميزين فقط (98%+)';
COMMENT ON TABLE collective_prayer_participants IS 'جدول المشاركين في الدعاء الجماعي';
COMMENT ON COLUMN collective_prayers.scheduled_date IS 'تاريخ ووقت الدعاء الجماعي';
COMMENT ON COLUMN collective_prayers.intention IS 'نية الدعاء (اختيارية، لا تظهر للعامة)';
COMMENT ON COLUMN collective_prayers.status IS 'حالة الدعاء: scheduled, completed, cancelled';
COMMENT ON COLUMN collective_prayer_participants.remind_before_minutes IS 'تذكير قبل الموعد بـ X دقيقة';