import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/api/leads/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
