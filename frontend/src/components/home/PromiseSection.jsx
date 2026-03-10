import React from 'react';
import { FaHandshake, FaLeaf, FaGem, FaBox } from 'react-icons/fa';

const promises = [
  {
    icon: FaHandshake,
    title: 'Artisan-Direct',
    description: 'We work directly with master craftspeople across India — no middlemen, fair pay always.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FaLeaf,
    title: 'Planet-Positive',
    description: 'Sustainable materials, natural dyes, seed-paper packaging. Our craft loves the Earth.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: FaGem,
    title: 'Truly Unique',
    description: 'Mass production? Never. Every item is individually made — slight variations are proof of its humanity.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FaBox,
    title: 'Delivered with Care',
    description: 'Double-boxed, padded, and packed with love so your craft arrives in perfect condition.',
    color: 'from-orange-500 to-red-500'
  }
];

const PromiseSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">The Venus Promise</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our commitment to quality, ethics, and authenticity
          </p>
        </div>

        {/* Promise Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promises.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${promise.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${promise.color} text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{promise.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{promise.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromiseSection;