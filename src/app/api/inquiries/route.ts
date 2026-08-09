import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const company = sanitizeInput(body.company);

    // Create DB Record
    const inquiry = await prisma.projectInquiry.create({
      data: {
        trackingCode,
        fullName,
        company,
        phone,
        email,
        preferredContact: sanitizeInput(body.preferredContact) || 'phone',
        fieldDomain,
        problemDescription,
        currentProcess: sanitizeInput(body.currentProcess),
        targetUsers: sanitizeInput(body.targetUsers),
        desiredOutcome: sanitizeInput(body.desiredOutcome),
        currentSystemStatus,
        requiredIntegrations: sanitizeInput(body.requiredIntegrations),
        timeline,
        budgetRange,
        constraints: sanitizeInput(body.constraints),
        privacyAgreed,
        leadSource: sanitizeInput(body.leadSource) || 'وبسایت - فرم ۴ مرحله‌ای',
        userIp: ip,
        status: 'NEW',
      },
    });

    // Create Audit Log
    await prisma.inquiryAuditLog.create({
      data: {
        inquiryId: inquiry.id,
        action: 'ایجاد درخواست',
        notes: 'درخواست پروژه با موفقیت در دیتابیس ثبت و کد پیگیری صادر شد.',
        actor: 'سیستم ثبت ورود',
      },
    });

    // Simulated CRM & Email dispatch notification
    console.log(`[CRM DISPATCH] Sent inquiry ${trackingCode} for ${fullName} (${company || 'شخصی'}) to engineering lead queue.`);

    return NextResponse.json({
      success: true,
      message: 'درخواست پروژه شما با موفقیت ثبت گردید.',
      data: {
        trackingCode,
        fullName,
        createdAt: inquiry.createdAt,
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query = searchParams.get('query');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (query) {
      where.OR = [
        { trackingCode: { contains: query } },
        { fullName: { contains: query } },
        { company: { contains: query } },
        { fieldDomain: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    const inquiries = await prisma.projectInquiry.findMany({
      where,
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فهرست درخواست‌ها' },
      { status: 500 }
    );
  }
}
