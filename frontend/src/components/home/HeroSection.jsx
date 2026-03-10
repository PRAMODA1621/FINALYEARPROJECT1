import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-[#8B5A2B] text-white py-16">
      <div className="container-custom">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-medium mb-4">
            Premium Corporate Gifts & Awards
          </h1>
          <p className="text-lg text-[#F5F0E8] mb-8">
            Discover our exclusive collection of handcrafted corporate gifts, 
            mementos, and awards for your business needs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/products" 
              className="bg-[#9CAF88] text-white px-6 py-3 rounded-md hover:bg-white hover:text-[#8B5A2B] transition-colors"
            >
              Shop Collection
            </Link>
            <Link 
              to="/custom-order" 
              className="border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-[#8B5A2B] transition-colors"
            >
              Custom Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;