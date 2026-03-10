import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#8B5A2B] text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">VENUS ENTERPRISES</h3>
            <p className="text-[#F5F0E8] mb-4">
              Premium corporate gifts, awards, and customized mementos for businesses that value excellence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-[#9CAF88]" />
                <a href="mailto:support@venusenterprises.com" className="text-[#F5F0E8] hover:text-white">
                  support@venusenterprises.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-[#9CAF88]" />
                <a href="tel:+919876543210" className="text-[#F5F0E8] hover:text-white">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-[#9CAF88]" />
                <span className="text-[#F5F0E8] text-sm">
                  No. 42, Industrial Layout, Peenya Industrial Area,<br />
                  Bengaluru, Karnataka 560058, India
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-[#F5F0E8] hover:text-white">Products</Link></li>
              <li><Link to="/about" className="text-[#F5F0E8] hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-[#F5F0E8] hover:text-white">Contact</Link></li>
              <li><Link to="/helpdesk" className="text-[#F5F0E8] hover:text-white">Help Center</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-[#F5F0E8] hover:text-white">FAQ</Link></li>
              <li><Link to="/shipping" className="text-[#F5F0E8] hover:text-white">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-[#F5F0E8] hover:text-white">Returns Policy</Link></li>
              <li><Link to="/privacy" className="text-[#F5F0E8] hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-[#F5F0E8] hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
            <ul className="space-y-2 text-[#F5F0E8]">
              <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
              <li>Saturday: 10:00 AM - 2:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
            <p className="mt-4 text-sm text-[#F5F0E8]">
              GST: 29ABCDE1234F1Z5
            </p>
          </div>
        </div>

        <div className="border-t border-[#9CAF88] mt-8 pt-8 text-center text-[#F5F0E8] text-sm">
          <p>&copy; {currentYear} Venus Enterprises. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;