import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من المسؤول
// ============================================================================
function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'غير مصرح' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return { valid: false, error: 'غير مصرح' };
    }

    return { valid: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Token غير صالح' };
  }
}

// ============================================================================
// 📥 GET - جلب الإعدادات
// ============================================================================
export async function GET(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    // Get banner
    const bannerResult = await query('SELECT * FROM banner ORDER BY created_at DESC LIMIT 1');
    const banner = bannerResult.rows[0] || null;

    // Get awareness
    const awarenessResult = await query('SELECT * FROM awareness ORDER BY created_at DESC LIMIT 1');
    const awareness = awarenessResult.rows[0] || null;

    // Get platform_settings
    const settingsResult = await query('SELECT key, value FROM platform_settings');
    const platformSettings = {};
    settingsResult.rows.forEach(row => {
      try {
        platformSettings[row.key] = JSON.parse(row.value);
      } catch {
        platformSettings[row.key] = row.value;
      }
    });

    // Build response as array for frontend compatibility
    const settingsArray = [];
    
    if (banner) {
      settingsArray.push({
        key: 'banner',
        value: {
          isActive: banner.is_active,
          text: banner.content,
          backgroundColor: platformSettings.banner?.backgroundColor || '#10b981',
          textColor: platformSettings.banner?.textColor || '#ffffff',
          link: banner.link
        }
      });
    }

    if (awareness) {
      settingsArray.push({
        key: 'awareness',
        value: {
          isActive: awareness.is_active,
          content: awareness.content,
          links: awareness.link || []
        }
      });
    }

    // Add other platform settings
    Object.keys(platformSettings).forEach(key => {
      if (key !== 'banner' && key !== 'awareness') {
        settingsArray.push({
          key: key,
          value: platformSettings[key]
        });
      }
    });

    return NextResponse.json({ success: true, settings: settingsArray });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإعدادات', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 📤 POST/PUT - حفظ/تحديث إعداد
// ============================================================================
export async function POST(request) {
  return await handleSave(request);
}

export async function PUT(request) {
  return await handleSave(request);
}

async function handleSave(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key مطلوب' }, { status: 400 });
    }

    // Handle banner
    if (key === 'banner') {
      const { isActive, text, backgroundColor, textColor, link } = value;
      
      // Update or insert banner
      const existingBanner = await query('SELECT id FROM banner ORDER BY created_at DESC LIMIT 1');
      
      if (existingBanner.rows.length > 0) {
        await query(
          'UPDATE banner SET content = $1, link = $2, is_active = $3, updated_at = NOW() WHERE id = $4',
          [text, link || '', isActive, existingBanner.rows[0].id]
        );
      } else {
        await query(
          'INSERT INTO banner (content, link, is_active) VALUES ($1, $2, $3)',
          [text, link || '', isActive]
        );
      }

      // Save colors to platform_settings
      await query(
        `INSERT INTO platform_settings (key, value, updated_by) 
         VALUES ('banner', $1, $2)
         ON CONFLICT (key) 
         DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2`,
        [JSON.stringify({ backgroundColor, textColor }), auth.decoded.adminId]
      );

      return NextResponse.json({ success: true, message: 'تم حفظ البانر بنجاح' });
    }

    // Handle awareness
    if (key === 'awareness') {
      const { isActive, content, links } = value;
      
      // Update or insert awareness
      const existingAwareness = await query('SELECT id FROM awareness ORDER BY created_at DESC LIMIT 1');
      
      if (existingAwareness.rows.length > 0) {
        await query(
          'UPDATE awareness SET content = $1, link = $2, is_active = $3, updated_at = NOW() WHERE id = $4',
          [content, JSON.stringify(links || []), isActive, existingAwareness.rows[0].id]
        );
      } else {
        await query(
          'INSERT INTO awareness (content, link, is_active) VALUES ($1, $2, $3)',
          [content, JSON.stringify(links || []), isActive]
        );
      }

      return NextResponse.json({ success: true, message: 'تم حفظ التوعية بنجاح' });
    }

    // Handle other platform settings
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await query(
      `INSERT INTO platform_settings (key, value, updated_by) 
       VALUES ($1, $2, $3)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $3`,
      [key, valueStr, auth.decoded.adminId]
    );

    return NextResponse.json({ success: true, message: 'تم حفظ الإعداد بنجاح' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الإعداد', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف إعداد
// ============================================================================
export async function DELETE(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key مطلوب' }, { status: 400 });
    }

    if (key === 'banner' || key === 'awareness') {
      return NextResponse.json({ error: 'لا يمكن حذف هذا الإعداد' }, { status: 400 });
    }

    await query('DELETE FROM platform_settings WHERE key = $1', [key]);

    return NextResponse.json({ success: true, message: 'تم حذف الإعداد بنجاح' });
  } catch (error) {
    console.error('DELETE settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الإعداد', details: error.message },
      { status: 500 }
    );
  }
}
