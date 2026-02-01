import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';

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
      <Head>
        <title>Contact Us - BuildAdda E-commerce</title>
        <meta name="description" content="Get in touch with BuildAdda. We're here to help with your construction material needs." />
      </Head>

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
                  <p>Bhuvneshwari vatika vistar 3rd,vaishali west road</p>
                  <p> Jaipur ,Rajasthan (302034)</p>
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
                  <a href="https://www.facebook.com/share/16z1jBrpVs/" aria-label="Facebook">📘</a>
                  <a href="https://x.com/buildadda14" aria-label="Twitter">🐦</a>
                  <a href="https://www.instagram.com/build_adda?igsh=OTd6aXRoeWszb3hr/" aria-label="Instagram">📷</a>
                  <a href="https://www.linkedin.com/company/buildadda/" aria-label="LinkedIn">💼</a>
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
