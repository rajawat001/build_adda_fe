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
    answer: 'BuildAdda is an e-commerce platform specializing in construction materials and building supplies. We connect verified distributors with customers, offering a wide range of quality products at competitive prices.'
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
    answer: 'Browse products, select the item you want, choose quantity, and click "Add to Cart". Review your cart, proceed to checkout, select delivery address, choose payment method, and confirm your order.'
  },
  {
    id: 5,
    category: 'Orders',
    question: 'Can I modify or cancel my order?',
    answer: 'Yes, you can cancel your order before it\'s shipped from your order details page. Once shipped, cancellation is not possible, but you can initiate a return after delivery.'
  },
  {
    id: 6,
    category: 'Orders',
    question: 'How do I track my order?',
    answer: 'Go to "My Orders" in your profile, click on the order you want to track. You\'ll see the current status and tracking information if the order has been shipped.'
  },
  {
    id: 7,
    category: 'Orders',
    question: 'What if I receive a damaged or incorrect product?',
    answer: 'Contact our customer support immediately with photos of the product. We\'ll arrange for a replacement or refund within 7 days of delivery.'
  },

  // Payment
  {
    id: 8,
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery (COD), Credit/Debit Cards, UPI, Net Banking, and Digital Wallets through Razorpay\'s secure payment gateway.'
  },
  {
    id: 9,
    category: 'Payment',
    question: 'Is it safe to use my card on BuildAdda?',
    answer: 'Yes, absolutely. We use Razorpay\'s secure payment gateway with SSL encryption. We never store your card details on our servers.'
  },
  {
    id: 10,
    category: 'Payment',
    question: 'Are there any additional charges?',
    answer: 'Delivery charges may apply based on your location and order value. There are no hidden charges - all costs are shown clearly before you confirm your order.'
  },
  {
    id: 11,
    category: 'Payment',
    question: 'Can I get an invoice for my order?',
    answer: 'Yes, a GST invoice is automatically generated for every order. You can download it from your order details page after the order is confirmed.'
  },

  // Delivery & Shipping
  {
    id: 12,
    category: 'Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery typically takes 5-7 business days depending on your location. For bulk orders, delivery time may vary. You\'ll receive estimated delivery dates during checkout.'
  },
  {
    id: 13,
    category: 'Delivery',
    question: 'Do you deliver to my area?',
    answer: 'We deliver to most locations across India. Enter your pincode during checkout to check if we deliver to your area.'
  },
  {
    id: 14,
    category: 'Delivery',
    question: 'Can I change my delivery address?',
    answer: 'You can change the delivery address before the order is shipped. Contact customer support or modify it from your order details page.'
  },
  {
    id: 15,
    category: 'Delivery',
    question: 'What if I\'m not available during delivery?',
    answer: 'Our delivery partner will attempt delivery 2-3 times. If unsuccessful, the order will be returned. Please provide a reliable contact number and address.'
  },

  // Returns & Refunds
  {
    id: 16,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for most products. Items must be unused, in original packaging with tags intact. See our Returns Policy page for complete details.'
  },
  {
    id: 17,
    category: 'Returns',
    question: 'How do I return a product?',
    answer: 'Go to your order details, click "Return Order", select items to return, choose return reason, and submit. Our team will arrange pickup within 2-3 business days.'
  },
  {
    id: 18,
    category: 'Returns',
    question: 'When will I get my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned product. The amount will be credited to your original payment method.'
  },
  {
    id: 19,
    category: 'Returns',
    question: 'Are there any products that cannot be returned?',
    answer: 'Yes, customized products, bulk orders, and certain categories like electrical items may not be eligible for return. Check product details before purchasing.'
  },

  // Distributors
  {
    id: 20,
    category: 'Distributors',
    question: 'How can I become a distributor?',
    answer: 'Register as a distributor during sign-up by selecting "Distributor" as your role. Provide your business details, GST number, and wait for admin approval (typically 1-2 business days).'
  },
  {
    id: 21,
    category: 'Distributors',
    question: 'What are the requirements to sell on BuildAdda?',
    answer: 'You need a valid business registration, GST number, quality certifications for products, and ability to maintain inventory and timely deliveries.'
  },
  {
    id: 22,
    category: 'Distributors',
    question: 'What commission does BuildAdda charge?',
    answer: 'Our commission structure varies by product category. Contact our distributor support team for detailed information about fees and commissions.'
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
    answer: 'Contact our customer support team with your request to delete your account. Please note this action is irreversible and all your data will be permanently deleted.'
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
            <p>Can't find the answer you're looking for? Our customer support team is here to help.</p>
            <a href="/contact" className="btn-primary">Contact Support</a>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default FAQPage;
