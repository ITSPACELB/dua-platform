import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.full_name,
        u.level,
        COUNT(p.id) as prayers_today
      FROM users u
      INNER JOIN prayers p ON p.user_id = u.id
      WHERE u.is_mock_data = false
        AND DATE(p.prayed_at) = CURRENT_DATE
      GROUP BY u.id, u.full_name, u.level
      HAVING COUNT(p.id) > 0
      ORDER BY prayers_today DESC
      LIMIT $1
    `, [limit]);

    const users = result.rows.map(row => ({
      id: row.id,
      name: row.full_name || 'مؤمن',
      level: row.level || 1,
      prayersToday: parseInt(row.prayers_today) || 0,
      badge: row.level === 3 ? '👑' : row.level === 2 ? '⭐' : ''
    }));

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'فشل جلب المتفاعلين' 
      },
      { status: 500 }
    );
  }
}