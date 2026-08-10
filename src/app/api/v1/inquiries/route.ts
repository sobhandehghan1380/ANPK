import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DJANGO_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Simple in-memory rate limiting map (IP -> timestamp[])
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false; // Exceeded limit
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

function sanitizeInput(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate Limiting Check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً دقایقی دیگر تلاش نمایید.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot validation
    if (body.website_hp && body.website_hp.length > 0) {
      return NextResponse.json(
        { success: false, message: 'درخواست غیرمجاز شناسایی شد.' },
        { status: 400 }
      );
    }

    // Required fields validation
    const fullName = sanitizeInput(body.fullName);
    const phone = sanitizeInput(body.phone);
    const email = sanitizeInput(body.email);
    const fieldDomain = sanitizeInput(body.fieldDomain);
    const problemDescription = sanitizeInput(body.problemDescription);
    const currentSystemStatus = sanitizeInput(body.currentSystemStatus);
    const timeline = sanitizeInput(body.timeline);
    const budgetRange = sanitizeInput(body.budgetRange);
    const privacyAgreed = Boolean(body.privacyAgreed);

    if (!fullName || !phone || !email || !fieldDomain || !problemDescription || !timeline || !budgetRange) {
      return NextResponse.json(
        { success: false, message: 'لطفاً تمامی فیلدهای اجباری فرم را با دقت تکمیل نمایید.' },
        { status: 400 }
      );
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { success: false, message: 'تایید قوانین حریم خصوصی برای ثبت درخواست الزامی است.' },
        { status: 400 }
      );
    }

    // Phone format check (Iranian mobile or landline)
    const phoneRegex = /^0[0-9]{9,10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { success: false, message: 'شماره تماس وارد شده معتبر نمی‌باشد (مثال: 09123456789).' },
        { status: 400 }
      );
    }

    // Generate unique tracking code: ANPK-2026-XXXXX
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const trackingCode = `ANPK-2026-${randomDigits}`;
    const company = sanitizeInput(body.company) || fullName;

    // Send to Django Leads API
    try {
      await fetch(`${DJANGO_API_BASE_URL}/api/v1/leads/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: company,
          contact_person: fullName,
          phone,
          email,
          service_type: fieldDomain,
          budget_range: budgetRange,
          timeline,
          source: 'وبسایت - فرم ۴ مرحله‌ای'
        })
      });
    } catch (apiErr) {
      console.warn('Django lead submission warning:', apiErr);
    }

    return NextResponse.json({
      success: true,
      message: 'درخواست پروژه شما با موفقیت ثبت گردید.',
      data: {
        trackingCode,
        fullName,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در ثبت درخواست. لطفاً مجدداً تلاش فرمایید.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${DJANGO_API_BASE_URL}/api/v1/leads/submit/`, {
      cache: 'no-store',
      headers: { Authorization: authorization },
    });
    if (res.ok) {
      const leads = await res.json();
      return NextResponse.json({ success: true, data: leads });
    }
    return NextResponse.json({ success: false, data: [] }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, data: [] }, { status: 502 });
  }
}
