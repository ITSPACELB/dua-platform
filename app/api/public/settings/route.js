import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================================================
// 📥 GET - جلب الإعدادات العامة (بدون authentication)
// ============================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // جلب إعداد محدد
      const result = await query(
        'SELECT key, value, updated_at FROM platform_settings WHERE key = $1',
        [key]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          setting: null
        });
      }

      return NextResponse.json({
        success: true,
        setting: result.rows[0]
      });
    } else {
      // جلب كل الإعدادات
      const result = await query(
        'SELECT key, value, updated_at FROM platform_settings ORDER BY key'
      );

      return NextResponse.json({
        success: true,
        settings: result.rows
      });
    }
  } catch (error) {
    console.error('GET public settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}