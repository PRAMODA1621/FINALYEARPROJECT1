import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQList = ({ faqs }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!faqs || Object.keys(faqs).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No FAQs available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(faqs).map(([category, categoryFaqs]) => (
        <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
          </div>
          
          <div className="divide-y">
            {categoryFaqs.map((faq) => (
              <div key={faq.id} className="px-6 py-4">
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openItems[faq.id] ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </button>
                
                {openItems[faq.id] && (
                  <div className="mt-4 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQList;