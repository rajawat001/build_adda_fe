import React, { useState } from 'react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { FiFacebook, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  mainEntity: {
    '@type': 'LocalBusiness',
    name: 'BuildAdda',
    url: 'https://www.buildadda.in',
    logo: 'https://www.buildadda.in/buildAddaBrandImage.png',
    image: 'https://www.buildadda.in/buildAddaBrandImage.png',
    telephone: '+91-6377845721',
    email: 'contact@buildadda.in',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Saini Colony, mirzapur',
      addressLocality: 'Gangapur City',
      addressRegion: 'Rajasthan',
      postalCode: '322201',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/share/16z1jBrpVs/',
      'https://x.com/buildadda14',
      'https://www.instagram.com/build_adda?igsh=OTd6aXRoeWszb3hr',
      'https://www.linkedin.com/company/buildadda/',
      'https://www.youtube.com/@BuildAdda',
    ],
  },
};

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Phone validation (optional but if provided, validate)
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      // Send contact form (assuming backend endpoint exists)
      await api.post('/contact', formData);

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact Us - BuildAdda | Get Help with Building Materials Orders"
        description="Contact BuildAdda for building materials inquiries, order support, delivery questions & partnership opportunities. Call +91 6377845721 or email contact@buildadda.in. Located in Gangapur City, Rajasthan."
        keywords="contact BuildAdda, building materials support, construction supplies help, BuildAdda phone number, BuildAdda email, BuildAdda address Gangapur City"
        canonicalUrl="https://www.buildadda.in/contact"
        jsonLd={contactJsonLd}
      />

      <Header />

      <div className="info-page">
        <div className="contact-container">
          <h1>Contact Us</h1>
          <p className="subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

          <div className="contact-wrapper">
            <div className="contact-info">
              <h2>Get In Touch</h2>

              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>contact@buildadda.in</p>
                  <p className="text-muted">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">📞</div>
                <div className="contact-details">
                  <h3>Phone</h3>
                  <p>+91 6377845721</p>
                  <p className="text-muted">Mon-Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h3>Address</h3>
                  <p>BuildAdda Headquarters</p>
                  <p>Saini Colony, mirzapur</p>
                  <p> Gangapur City, Rajasthan (322201)</p>
                  <p>India</p>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">⏰</div>
                <div className="contact-details">
                  <h3>Business Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="https://www.facebook.com/share/16z1jBrpVs/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FiFacebook /></a>
                  <a href="https://x.com/buildadda14" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><FaXTwitter /></a>
                  <a href="https://www.instagram.com/build_adda?igsh=OTd6aXRoeWszb3hr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram /></a>
                  <a href="https://www.linkedin.com/company/buildadda/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
                  <a href="https://www.youtube.com/@BuildAdda" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FiYoutube /></a>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <h2>Send Us a Message</h2>

              {success && (
                <div className="success-message">
                  Thank you for contacting us! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="order-issue">Order Issue</option>
                    <option value="delivery-question">Delivery Question</option>
                    <option value="payment-issue">Payment Issue</option>
                    <option value="return-refund">Return/Refund</option>
                    <option value="distributor-inquiry">Become a Distributor</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          <div className="faq-cta">
            <h3>Have a quick question?</h3>
            <p>Check out our FAQ page for answers to common questions.</p>
            <a href="/faq" className="btn-secondary">Visit FAQ</a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
