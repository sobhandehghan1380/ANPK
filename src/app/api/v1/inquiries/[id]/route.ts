import { NextResponse } from 'next/server';

const DJANGO_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${DJANGO_API_BASE_URL}/api/v1/leads/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify({
        action: 'update_status',
        lead_id: id,
        status: body.status,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        message: 'بروزرسانی با موفقیت انجام شد.',
        data,
      });
    }

    return NextResponse.json(
      { success: false, message: 'خطا در انجام تغییرات.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در انجام تغییرات.' },
      { status: 500 }
    );
  }
}
