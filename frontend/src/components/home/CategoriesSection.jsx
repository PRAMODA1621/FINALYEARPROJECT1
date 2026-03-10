import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTree, 
  FaGem, 
  FaCogs, 
  FaCube,
  FaGift 
} from 'react-icons/fa';

const categories = [
  { 
    name: 'Wooden', 
    icon: FaTree, 
    color: 'bg-amber-600', 
    gradient: 'from-amber-500 to-amber-700',
    count: 45, 
    slug: 'Wooden',
    description: 'Handcrafted wooden gifts'
  },
  { 
    name: 'Acrylic', 
    icon: FaCube, 
    color: 'bg-blue-500', 
    gradient: 'from-blue-500 to-blue-700',
    count: 38, 
    slug: 'Acrylic',
    description: 'Modern acrylic designs'
  },
  { 
    name: 'Metal', 
    icon: FaCogs, 
    color: 'bg-gray-600', 
    gradient: 'from-gray-600 to-gray-800',
    count: 52, 
    slug: 'Metal',
    description: 'Premium metal gifts'
  },
  { 
    name: 'Crystal', 
    icon: FaGem, 
    color: 'bg-purple-500', 
    gradient: 'from-purple-500 to-purple-700',
    count: 29, 
    slug: 'Crystal',
    description: 'Elegant crystal awards'
  },
  { 
    name: 'Corporate Gifts', 
    icon: FaGift, 
    color: 'bg-indigo-600', 
    gradient: 'from-indigo-600 to-indigo-800',
    count: 64, 
    slug: 'Corporate Gifts',
    description: 'Complete gift solutions'
  }
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our premium collection of corporate gifts
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${category.color} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300 mb-3">
                    {category.description}
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 group-hover:text-white transition-colors duration-300">
                    {category.count} Products
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;