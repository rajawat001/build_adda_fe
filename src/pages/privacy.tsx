import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for BuildAdda platform"
      />
      <Header />

      <div className="legal-page">
        <div className="legal-container">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: December 31, 2025</p>

          <div className="legal-content">
            <section>
              <h2>1. Introduction</h2>
              <p>
                BuildAdda ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>

              <h3>2.1 Personal Information</h3>
              <ul>
                <li>Name and contact information (email, phone number)</li>
                <li>Delivery address</li>
                <li>Payment information</li>
                <li>Account credentials</li>
              </ul>

              <h3>2.2 Business Information (for Distributors)</h3>
              <ul>
                <li>Business name and registration details</li>
                <li>GST number</li>
                <li>Bank account information</li>
                <li>Business documents</li>
              </ul>

              <h3>2.3 Automatically Collected Information</h3>
              <ul>
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar technologies</li>
                <li>Location data (with your permission)</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Improve our products and services</li>
                <li>Personalize your experience</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2>4. Information Sharing and Disclosure</h2>
              <p>We may share your information with:</p>

              <h3>4.1 Distributors</h3>
              <p>Your order and delivery information is shared with distributors to fulfill your orders.</p>

              <h3>4.2 Service Providers</h3>
              <p>
                We work with third-party service providers for payment processing (Razorpay), delivery, and cloud storage (Cloudinary, MongoDB).
              </p>

              <h3>4.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required by law or in response to valid legal requests.
              </p>

              <h3>4.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section>
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul>
                <li>Encryption of data in transit (HTTPS)</li>
                <li>Secure password storage (bcrypt hashing)</li>
                <li>HTTP-only cookies for authentication</li>
                <li>Regular security audits</li>
                <li>Limited access to personal information</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Data portability</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@buildadda.com
              </p>
            </section>

            <section>
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience. You can control cookie settings through your browser, but disabling cookies may limit functionality.
              </p>

              <h3>Types of Cookies We Use:</h3>
              <ul>
                <li>Essential cookies (required for authentication)</li>
                <li>Functional cookies (remember your preferences)</li>
                <li>Analytics cookies (understand user behavior)</li>
              </ul>
            </section>

            <section>
              <h2>8. Third-Party Links</h2>
              <p>
                Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.
              </p>
            </section>

            <section>
              <h2>9. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2>10. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
            </section>

            <section>
              <h2>11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place.
              </p>
            </section>

            <section>
              <h2>12. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
              </p>
            </section>

            <section>
              <h2>13. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <ul>
                <li>Email: privacy@buildadda.com</li>
                <li>Phone: +91 1234567890</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
