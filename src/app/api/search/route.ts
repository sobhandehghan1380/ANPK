import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          solutions: [],
          products: [],
          projects: [],
          articles: [],
        },
      });
    }

    const [solutions, products, projects, articles] = await Promise.all([
      prisma.solution.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { subtitle: { contains: q } },
            { problemStatement: { contains: q } },
          ],
        },
        take: 6,
      }),
      prisma.product.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: q } },
            { tagline: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 6,
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { clientName: { contains: q } },
            { domain: { contains: q } },
            { summary: { contains: q } },
          ],
        },
        take: 6,
      }),
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        take: 6,
      }),
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        solutions,
        products,
        projects,
        articles,
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در جستجو' },
      { status: 500 }
    );
  }
}
