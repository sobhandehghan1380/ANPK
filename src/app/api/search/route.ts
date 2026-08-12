import { NextResponse } from 'next/server';
import { getSolutions, getProducts, getProjects, getArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

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

    const [allSolutions, allProducts, allProjects, allArticles] = await Promise.all([
      getSolutions(),
      getProducts(false),
      getProjects(),
      getArticles(),
    ]);

    const solutions = allSolutions.filter((s: any) =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.summary || '').toLowerCase().includes(q)
    ).slice(0, 6);

    const products = allProducts.filter((p: any) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.summary || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    ).slice(0, 6);

    const projects = allProjects.filter((p: any) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.clientName || '').toLowerCase().includes(q) ||
      (p.domain || '').toLowerCase().includes(q) ||
      (p.summary || '').toLowerCase().includes(q)
    ).slice(0, 6);

    const articles = allArticles.filter((a: any) =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q) ||
      (a.summary || '').toLowerCase().includes(q)
    ).slice(0, 6);

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
