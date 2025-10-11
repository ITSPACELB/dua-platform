import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { fullName, motherName } = await request.json();
    
    // TODO: Check database for uniqueness
    // For now, always return true
    return NextResponse.json({
      isUnique: true,
      message: 'الاسم متاح'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
