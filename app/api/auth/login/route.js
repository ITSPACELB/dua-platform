import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getVerificationLevel } from '@/lib/levelsSystem';

export async function POST(request) {
  try {
    const body = await request.json();
    const { device_fingerprint, phone_number, country_code } = body;

    // Validation
    if (!device_fingerprint && !phone_number) {
      return NextResponse.json(
        { error: 'device_fingerprint or phone_number required' },
        { status: 400 }
      );
    }

    let user;

    // Login by phone
    if (phone_number) {
      const result = await query(
        `SELECT * FROM users WHERE phone_number = $1 AND country_code = $2`,
        [phone_number, country_code || '+964']
      );
      user = result.rows[0];
    }
    
    // Login by fingerprint
    if (!user && device_fingerprint) {
      const result = await query(
        `SELECT * FROM users WHERE device_fingerprint = $1`,
        [device_fingerprint]
      );
      user = result.rows[0];
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get level
    const level = getVerificationLevel(user);

    // Get stats
    const statsResult = await query(
      `SELECT * FROM user_stats WHERE user_id = $1`,
      [user.id]
    );
    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        level,
        created_at: user.created_at
      },
      stats: stats || null
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}