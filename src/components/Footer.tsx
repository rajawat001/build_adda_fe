import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>BuildAdda</h3>
            <p>Your trusted partner for quality building materials</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/distributors">Distributors</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shipping">Shipping Policy</Link></li>
              <li><Link href="/returns">Return Policy</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@buildmat.com</p>
            <p>Phone: +91 1234567890</p>
            <p>Address: Jaipur, Rajasthan, India</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 BuildAdda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}