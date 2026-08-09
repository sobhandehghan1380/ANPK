import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const existing = await prisma.projectInquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'درخواست مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    const { status, internalNotes, assignedTo, actorName } = body;

    const updateData: any = {};
    const auditNotes: string[] = [];

    if (status && status !== existing.status) {
      updateData.status = status;
      auditNotes.push(`تغییر وضعیت از ${existing.status} به ${status}`);
    }

    if (internalNotes !== undefined && internalNotes !== existing.internalNotes) {
      updateData.internalNotes = internalNotes;
      auditNotes.push(`بروزرسانی یادداشت داخلی`);
    }

    if (assignedTo !== undefined && assignedTo !== existing.assignedTo) {
      updateData.assignedTo = assignedTo;
      auditNotes.push(`تغییر مسئول رسیدگی به ${assignedTo || 'بدون مسئول'}`);
    }

    const updated = await prisma.projectInquiry.update({
      where: { id },
      data: updateData,
    });

    if (auditNotes.length > 0) {
      await prisma.inquiryAuditLog.create({
        data: {
          inquiryId: id,
          action: 'بروزرسانی مدیریت',
          notes: auditNotes.join(' | '),
          actor: actorName || 'مدیر سیستم',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'بروزرسانی با موفقیت انجام شد.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در انجام تغییرات.' },
      { status: 500 }
    );
  }
}
