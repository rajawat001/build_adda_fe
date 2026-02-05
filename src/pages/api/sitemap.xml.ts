import { NextApiRequest, NextApiResponse } from 'next';

const SITE_URL = 'https://www.buildadda.in';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.buildadda.in/api';

// Static pages with their priorities
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products', priority: '0.9', changefreq: 'daily' },
  { url: '/distributors', priority: '0.9', changefreq: 'daily' },
  { url: '/login', priority: '0.7', changefreq: 'monthly' },
  { url: '/register', priority: '0.7', changefreq: 'monthly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  { url: '/shipping', priority: '0.4', changefreq: 'yearly' },
  { url: '/returns', priority: '0.4', changefreq: 'yearly' },
];

async function fetchProducts(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${API_URL}/products?limit=500&isActive=true`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error('Products API returned:', res.status);
      return [];
    }

    const data = await res.json();
    return data.products || [];
  } catch (error: any) {
    console.error('Error fetching products for sitemap:', error.message || error);
    return [];
  }
}

async function fetchDistributors(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(`${API_URL}/distributors?limit=500`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error('Distributors API returned:', res.status);
      return [];
    }

    const data = await res.json();
    return data.distributors || [];
  } catch (error: any) {
    console.error('Error fetching distributors for sitemap:', error.message || error);
    return [];
  }
}

function generateSitemapXml(staticPages: any[], products: any[], distributors: any[]) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Add product pages
  for (const product of products) {
    if (!product._id) continue;
    const lastmod = product.updatedAt
      ? new Date(product.updatedAt).toISOString().split('T')[0]
      : today;
    xml += `  <url>
    <loc>${SITE_URL}/products/${product._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // Add distributor pages
  for (const distributor of distributors) {
    if (!distributor._id) continue;
    const lastmod = distributor.updatedAt
      ? new Date(distributor.updatedAt).toISOString().split('T')[0]
      : today;
    xml += `  <url>
    <loc>${SITE_URL}/distributor/${distributor._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Always return XML content type
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  try {
    // Fetch products and distributors in parallel
    const [products, distributors] = await Promise.all([
      fetchProducts(),
      fetchDistributors()
    ]);

    console.log(`Sitemap: ${staticPages.length} static, ${products.length} products, ${distributors.length} distributors`);

    const sitemap = generateSitemapXml(staticPages, products, distributors);
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Even on error, return valid XML with just static pages
    const sitemap = generateSitemapXml(staticPages, [], []);
    res.status(200).send(sitemap);
  }
}
