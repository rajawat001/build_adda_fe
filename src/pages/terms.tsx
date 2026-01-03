import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsAndConditions() {
  return (
    <>
      <SEO
        title="Terms and Conditions"
        description="Terms and Conditions for using BuildAdda platform"
      />
      <Header />

      <div className="legal-page">
        <div className="legal-container">
          <h1>Terms and Conditions</h1>
          <p className="last-updated">Last Updated: December 31, 2025</p>

          <div className="legal-content">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using BuildAdda ("the Platform"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2>2. Use of Service</h2>
              <h3>2.1 Eligibility</h3>
              <p>
                You must be at least 18 years old to use this Platform. By using BuildAdda, you represent that you meet this requirement.
              </p>

              <h3>2.2 Account Registration</h3>
              <p>
                To access certain features, you must create an account with accurate information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h3>2.3 Prohibited Activities</h3>
              <ul>
                <li>Providing false or misleading information</li>
                <li>Impersonating another person or entity</li>
                <li>Interfering with the Platform's operation</li>
                <li>Uploading harmful code or content</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2>3. Products and Orders</h2>
              <h3>3.1 Product Information</h3>
              <p>
                We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is error-free.
              </p>

              <h3>3.2 Pricing</h3>
              <p>
                All prices are listed in Indian Rupees (INR) and include applicable taxes. Prices are subject to change without notice.
              </p>

              <h3>3.3 Order Acceptance</h3>
              <p>
                We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing or product information, or suspected fraudulent activity.
              </p>

              <h3>3.4 Payment</h3>
              <p>
                Payment must be made at the time of order placement. We accept online payments via Razorpay and Cash on Delivery (COD) as payment methods.
              </p>
            </section>

            <section>
              <h2>4. Distributor Terms</h2>
              <h3>4.1 Distributor Registration</h3>
              <p>
                Distributors must provide valid business information and documents for verification. All distributor accounts are subject to approval.
              </p>

              <h3>4.2 Product Listings</h3>
              <p>
                Distributors are responsible for the accuracy of their product listings, including descriptions, pricing, and stock availability.
              </p>

              <h3>4.3 Commission</h3>
              <p>
                BuildAdda charges a commission on each sale. Commission rates are communicated during registration and may be updated with prior notice.
              </p>
            </section>

            <section>
              <h2>5. Intellectual Property</h2>
              <p>
                All content on BuildAdda, including text, graphics, logos, and software, is owned by BuildAdda or its licensors and is protected by copyright and trademark laws.
              </p>
            </section>

            <section>
              <h2>6. Limitation of Liability</h2>
              <p>
                BuildAdda shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or inability to use the Platform.
              </p>
            </section>

            <section>
              <h2>7. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless BuildAdda and its affiliates from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.
              </p>
            </section>

            <section>
              <h2>8. Governing Law</h2>
              <p>
                These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
              </p>
            </section>

            <section>
              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Platform constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2>10. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <ul>
                <li>Email: support@buildadda.com</li>
                <li>Phone: +91 6377845721</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
