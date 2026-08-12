import { MetadataRoute } from 'next';
import { getSolutions, getProducts, getProjects, getArticles } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://anpk.ir';

  const [solutions, products, projects, articles] = await Promise.all([
    getSolutions(),
    getProducts(false),
    getProjects(),
    getArticles(),
  ]);

  const staticRoutes = [
    '',
    '/solutions',
    '/products',
    '/projects',
    '/articles',
    '/about',
    '/contact',
    '/start-project',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const solutionRoutes = solutions.map((s: any) => ({
    url: `${baseUrl}/solutions/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const productRoutes = products.map((p: any) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const projectRoutes = projects.map((p: any) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const articleRoutes = articles.map((a: any) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...solutionRoutes, ...productRoutes, ...projectRoutes, ...articleRoutes];
}
