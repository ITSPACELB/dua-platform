import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من صلاحيات المسؤول
// ============================================================================
async function verifyAdmin(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const adminCheck = await query(
            'SELECT role FROM admin_users WHERE user_id = $1',
            [decoded.userId]
        );
        
        if (adminCheck.rows.length === 0) {
            return null;
        }
        
        return { ...decoded, role: adminCheck.rows[0].role };
    } catch (error) {
        return null;
    }
}

// ============================================================================
// 📥 GET - جلب جميع الإعدادات
// ============================================================================
export async function GET(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const settingsResult = await query(
            'SELECT key, value, updated_at FROM platform_settings ORDER BY key'
        );

        const settings = {};
        settingsResult.rows.forEach(row => {
            settings[row.key] = {
                value: row.value,
                updatedAt: row.updated_at
            };
        });

        return NextResponse.json({
            success: true,
            settings
        });

    } catch (error) {
        console.error('Admin get settings error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الإعدادات' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📤 PUT - تحديث إعداد
// ============================================================================
export async function PUT(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'غير مصرح - صلاحيات Super Admin مطلوبة' }, { status: 403 });
        }

        const { key, value } = await request.json();

        if (!key || !value) {
            return NextResponse.json({ error: 'المفتاح والقيمة مطلوبان' }, { status: 400 });
        }

        await query(
            `INSERT INTO platform_settings (key, value, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (key) 
             DO UPDATE SET value = $2, updated_at = NOW()`,
            [key, value]
        );

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الإعداد بنجاح'
        });

    } catch (error) {
        console.error('Admin update setting error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تحديث الإعداد' },
            { status: 500 }
        );
    }
}