import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    // تحقق من صلاحيات الأدمن (مهم جداً!)
    const { adminSecret } = await request.json();
    
    // ضع سر قوي هنا
    if (adminSecret !== 'YOUR_SUPER_SECRET_ADMIN_KEY_2025') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = [];

    // Migration 003
    const migration003 = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS age INTEGER,
      ADD COLUMN IF NOT EXISTS country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key;
      
      ALTER TABLE users 
      ADD CONSTRAINT users_email_key UNIQUE (email);

      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_age_check;
      
      ALTER TABLE users 
      ADD CONSTRAINT users_age_check CHECK (age >= 1 AND age <= 120);

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_country ON users(country) WHERE country IS NOT NULL;
    `;

    await client.query(migration003);
    results.push('✅ Migration 003: Profile fields added');

    // Migration 004
    const migration004 = `
      CREATE TABLE IF NOT EXISTS collective_prayers (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          scheduled_date TIMESTAMP NOT NULL,
          intention TEXT,
          status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
          participants_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collective_prayer_participants (
          id SERIAL PRIMARY KEY,
          collective_prayer_id INTEGER NOT NULL REFERENCES collective_prayers(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          confirmed BOOLEAN DEFAULT FALSE,
          remind_before_minutes INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(collective_prayer_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_collective_prayers_user_id ON collective_prayers(user_id);
      CREATE INDEX IF NOT EXISTS idx_collective_prayers_scheduled_date ON collective_prayers(scheduled_date);
      CREATE INDEX IF NOT EXISTS idx_collective_prayers_status ON collective_prayers(status);
      CREATE INDEX IF NOT EXISTS idx_collective_prayer_participants_prayer_id ON collective_prayer_participants(collective_prayer_id);
      CREATE INDEX IF NOT EXISTS idx_collective_prayer_participants_user_id ON collective_prayer_participants(user_id);
    `;

    await client.query(migration004);
    results.push('✅ Migration 004: Collective prayer tables created');

    return NextResponse.json({
      success: true,
      message: 'All migrations completed successfully',
      results
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        detail: error.detail 
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}