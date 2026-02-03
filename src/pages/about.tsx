import React from 'react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'BuildAdda',
    url: 'https://www.buildadda.in',
    logo: 'https://www.buildadda.in/buildAddaBrandImage.png',
    description: 'BuildAdda is India\'s leading e-commerce platform for construction materials and building supplies. We connect verified manufacturers and distributors with builders, contractors, and homeowners across India.',
    foundingDate: '2023',
    founder: {
      '@type': 'Organization',
      name: 'BuildAdda',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Saini Colony, mirzapur',
      addressLocality: 'Gangapur City',
      addressRegion: 'Rajasthan',
      postalCode: '322201',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-6377845721',
      contactType: 'Customer Service',
      email: 'contact@buildadda.in',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://www.facebook.com/share/16z1jBrpVs/',
      'https://x.com/buildadda14',
      'https://www.instagram.com/build_adda?igsh=OTd6aXRoeWszb3hr',
      'https://www.linkedin.com/company/buildadda/',
      'https://www.youtube.com/@BuildAdda',
    ],
  },
};

const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="About Us - BuildAdda | India's Leading Building Materials Marketplace"
        description="Learn about BuildAdda - India's premier online marketplace for construction materials. We connect verified distributors with builders, contractors & homeowners in Gangapur City, Rajasthan. 10,000+ happy customers, 500+ verified distributors."
        keywords="about BuildAdda, building materials marketplace India, construction supplies Gangapur City, verified distributors Rajasthan, online building materials, cement steel bricks sand paint tiles supplier"
        canonicalUrl="https://www.buildadda.in/about"
        jsonLd={aboutJsonLd}
      />

      <Header />

      <div className="info-page">
        <div className="info-container">
          <h1>About BuildAdda</h1>
          <p className="subtitle">Your Trusted Partner for Quality Construction Materials</p>

          <div className="info-content">
            <section className="intro-section">
              <div className="intro-image">
                <img src="/Banner/Build_Adda_banner.png" alt="BuildAdda Construction Materials" />
              </div>
              <div className="intro-text">
                <h2>Who We Are</h2>
                <p>
                  BuildAdda is a leading e-commerce platform specializing in construction materials and building supplies.
                  We connect quality manufacturers and distributors with builders, contractors, and homeowners across India.
                </p>
                <p>
                  Founded with a vision to modernize the construction materials industry, we provide a seamless online
                  shopping experience, ensuring you get the right materials at the right price, delivered on time.
                </p>
              </div>
            </section>

            <section className="mission-section">
              <h2>Our Mission</h2>
              <p>
                To revolutionize the construction materials industry by providing a transparent, efficient, and reliable
                platform that empowers our customers to build their dreams with confidence.
              </p>
            </section>

            <section className="values-section">
              <h2>Our Core Values</h2>
              <div className="values-grid">
                <div className="value-card">
                  <div className="value-icon">🎯</div>
                  <h3>Quality First</h3>
                  <p>We partner only with verified manufacturers and distributors who meet our strict quality standards.</p>
                </div>
                <div className="value-card">
                  <div className="value-icon">🤝</div>
                  <h3>Trust & Transparency</h3>
                  <p>Honest pricing, clear product information, and transparent business practices in everything we do.</p>
                </div>
                <div className="value-card">
                  <div className="value-icon">⚡</div>
                  <h3>Speed & Efficiency</h3>
                  <p>Fast order processing, timely delivery, and efficient customer service to keep your projects on track.</p>
                </div>
                <div className="value-card">
                  <div className="value-icon">💡</div>
                  <h3>Innovation</h3>
                  <p>Leveraging technology to simplify procurement and improve the construction materials buying experience.</p>
                </div>
              </div>
            </section>

            <section className="stats-section">
              <h2>Our Impact</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">10,000+</div>
                  <div className="stat-label">Happy Customers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Verified Distributors</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">5,000+</div>
                  <div className="stat-label">Quality Products</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Cities Served</div>
                </div>
              </div>
            </section>

            <section className="story-section">
              <h2>Our Story</h2>
              <p>
                BuildAdda was born from a simple observation: the construction materials industry was stuck in the past.
                Procurement was time-consuming, pricing was opaque, and quality was inconsistent. We knew there had to be a better way.
              </p>
              <p>
                In 2023, we launched BuildAdda with a vision to bring the construction materials industry into the digital age.
                Starting with a small team and a handful of distributors, we've grown into a trusted platform serving thousands
                of customers across India.
              </p>
              <p>
                Today, we continue to innovate and expand, always keeping our customers' needs at the forefront. Whether you're
                building a dream home, managing a large construction project, or running a contracting business, BuildAdda is
                here to support you every step of the way.
              </p>
            </section>

            <section className="team-section">
              <h2>Why Choose BuildAdda?</h2>
              <ul className="benefits-list">
                <li>
                  <strong>Verified Quality:</strong> All products come from verified manufacturers and distributors with quality certifications.
                </li>
                <li>
                  <strong>Competitive Pricing:</strong> Direct partnerships with distributors ensure you get the best prices without compromising on quality.
                </li>
                <li>
                  <strong>Wide Selection:</strong> From cement and steel to tiles and electrical fittings, find everything you need in one place.
                </li>
                <li>
                  <strong>Convenient Delivery:</strong> Reliable delivery to your construction site, ensuring materials arrive when you need them.
                </li>
                <li>
                  <strong>Expert Support:</strong> Our customer service team is always ready to help you choose the right materials for your project.
                </li>
                <li>
                  <strong>Secure Payments:</strong> Multiple payment options including Cash on Delivery and secure online payments.
                </li>
                <li>
                  <strong>Easy Returns:</strong> 7-day hassle-free returns on eligible products (see our Returns Policy).
                </li>
              </ul>
            </section>

            <section className="cta-section">
              <h2>Join the BuildAdda Community</h2>
              <p>
                Whether you're a homeowner, contractor, or builder, we're here to help you build better.
                Start shopping today and experience the difference.
              </p>
              <div className="cta-buttons">
                <a href="/products" className="btn-primary">Browse Products</a>
                <a href="/contact" className="btn-secondary">Contact Us</a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AboutPage;
