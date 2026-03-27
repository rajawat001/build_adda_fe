import { NextApiRequest, NextApiResponse } from 'next';

const SITE_URL = 'https://www.buildadda.in';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.buildadda.in/api';

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products', priority: '0.9', changefreq: 'daily' },
  { url: '/distributors', priority: '0.9', changefreq: 'daily' },
  { url: '/products?category=Cement', priority: '0.8', changefreq: 'daily' },
  { url: '/products?category=Steel', priority: '0.8', changefreq: 'daily' },
  { url: '/products?category=Bricks', priority: '0.8', changefreq: 'daily' },
  { url: '/products?category=Sand', priority: '0.8', changefreq: 'daily' },
  { url: '/products?category=Paint', priority: '0.8', changefreq: 'daily' },
  { url: '/products?category=Tiles', priority: '0.8', changefreq: 'daily' },
  { url: '/login', priority: '0.5', changefreq: 'monthly' },
  { url: '/register', priority: '0.5', changefreq: 'monthly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  { url: '/shipping', priority: '0.4', changefreq: 'yearly' },
  { url: '/returns', priority: '0.4', changefreq: 'yearly' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchDistributors(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_URL}/users/distributors?limit=1000`, {
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

async function fetchProducts(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_URL}/products?limit=1000&isActive=true`, {
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

function generateSitemapXml(staticPages: any[], products: any[], distributors: any[]) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Product pages with image sitemap extension
  for (const product of products) {
    if (!product._id) continue;
    const slug = product.slug || product._id;
    const lastmod = product.updatedAt
      ? new Date(product.updatedAt).toISOString().split('T')[0]
      : today;

    xml += `  <url>
    <loc>${SITE_URL}/products/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;

    // Add product images for Google Image search
    const images: string[] = [];
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    } else if (product.image) {
      images.push(product.image);
    }

    for (const img of images.slice(0, 5)) {
      if (img && img.startsWith('http')) {
        xml += `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(product.name || '')}</image:title>
      <image:caption>${escapeXml((product.name || '') + ' - Buy online at best price on BuildAdda')}</image:caption>
    </image:image>
`;
      }
    }

    xml += `  </url>
`;
  }

  // Individual distributor profile pages
  for (const dist of distributors) {
    if (!dist._id) continue;
    const slug = dist.slug || dist._id;
    xml += `  <url>
    <loc>${SITE_URL}/distributor/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  try {
    const [products, distributors] = await Promise.all([
      fetchProducts(),
      fetchDistributors(),
    ]);

    console.log(`Sitemap: ${staticPages.length} static, ${products.length} products, ${distributors.length} distributors`);

    const sitemap = generateSitemapXml(staticPages, products, distributors);
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const sitemap = generateSitemapXml(staticPages, [], []);
    res.status(200).send(sitemap);
  }
}
