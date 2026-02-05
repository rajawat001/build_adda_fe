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

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products?limit=1000&isActive=true`);
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

async function fetchDistributors() {
  try {
    const res = await fetch(`${API_URL}/distributors?limit=1000`);
    const data = await res.json();
    return data.distributors || [];
  } catch (error) {
    console.error('Error fetching distributors for sitemap:', error);
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
  try {
    // Fetch products and distributors in parallel
    const [products, distributors] = await Promise.all([
      fetchProducts(),
      fetchDistributors()
    ]);

    const sitemap = generateSitemapXml(staticPages, products, distributors);

    // Set headers for XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}
