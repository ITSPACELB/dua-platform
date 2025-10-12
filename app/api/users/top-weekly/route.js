export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        u.id,
        u.full_name,
        u.city,
        u.show_full_name,
        COUNT(p.id) as prayer_count,
        us.interaction_rate
       FROM prayers p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN user_stats us ON u.id = us.user_id
       WHERE p.prayed_at > NOW() - INTERVAL '7 days'
       GROUP BY u.id, u.full_name, u.city, u.show_full_name, us.interaction_rate
       ORDER BY prayer_count DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return NextResponse.json(null);
    }

    const user = result.rows[0];
    let verificationLevel = null;
    const rate = parseFloat(user.interaction_rate || 0);
    
    if (rate >= 98) {
      verificationLevel = { name: 'GOLD', color: 'amber', icon: '👑', threshold: 98 };
    } else if (rate >= 90) {
      verificationLevel = { name: 'GREEN', color: 'emerald', icon: '✓✓', threshold: 90 };
    } else if (rate >= 80) {
      verificationLevel = { name: 'BLUE', color: 'blue', icon: '✓', threshold: 80 };
    }

    const displayName = user.show_full_name
      ? `${user.full_name}${user.city ? ` (${user.city})` : ''}`
      : `${user.full_name.split(' ')[0]}...`;

    return NextResponse.json({
      id: user.id,
      displayName,
      verificationLevel,
      prayersThisWeek: parseInt(user.prayer_count),
      showName: user.show_full_name
    });

  } catch (error) {
    console.error('Top weekly user error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
