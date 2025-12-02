// ════════════════════════════════════════════════════════════
// 📝 Admin Library Request Actions API
// ════════════════════════════════════════════════════════════
// المسار: app/api/admin/library/requests/[id]/[action]/route.js
// ════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ════════════════════════════════════════════════════════════
// 🔐 التحقق من صلاحيات الأدمن
// ════════════════════════════════════════════════════════════
function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Unauthorized' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Invalid token' };
  }
}

// ════════════════════════════════════════════════════════════
// POST - الموافقة على طلب
// ════════════════════════════════════════════════════════════
export async function POST(request, { params }) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { id, action } = params;
    const body = await request.json();
    
    if (action === 'approve') {
      // تحديث حالة الطلب إلى "approved"
      const result = await query(
        `UPDATE library_requests
         SET status = 'approved',
             admin_notes = $1,
             admin_reviewed_by = $2,
             reviewed_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [body.adminNotes || null, auth.decoded.email || 'admin', id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'الطلب غير موجود'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'تمت الموافقة على الطلب',
        request: result.rows[0]
      });
      
    } else if (action === 'reject') {
      // تحديث حالة الطلب إلى "rejected"
      const result = await query(
        `UPDATE library_requests
         SET status = 'rejected',
             admin_notes = $1,
             admin_reviewed_by = $2,
             reviewed_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [body.reason || 'تم رفض الطلب', auth.decoded.email || 'admin', id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'الطلب غير موجود'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'تم رفض الطلب',
        request: result.rows[0]
      });
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Action غير صالح'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}