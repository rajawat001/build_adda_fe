import Link from 'next/link';
import { useState } from 'react';
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend
} from 'react-icons/fi';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="modern-footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-column">
              <div className="footer-brand">
                <img src="/buildAddaBrandImage.png" alt="BuildAdda" className="footer-logo" />
                <p className="footer-description">
                  Your trusted partner for quality building materials. We connect you with verified
                  distributors to ensure the best prices and service.
                </p>
              </div>

              <div className="social-links">
                <a href="https://www.facebook.com/share/16z1jBrpVs/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FiFacebook />
                </a>
                <a href="https://x.com/buildadda14" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FiTwitter />
                </a>
                <a href="https://www.instagram.com/build_adda?igsh=OTd6aXRoeWszb3hr/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FiInstagram />
                </a>
                <a href="https://www.linkedin.com/company/buildadda/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FiLinkedin />
                </a>
                <a href="https://www.youtube.com/@BuildAdda" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FiYoutube />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/products">Products</Link></li>
                <li><Link href="/distributors">Distributors</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="footer-column">
              <h4 className="footer-heading">Categories</h4>
              <ul className="footer-links">
                <li><Link href="/products?category=Cement">Cement</Link></li>
                <li><Link href="/products?category=Steel">Steel</Link></li>
                <li><Link href="/products?category=Bricks">Bricks</Link></li>
                <li><Link href="/products?category=Sand">Sand</Link></li>
                <li><Link href="/products?category=Paint">Paint</Link></li>
                <li><Link href="/products?category=Tiles">Tiles</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-column">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links">
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/shipping">Shipping Policy</Link></li>
                <li><Link href="/returns">Return Policy</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <FiMail />
                  <span>contact@buildadda.in</span>
                </li>
                <li>
                  <FiPhone />
                  <span>+91 6377845721</span>
                </li>
                <li>
                  <FiMapPin />
                  <span>Jaipur, Rajasthan, India</span>
                </li>
              </ul>

              <div className="newsletter">
                <h5 className="newsletter-title">Subscribe to Newsletter</h5>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <div className="newsletter-input-wrapper">
                    <FiMail className="newsletter-icon" />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="newsletter-btn">
                    <FiSend />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; 2026 BuildAdda. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link href="/privacy">Privacy Policy</Link>
              <span className="separator">•</span>
              <Link href="/terms">Terms of Service</Link>
              <span className="separator">•</span>
              <Link href="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}