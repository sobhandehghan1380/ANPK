import { fetchProducts, fetchSolutions, fetchArticles, fetchProjects, getHeroData as getHeroDataFromAPI } from './api';

export async function getHeroData() {
  try {
    const data = await getHeroDataFromAPI();
    return data;
  } catch (error) {
    console.error('Error fetching hero data from Django:', error);
    return null;
  }
}

export async function getProducts(includeDraft = false) {
  try {
    const products = await fetchProducts();
    return products.map((p: any) => {
      // Parse features_list into array
      const features = p.features_list 
        ? p.features_list.split('\n').filter((f: string) => f.trim())
        : ['معماری میکروسرویس', 'انطباق با قوانین امنیتی', 'پشتیبانی SLA ۲۴/۷'];
      
      // Parse technical_specs into workflow
      const workflow = p.technical_specs
        ? p.technical_specs.split('\n').filter((s: string) => s.trim()).map((s: string, i: number) => ({
            step: String(i + 1).padStart(2, '۰'),
            title: s.trim(),
            desc: s.trim()
          }))
        : [];

      return {
        id: p.slug || p.id,
        title: p.name,
        slug: p.slug,
        category: p.category_name || p.category,
        status: p.status,
        isPublic: p.status !== 'draft',
        summary: p.short_description,
        description: p.full_description || p.short_description,
        valueProposition: p.full_description || p.short_description,
        features: features.length > 0 ? features : ['معماری میکروسرویس', 'انطباق با قوانین امنیتی', 'پشتیبانی SLA ۲۴/۷'],
        userRoles: [
          { role: 'مدیران ارشد', desc: 'دسترسی به داشبوردهای مدیریتی و گزارش‌گیری' },
          { role: 'کارشناسان فنی', desc: 'استفاده از ابزارهای تخصصی و عملیاتی' }
        ],
        workflow: workflow.length > 0 ? workflow : [
          { step: '۱', title: 'نیازسنجی', desc: 'تحلیل نیازمندی‌ها و ارزیابی زیرساخت' },
          { step: '۲', title: 'پیاده‌سازی', desc: 'توسعه و استقرار محصول بر اساس نیاز' },
          { step: '۳', title: 'پشتیبانی', desc: 'پشتیبانی ۲۴/۷ و بروزرسانی مستمر' }
        ],
        faq: [],
        deliveryModel: 'SaaS / On-Premise',
        image_url: p.image_url,
        demo_url: p.demo_url
      };
    }).filter((p: any) => includeDraft || p.isPublic);
  } catch (error) {
    console.error('Error fetching products from Django:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts(true);
  return products.find((p: any) => p.slug === slug) || products[0] || null;
}

export async function getSolutions() {
  try {
    const solutions = await fetchSolutions();
    return solutions.map((s: any) => ({
      id: s.slug || s.id,
      title: s.title,
      slug: s.slug,
      summary: s.description,
      capabilities: [],
      faq: []
    }));
  } catch (error) {
    console.error('Error fetching solutions from Django:', error);
    return [];
  }
}

export async function getSolutionBySlug(slug: string) {
  const solutions = await getSolutions();
  return solutions.find((s: any) => s.slug === slug) || solutions[0] || null;
}

export async function getProjects() {
  try {
    const projects = await fetchProjects();
    return (projects || []).map((p: any) => ({
      id: p.id,
      slug: p.slug || `project-${p.id}`,
      title: p.title,
      clientName: p.client_display || p.client_name_display || p.organization || (p.client ? p.client.name : 'سازمان'),
      domain: p.category || (p.category_name ? p.category_name : 'پلتفرم سازمانی'),
      summary: p.summary || p.description || 'توسعه و استقرار پلتفرم اختصاصی سازمانی با پایداری ۹۹.۹٪.',
      fullDescription: p.full_description || '',
      metaTitle: p.meta_title || '',
      metaDescription: p.meta_description || '',
      results: Array.isArray(p.results) ? p.results : ['استقرار میکروسرویس‌های بومی', 'کاهش ۳۵٪ توقف‌های کاری', 'پشتیبانی ۲۴/۷ SLA'],
      features: Array.isArray(p.features) ? p.features : ['معماری ابری و ماژولار', 'امنیت داده‌ها و ایزوله‌سازی دسترسی', 'پشتیبانی SLA ۲۴/۷'],
      progress: p.progress || p.sprint_progress || 100,
      activePhase: p.active_phase || p.phase || p.active_phase_title || 'در حال بهره‌برداری',
      status: 'در حال بهره‌برداری'
    }));
  } catch (error) {
    console.error('Error fetching projects from Django:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjects();
  return projects.find((p: any) => p.slug === slug) || null;
}

export async function getArticles() {
  try {
    const articles = await fetchArticles();
    return (articles || []).map((a: any) => ({
      id: a.slug || a.id,
      title: a.title,
      slug: a.slug,
      summary: a.summary,
      content: a.content || '',
      author: a.author || 'دپارتمان مهندسی ANPK',
      date: a.created_at || '',
      readTime: a.read_time || '۵ دقیقه',
      category: a.category_name || 'عمومی',
      category_id: a.category_id || null,
      tags: Array.isArray(a.tags) ? a.tags : (a.tags ? a.tags.split(',') : []),
      thumbnail: a.thumbnail || null,
      cover_image: a.cover_image || null,
      og_image: a.og_image || null,
      views_count: a.views_count || 0,
      status: a.status || 'PUBLISHED',
      is_featured: a.is_featured || false,
      language: a.language || 'fa',
      allow_comments: a.allow_comments !== false,
      table_of_contents: a.table_of_contents !== false,
      meta_title: a.meta_title || '',
      meta_description: a.meta_description || '',
      canonical_url: a.canonical_url || '',
      og_title: a.og_title || '',
      og_description: a.og_description || '',
      schema_type: a.schema_type || 'Article',
    }));
  } catch (error) {
    console.error('Error fetching articles from Django:', error);
    return [];
  }
}

import { fetchArticleBySlug } from './api';

export async function getArticleBySlug(slug: string) {
  try {
    const article = await fetchArticleBySlug(slug);
    if (article && !article.error) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const resolveMedia = (url: string | null) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${API_BASE}${url}`;
      };
      return {
        id: article.slug || article.id,
        title: article.title,
        slug: article.slug,
        category: article.category_name || article.category || 'عمومی',
        category_id: article.category_id || null,
        author: article.author || 'دپارتمان مهندسی ANPK',
        summary: article.summary,
        content: article.content,
        date: article.created_at || '',
        readTime: article.read_time || '۵ دقیقه',
        views_count: article.views_count || 0,
        tags: Array.isArray(article.tags) ? article.tags : (article.tags ? article.tags.split(',') : []),
        thumbnail: resolveMedia(article.thumbnail),
        cover_image: resolveMedia(article.cover_image),
        og_image: resolveMedia(article.og_image),
        is_featured: article.is_featured || false,
        status: article.status || 'PUBLISHED',
        language: article.language || 'fa',
        allow_comments: article.allow_comments !== false,
        table_of_contents: article.table_of_contents !== false,
        meta_title: article.meta_title || article.title,
        meta_description: article.meta_description || article.summary,
        canonical_url: article.canonical_url || '',
        og_title: article.og_title || article.title,
        og_description: article.og_description || article.summary,
        schema_type: article.schema_type || 'Article',
      };
    }
  } catch (error) {
    console.error('Error fetching article detail:', error);
  }

  const articles = await getArticles();
  return articles.find((a: any) => a.slug === slug) || articles[0] || null;
}
