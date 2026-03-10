import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqs = [
    {
      id: 1,
      category: 'Orders',
      question: 'How do I place an order?',
      answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to create an account or log in before completing your purchase.'
    },
    {
      id: 2,
      category: 'Orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 2 hours of placement. After that, orders enter processing and cannot be changed. Please contact us immediately if you need to make changes.'
    },
    {
      id: 3,
      category: 'Orders',
      question: 'How do I track my order?',
      answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order by logging into your account and visiting the Order History section.'
    },
    {
      id: 4,
      category: 'Customization',
      question: 'How does the customization process work?',
      answer: 'After placing your order, our design team will review your requirements and send a digital proof within 24-48 hours. Production begins after you approve the design.'
    },
    {
      id: 5,
      category: 'Customization',
      question: 'How long does engraving take?',
      answer: 'Standard engraving takes 2-3 business days. Complex designs or bulk orders may take 4-5 business days. We\'ll provide an estimated timeline after order confirmation.'
    },
    {
      id: 6,
      category: 'Customization',
      question: 'Can I see a preview before production?',
      answer: 'Yes! For all customized items, we provide a digital proof for your approval before starting production.'
    },
    {
      id: 7,
      category: 'Shipping',
      question: 'How much does shipping cost?',
      answer: 'Shipping is free on orders above ₹5000 within India. For orders below ₹5000, standard shipping costs ₹100. International shipping rates vary by location.'
    },
    {
      id: 8,
      category: 'Shipping',
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination. Please note that international customers are responsible for customs duties and taxes.'
    },
    {
      id: 9,
      category: 'Shipping',
      question: 'How long does delivery take?',
      answer: 'Domestic delivery takes 5-7 business days for standard shipping, 2-3 days for express. International delivery takes 7-14 business days depending on the destination.'
    },
    {
      id: 10,
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We offer 30-day returns for non-customized items in original condition. Customized items cannot be returned unless defective. Please see our Returns Policy page for details.'
    },
    {
      id: 11,
      category: 'Returns',
      question: 'How do I initiate a return?',
      answer: 'Log into your account, go to Order History, select the item you wish to return, and follow the return instructions. Our team will guide you through the process.'
    },
    {
      id: 12,
      category: 'Returns',
      question: 'When will I get my refund?',
      answer: 'Refunds are processed within 7-10 business days after we receive and inspect the returned item. The time for the refund to appear in your account depends on your payment method.'
    },
    {
      id: 13,
      category: 'Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery for eligible orders. All payments are secure and encrypted.'
    },
    {
      id: 14,
      category: 'Payment',
      question: 'Is it safe to use my credit card?',
      answer: 'Absolutely. We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.'
    },
    {
      id: 15,
      category: 'Corporate',
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We offer tiered discounts for bulk corporate orders. Please contact our corporate sales team at corporate@venus.com for a customized quote.'
    },
    {
      id: 16,
      category: 'Corporate',
      question: 'Can I request samples before bulk order?',
      answer: 'Yes, we offer sample orders for bulk corporate gifting. Contact our sales team for sample requests and bulk pricing.'
    }
  ];

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>FAQ - Venus Enterprises</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products, services, and policies
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="max-w-3xl mx-auto">
            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {categoryFaqs.map((faq) => (
                    <div key={faq.id} className="border-b border-gray-200 last:border-0">
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {openItems[faq.id] ? (
                          <FaChevronUp className="text-gray-500" />
                        ) : (
                          <FaChevronDown className="text-gray-500" />
                        )}
                      </button>
                      {openItems[faq.id] && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="text-center mt-12">
            <div className="bg-indigo-50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
              <p className="text-gray-700 mb-6">
                Can't find the answer you're looking for? Please contact our customer support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="btn-primary">
                  Contact Us
                </Link>
                <Link to="/helpdesk" className="btn-secondary">
                  Open Support Ticket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;