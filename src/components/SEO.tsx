import Head from 'next/head';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title, 
  description = 'Building Material E-commerce Platform - Quality construction materials at your doorstep',
  keywords = 'building materials, construction, cement, steel, sand, bricks, ecommerce',
  image = '/logo.png',
  url = 'https://buildmat.com'
}: SEOProps) {
  const fullTitle = `${title} | BuildAdda`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}