import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import testimonialApi from '../../api/testimonialApi';
import LoadingSpinner from '../common/LoadingSpinner';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialApi.getTestimonials();
      setTestimonials(response.data || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      // Set empty array on error to prevent crash
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials.length) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What People Are Saying</h2>
            <p className="text-gray-600">Testimonials will appear here soon.</p>
          </div>
        </div>
      </section>
    );
  }

  const testimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What People Are Saying</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from our happy customers
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div className="w-full flex-shrink-0 px-4">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                {/* Quote Icon */}
                <FaQuoteLeft className="text-4xl text-indigo-200 mb-6" />

                {/* Rating */}
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>

                {/* Content */}
                <p className="text-xl text-gray-700 mb-8 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.customer_name?.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 text-lg">{testimonial.customer_name}</p>
                    <p className="text-gray-500">{testimonial.customer_location || 'Verified Customer'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-indigo-600"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-indigo-600"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-indigo-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;