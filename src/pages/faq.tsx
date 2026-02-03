import React, { useState } from 'react';
import SEO from '../components/SEO';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 1,
    category: 'General',
    question: 'What is BuildAdda?',
    answer: 'BuildAdda is a technology platform that connects verified distributors/sellers of construction materials and building supplies with customers. BuildAdda acts solely as an intermediary facilitator and does not itself sell, manufacture, store, or deliver any products.'
  },
  {
    id: 2,
    category: 'General',
    question: 'How do I create an account?',
    answer: 'Click on "Sign Up" in the header, fill in your details (name, email, phone, password), and click Register. You\'ll receive a verification email to activate your account.'
  },
  {
    id: 3,
    category: 'General',
    question: 'Is registration mandatory to browse products?',
    answer: 'No, you can browse products without registration. However, you need to create an account to place orders, add items to your cart or wishlist, and track your orders.'
  },

  // Orders & Shopping
  {
    id: 4,
    category: 'Orders',
    question: 'How do I place an order?',
    answer: 'Browse products, select the item you want, choose quantity, and click "Add to Cart". Review your cart, proceed to checkout, select delivery address, choose payment method, and confirm your order. Your order will be placed with the respective distributor/seller.'
  },
  {
    id: 5,
    category: 'Orders',
    question: 'Can I modify or cancel my order?',
    answer: 'You can cancel your order before it\'s shipped by the distributor from your order details page. Once shipped, cancellation is not possible. For any post-delivery issues, please contact the distributor/seller directly.'
  },
  {
    id: 6,
    category: 'Orders',
    question: 'How do I track my order?',
    answer: 'Go to "My Orders" in your profile, click on the order you want to track. You\'ll see the current status and tracking information provided by the distributor.'
  },
  {
    id: 7,
    category: 'Orders',
    question: 'What if I receive a damaged or incorrect product?',
    answer: 'Please contact the distributor/seller directly with photos of the product within 24 hours of delivery. All product quality, damage, and replacement issues are handled by the respective distributor/seller. BuildAdda is an intermediary platform and is not responsible for product quality or condition.'
  },

  // Payment
  {
    id: 8,
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We support Cash on Delivery (COD) and online payments (Credit/Debit Cards, UPI, Net Banking, Digital Wallets) processed securely through Online payment gateway. Payment availability may vary by distributor.'
  },
  {
    id: 9,
    category: 'Payment',
    question: 'Is it safe to make online payments on BuildAdda?',
    answer: 'Yes. Online payments are processed through Online secure payment gateway with industry-standard encryption. BuildAdda does not store your card details, bank account numbers, or UPI PINs on its servers.'
  },
  {
    id: 10,
    category: 'Payment',
    question: 'Are there any additional charges?',
    answer: 'Delivery charges may apply based on your location and the distributor\'s policies. There are no hidden charges from BuildAdda — all costs are shown clearly before you confirm your order. Product pricing and delivery charges are set by the distributor/seller.'
  },
  {
    id: 11,
    category: 'Payment',
    question: 'Can I get an invoice for my order?',
    answer: 'Invoices are generated based on order details. You can view your order information from the order details page. For GST invoices, please contact the distributor/seller directly as they are the selling party.'
  },

  // Delivery & Shipping
  {
    id: 12,
    category: 'Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery timelines are determined by the respective distributor/seller and typically range from 3-10 business days depending on your location and product availability. BuildAdda does not control or guarantee delivery timelines.'
  },
  {
    id: 13,
    category: 'Delivery',
    question: 'Do you deliver to my area?',
    answer: 'Delivery areas depend on the distributor/seller. During checkout, you can check if the distributor delivers to your location. BuildAdda does not directly handle logistics or delivery.'
  },
  {
    id: 14,
    category: 'Delivery',
    question: 'Can I change my delivery address?',
    answer: 'You may request a delivery address change before the order is shipped. Contact the distributor or use the order details page. Address changes after shipment are subject to the distributor\'s policies.'
  },
  {
    id: 15,
    category: 'Delivery',
    question: 'What if I\'m not available during delivery?',
    answer: 'Delivery attempts and rescheduling are managed by the distributor/seller or their logistics partner. Please provide a reliable contact number to coordinate delivery.'
  },

  // Returns & Refunds
  {
    id: 16,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'BuildAdda is an intermediary platform. All return policies are determined by the respective distributor/seller. Generally, products may be eligible for return within 7 days of delivery if unused and in original packaging. Please contact the distributor directly for their specific return terms. See our Returns & Refunds Policy page for full details.'
  },
  {
    id: 17,
    category: 'Returns',
    question: 'How do I return a product?',
    answer: 'Contact the distributor/seller directly to initiate a return. Provide your order number and reason for return. The distributor will handle the return process including pickup arrangements, if applicable.'
  },
  {
    id: 18,
    category: 'Returns',
    question: 'When will I get my refund?',
    answer: 'For cancelled online orders (pre-shipment), an automated refund may be initiated through Online, typically taking 5-10 business days. For product returns, refund processing is handled by the distributor/seller. BuildAdda does not guarantee refund timelines or amounts — these are the distributor\'s responsibility.'
  },
  {
    id: 19,
    category: 'Returns',
    question: 'Are there any products that cannot be returned?',
    answer: 'Return eligibility is determined by each distributor/seller. Generally, customized products, used/installed items, opened cement bags, cut materials, and clearance items may not be returnable. Check with the distributor before purchasing.'
  },

  // Distributors
  {
    id: 20,
    category: 'Distributors',
    question: 'How can I become a distributor?',
    answer: 'Register as a distributor during sign-up by selecting "Distributor" as your role. Provide your business details, GST number, and subscribe to a plan. Your account will be reviewed and activated upon subscription.'
  },
  {
    id: 21,
    category: 'Distributors',
    question: 'What are the requirements to sell on BuildAdda?',
    answer: 'You need a valid business registration, GST number, and an active subscription plan. Distributors are solely responsible for product quality, accurate listings, order fulfillment, delivery, and customer service.'
  },
  {
    id: 22,
    category: 'Distributors',
    question: 'What commission does BuildAdda charge?',
    answer: 'BuildAdda operates on a subscription model for distributors. Contact our support team for detailed information about subscription plans and fees.'
  },

  // Account & Security
  {
    id: 23,
    category: 'Account',
    question: 'I forgot my password. What should I do?',
    answer: 'Click "Forgot Password" on the login page, enter your registered email, and you\'ll receive a password reset link. Follow the link to set a new password.'
  },
  {
    id: 24,
    category: 'Account',
    question: 'How do I change my password?',
    answer: 'Go to your Profile page, click "Edit Profile", enter your current password and new password, then save changes.'
  },
  {
    id: 25,
    category: 'Account',
    question: 'Can I have multiple delivery addresses?',
    answer: 'Yes, you can save multiple delivery addresses in your account. You can set one as default or choose a different address during checkout.'
  },
  {
    id: 26,
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'Contact our support team with your request to delete your account. Please note this action is irreversible and all your data will be permanently deleted.'
  }
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(faqData.map(faq => faq.category)))];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <>
      <SEO
        title="FAQ - BuildAdda | Frequently Asked Questions About Building Materials"
        description="Find answers to common questions about BuildAdda - orders, delivery, payments, returns, refunds & more. Learn how to buy building materials online, track orders, and become a distributor."
        keywords="BuildAdda FAQ, building materials questions, how to order construction materials, BuildAdda delivery, BuildAdda returns, BuildAdda payment methods, become a distributor"
        canonicalUrl="https://www.buildadda.in/faq"
        jsonLd={faqJsonLd}
      />

      <Header />

      <div className="info-page">
        <div className="faq-container">
          <h1>Frequently Asked Questions</h1>
          <p className="subtitle">Find answers to common questions about BuildAdda</p>

          <div className="faq-search">
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="faq-categories">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="faq-list">
            {filteredFAQs.length === 0 ? (
              <div className="no-results">
                <p>No FAQs found matching your search.</p>
              </div>
            ) : (
              filteredFAQs.map(faq => (
                <div key={faq.id} className={`faq-item ${openFAQ === faq.id ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => toggleFAQ(faq.id)}>
                    <span className="category-badge">{faq.category}</span>
                    <span className="question-text">{faq.question}</span>
                    <span className="toggle-icon">{openFAQ === faq.id ? '−' : '+'}</span>
                  </button>
                  {openFAQ === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="faq-cta">
            <h2>Still have questions?</h2>
            <p>Can't find the answer you're looking for? Our support team is here to help.</p>
            <a href="/contact" className="btn-primary">Contact Support</a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default FAQPage;
