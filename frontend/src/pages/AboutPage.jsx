import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaGem, FaTrophy, FaHandshake, FaLeaf } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Venus Enterprises</title>
      </Helmet>

      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-20">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Venus Enterprises</h1>
            <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
              India's premier destination for premium corporate gifts, awards, and customized mementos.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Founded in 2010, Venus Enterprises has grown to become a trusted name in corporate gifting across India. 
                  What started as a small workshop in Mumbai has evolved into a comprehensive gifting solution for 
                  businesses of all sizes.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We believe that every gift tells a story. Whether it's a crystal award for a retiring employee, 
                  an engraved name plate for a new executive, or a customized gift set for a valued client, 
                  we ensure that each piece reflects the excellence and appreciation it represents.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Today, we serve over 1,000 corporate clients across India and internationally, 
                  helping them celebrate achievements, recognize excellence, and strengthen relationships.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <FaTrophy className="text-4xl text-indigo-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <FaGem className="text-4xl text-indigo-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Corporate Clients</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <FaHandshake className="text-4xl text-indigo-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Artisan Partners</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <FaLeaf className="text-4xl text-indigo-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Eco-Friendly</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Quality First</h3>
                <p className="text-gray-600">
                  We never compromise on quality. Every product undergoes rigorous quality checks before delivery.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Client Partnership</h3>
                <p className="text-gray-600">
                  We work closely with our clients to understand their needs and deliver personalized solutions.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Sustainable Practices</h3>
                <p className="text-gray-600">
                  We're committed to eco-friendly materials and sustainable manufacturing processes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;