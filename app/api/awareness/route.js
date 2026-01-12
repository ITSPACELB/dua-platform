import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================================================
// 📥 GET - جلب التوعية للمستخدمين (بدون authentication)
// ============================================================================
export async function GET() {
  try {
    // جلب من platform_settings
    const result = await query(
      'SELECT value FROM platform_settings WHERE key = $1',
      ['awareness']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        show: false
      });
    }

    const awarenessData = result.rows[0].value;

    // Parse JSON
    let data;
    try {
      data = typeof awarenessData === 'string' 
        ? JSON.parse(awarenessData) 
        : awarenessData;
    } catch {
      data = awarenessData;
    }

    return NextResponse.json({
      success: true,
      show: data.isActive || false,
      id: 'awareness-v1',
      title: 'إعلان مهم',
      content: data.content || '',
      type: data.type || 'info',
      links: data.links || []
    });

  } catch (error) {
    console.error('GET awareness error:', error);
    return NextResponse.json({
      success: false,
      show: false
    });
  }
}
