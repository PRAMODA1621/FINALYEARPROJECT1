import React from 'react';
import ProductCard from './ProductCard';
import { FaExclamationTriangle } from 'react-icons/fa';

const ProductList = ({ products }) => {
  console.log('📦 ProductList received:', products?.length || 0, 'products');
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#F5F5F0] rounded-full mb-4">
          <FaExclamationTriangle className="w-8 h-8 text-[#9CAF88]" />
        </div>
        <h3 className="text-xl font-semibold text-[#8B5A2B] mb-2">No Products Found</h3>
        <p className="text-[#9CAF88] mb-6">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id || product.name} product={product} />
      ))}
    </div>
  );
};

export default ProductList;