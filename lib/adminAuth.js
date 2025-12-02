// ════════════════════════════════════════════════════════════
// 🔐 Admin Auth Helpers - دوال التحقق البسيطة
// ════════════════════════════════════════════════════════════

import { query } from '@/lib/db';

/**
 * التحقق من token الأدمن
 * @param {Request} request - الطلب
 * @returns {Object} { isValid, userId, role, error }
 */
export async function verifyAdminToken(request) {
  try {
    // الحصول على الـ token من header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isValid: false,
        error: 'غير مصرح - لا يوجد token'
      };
    }

    const token = authHeader.replace('Bearer ', '');

    // التحقق من صيغة الـ token
    if (!token.startsWith('admin-')) {
      return {
        isValid: false,
        error: 'token غير صالح'
      };
    }

    // استخراج user ID من الـ token
    // صيغة: admin-{userId}-{timestamp}-{random}
    const parts = token.split('-');
    if (parts.length < 2) {
      return {
        isValid: false,
        error: 'token غير صحيح'
      };
    }

    const userId = parseInt(parts[1]);

    // التحقق من المستخدم في قاعدة البيانات
    const result = await query(
      `SELECT id, role 
       FROM admin_users 
       WHERE id = $1 
       AND (role = 'admin' OR role = 'super_admin')
       AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        isValid: false,
        error: 'المستخدم غير موجود أو غير نشط'
      };
    }

    const user = result.rows[0];

    // نجح التحقق
    return {
      isValid: true,
      userId: user.id,
      role: user.role
    };

  } catch (error) {
    console.error('Token verification error:', error);
    return {
      isValid: false,
      error: 'خطأ في التحقق من الصلاحيات'
    };
  }
}

/**
 * middleware للتحقق من الأدمن
 * يُستخدم في بداية كل API endpoint
 */
export async function requireAdmin(request) {
  const auth = await verifyAdminToken(request);
  
  if (!auth.isValid) {
    return {
      error: true,
      response: Response.json(
        { success: false, error: auth.error || 'غير مصرح' },
        { status: 403 }
      )
    };
  }

  return {
    error: false,
    auth: auth
  };
}