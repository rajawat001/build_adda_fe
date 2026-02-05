import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for BuildAdda platform"
        canonicalUrl="https://www.buildadda.in/privacy"
      />
      <Header />

      <div className="legal-page">
        <div className="legal-container">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: February 1, 2026</p>

          <div className="legal-content">
            <section>
              <h2>1. Introduction</h2>
              <p>
                BuildAdda ("we", "our", or "us"), operated by Himmat Singh Rajawat, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. BuildAdda is an intermediary technology platform that connects distributors/sellers with customers and does not itself sell, manufacture, or distribute any products.
              </p>
              <p>
                By using BuildAdda, you consent to the data practices described in this Privacy Policy. If you do not agree with any part of this policy, please discontinue use of the Platform immediately.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>

              <h3>2.1 Personal Information</h3>
              <ul>
                <li>Name and contact information (email, phone number)</li>
                <li>Delivery address</li>
                <li>Payment transaction details (processed via Online; we do not store card/bank details)</li>
                <li>Account credentials</li>
              </ul>

              <h3>2.2 Business Information (for Distributors)</h3>
              <ul>
                <li>Business name and registration details</li>
                <li>GST number</li>
                <li>Bank account information (for settlement purposes)</li>
                <li>Business documents submitted during registration</li>
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
                <li>Facilitate connections between customers and distributors</li>
                <li>Process and facilitate order transactions through the Platform</li>
                <li>Communicate with you about your account, orders, and Platform updates</li>
                <li>Improve the Platform's functionality and user experience</li>
                <li>Personalize your browsing experience</li>
                <li>Send promotional communications (with your consent, which you may withdraw at any time)</li>
                <li>Prevent fraud, unauthorized access, and enhance security</li>
                <li>Comply with legal obligations under Indian law</li>
              </ul>
            </section>

            <section>
              <h2>4. Information Sharing and Disclosure</h2>
              <p>We may share your information with:</p>

              <h3>4.1 Distributors/Sellers</h3>
              <p>Your order and delivery information is shared with the respective distributor/seller to facilitate order fulfillment. BuildAdda is not responsible for how distributors handle your information after it is shared.</p>

              <h3>4.2 Service Providers</h3>
              <p>
                We work with third-party service providers for payment processing (Online), cloud storage (Cloudinary, MongoDB), and communication services. These providers are bound by their own privacy policies and data protection obligations.
              </p>

              <h3>4.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required by law, regulation, legal process, or governmental request, or in response to valid legal demands from competent authorities.
              </p>

              <h3>4.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, reorganisation, or sale of assets, your information may be transferred to the acquiring entity.
              </p>

              <h3>4.5 With Your Consent</h3>
              <p>
                We may share your information in any other circumstances where we have your explicit consent.
              </p>
            </section>

            <section>
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul>
                <li>Encryption of data in transit (HTTPS/SSL)</li>
                <li>Secure password storage (bcrypt hashing)</li>
                <li>HTTP-only cookies for authentication</li>
                <li>Regular security assessments</li>
                <li>Access controls limiting who can view personal information</li>
              </ul>
              <p>
                However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security and shall not be held liable for any breach resulting from circumstances beyond our reasonable control.
              </p>
            </section>

            <section>
              <h2>6. Your Rights</h2>
              <p>Subject to applicable Indian law, you have the right to:</p>
              <ul>
                <li>Access your personal information held by us</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your information (subject to legal retention requirements)</li>
                <li>Object to processing of your information for marketing purposes</li>
                <li>Withdraw consent for marketing communications at any time</li>
              </ul>
              <p>
                To exercise these rights, please contact us at info@buildadda.in. We will respond within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience. You can control cookie settings through your browser, but disabling cookies may limit certain functionalities of the Platform.
              </p>

              <h3>Types of Cookies We Use:</h3>
              <ul>
                <li><strong>Essential cookies:</strong> Required for authentication and core functionality</li>
                <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics cookies:</strong> Help us understand usage patterns and improve the Platform</li>
              </ul>
            </section>

            <section>
              <h2>8. Third-Party Links and Services</h2>
              <p>
                The Platform may contain links to third-party websites or services, including those of distributors and payment processors. We are not responsible for the privacy practices, content, or policies of these third-party sites. We strongly encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2>9. Children's Privacy</h2>
              <p>
                The Platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 18, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2>10. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including to satisfy legal, accounting, or reporting requirements. Transaction data may be retained for a minimum period as required under applicable Indian tax and commercial laws.
              </p>
            </section>

            <section>
              <h2>11. Disclaimer of Liability</h2>
              <p>
                BuildAdda, as an intermediary platform, is not responsible for any misuse of your personal information by distributors/sellers or other third parties with whom your information has been shared in the course of facilitating transactions. Users share information with distributors at their own risk.
              </p>
            </section>

            <section>
              <h2>12. Changes to Privacy Policy</h2>
              <p>
                We reserve the right to update or modify this Privacy Policy at any time without prior notice. Changes will be effective immediately upon posting on the Platform with an updated "Last Updated" date. Your continued use of the Platform after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2>13. Governing Law</h2>
              <p>
                This Privacy Policy is governed by the laws of India. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Gangapur City, Rajasthan, India.
              </p>
            </section>

            <section>
              <h2>14. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <ul>
                <li>Owner: Himmat Singh Rajawat</li>
                <li>Email: info@buildadda.in</li>
                <li>Phone: +91 6377845721</li>
                <li>Address: Saini Colony, mirzapur, Rajasthan, India - 322201</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
