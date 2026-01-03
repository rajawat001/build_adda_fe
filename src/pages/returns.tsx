import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ReturnsRefunds() {
  return (
    <>
      <SEO
        title="Returns & Refunds Policy"
        description="Return and Refund Policy for BuildAdda"
      />
      <Header />

      <div className="legal-page">
        <div className="legal-container">
          <h1>Returns & Refunds Policy</h1>
          <p className="last-updated">Last Updated: December 31, 2025</p>

          <div className="legal-content">
            <section>
              <h2>1. Return Policy Overview</h2>
              <p>
                At BuildAdda, we want you to be completely satisfied with your purchase. If you're not satisfied, we accept returns within 7 days of delivery for most products, subject to the conditions below.
              </p>
            </section>

            <section>
              <h2>2. Eligibility for Returns</h2>

              <h3>2.1 Returnable Products</h3>
              <p>The following products are eligible for return:</p>
              <ul>
                <li>Defective or damaged products</li>
                <li>Products received in incorrect quantity</li>
                <li>Wrong product delivered</li>
                <li>Products with manufacturing defects</li>
              </ul>

              <h3>2.2 Non-Returnable Products</h3>
              <p>The following products cannot be returned:</p>
              <ul>
                <li>Products that have been used or installed</li>
                <li>Custom-made or specially ordered products</li>
                <li>Products without original packaging</li>
                <li>Cement bags that have been opened</li>
                <li>Cut or modified materials (tiles, pipes, etc.)</li>
                <li>Products purchased on clearance or final sale</li>
              </ul>

              <h3>2.3 Return Conditions</h3>
              <p>To be eligible for return, products must:</p>
              <ul>
                <li>Be in original condition and packaging</li>
                <li>Include all accessories and documents</li>
                <li>Have tags and labels intact</li>
                <li>Be returned within 7 days of delivery</li>
              </ul>
            </section>

            <section>
              <h2>3. Return Process</h2>

              <h3>Step 1: Initiate Return Request</h3>
              <ul>
                <li>Log in to your BuildAdda account</li>
                <li>Go to "My Orders" and select the order</li>
                <li>Click on "Request Return" and select reason</li>
                <li>Upload photos of damaged/defective products (if applicable)</li>
              </ul>

              <h3>Step 2: Return Approval</h3>
              <ul>
                <li>Our team will review your request within 24-48 hours</li>
                <li>You'll receive email confirmation once approved</li>
                <li>Return pickup will be scheduled</li>
              </ul>

              <h3>Step 3: Product Pickup</h3>
              <ul>
                <li>Our logistics partner will collect the product</li>
                <li>Ensure product is properly packaged</li>
                <li>Keep the return pickup receipt</li>
              </ul>

              <h3>Step 4: Quality Check</h3>
              <ul>
                <li>Returned product will be inspected</li>
                <li>Refund will be processed if product meets return criteria</li>
              </ul>
            </section>

            <section>
              <h2>4. Refund Policy</h2>

              <h3>4.1 Refund Processing Time</h3>
              <ul>
                <li>Refunds are processed within 7-10 business days after receiving the returned product</li>
                <li>Actual credit to your account may take additional 3-5 business days depending on your bank</li>
              </ul>

              <h3>4.2 Refund Method</h3>
              <ul>
                <li><strong>Online Payment:</strong> Refund will be credited to the original payment method</li>
                <li><strong>Cash on Delivery:</strong> Refund will be issued via bank transfer (provide bank details)</li>
              </ul>

              <h3>4.3 Refund Amount</h3>
              <ul>
                <li>Full product price will be refunded</li>
                <li>Delivery charges are non-refundable (except in case of wrong/defective product)</li>
                <li>Return pickup is free for defective/wrong products</li>
                <li>For other returns, return shipping charges may be deducted</li>
              </ul>
            </section>

            <section>
              <h2>5. Exchange Policy</h2>
              <p>
                We currently do not offer direct product exchanges. If you wish to exchange a product:
              </p>
              <ol>
                <li>Return the original product following the return process</li>
                <li>Place a new order for the desired product</li>
                <li>Refund will be processed for the returned item</li>
              </ol>
            </section>

            <section>
              <h2>6. Cancellation Policy</h2>

              <h3>6.1 Before Shipment</h3>
              <p>
                You can cancel your order before it's shipped at no charge. The full amount will be refunded.
              </p>

              <h3>6.2 After Shipment</h3>
              <p>
                Once shipped, orders cannot be cancelled. You may reject delivery or initiate a return after delivery.
              </p>

              <h3>6.3 Cash on Delivery Orders</h3>
              <p>
                COD orders can be cancelled before shipment. Cancelled COD orders are not charged.
              </p>
            </section>

            <section>
              <h2>7. Damaged or Defective Products</h2>

              <h3>Inspection on Delivery</h3>
              <p>
                Please inspect products upon delivery. If you find any damage or defect:
              </p>
              <ul>
                <li>Take photos of the damaged product and packaging</li>
                <li>Report within 24 hours of delivery</li>
                <li>Contact customer support immediately</li>
                <li>Do not use or install the product</li>
              </ul>

              <h3>Resolution</h3>
              <p>For damaged/defective products, we will:</p>
              <ul>
                <li>Provide immediate replacement (subject to availability)</li>
                <li>Issue full refund including delivery charges</li>
                <li>Arrange free pickup of the damaged product</li>
              </ul>
            </section>

            <section>
              <h2>8. Partial Returns</h2>
              <p>
                If you received multiple items in one order, you can return individual items. The refund will be for the returned items only.
              </p>
            </section>

            <section>
              <h2>9. Restocking Fee</h2>
              <p>
                We do not charge restocking fees for eligible returns.
              </p>
            </section>

            <section>
              <h2>10. Contact for Returns</h2>
              <p>
                For return-related queries:
              </p>
              <ul>
                <li>Email: returns@buildadda.in</li>
                <li>Phone: +91 6377845721</li>
                <li>Support Hours: Monday-Saturday, 9 AM - 6 PM IST</li>
              </ul>
            </section>

            <section>
              <h2>11. Important Notes</h2>
              <ul>
                <li>Return requests must be initiated within 7 days of delivery</li>
                <li>Products must be unused and in original condition</li>
                <li>We reserve the right to reject returns that don't meet our policy</li>
                <li>This policy does not affect your statutory rights</li>
                <li>For bulk orders, special return terms may apply</li>
              </ul>
            </section>

            <section>
              <h2>12. Policy Updates</h2>
              <p>
                We reserve the right to modify this Returns & Refunds Policy at any time. Changes will be effective immediately upon posting on our website.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
