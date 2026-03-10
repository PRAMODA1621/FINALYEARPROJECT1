import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaQuestionCircle, FaTicketAlt, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const HelpdeskPage = () => {
  const { isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'General',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the Order History section.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer 30-day returns for unused items in original packaging. Customized items cannot be returned.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. Shipping costs vary by location.'
    },
    {
      question: 'How long does customization take?',
      answer: 'Standard customization takes 3-5 business days. You will receive a digital proof for approval.'
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach us at support@venusenterprises.com or +91 98765 43210.'
    }
  ];

  useEffect(() => {
    if (isAuthenticated && activeTab === 'tickets') {
      fetchTickets();
    }
  }, [isAuthenticated, activeTab]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/helpdesk/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/helpdesk/tickets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Ticket submitted successfully!');
        setFormData({ subject: '', category: 'General', message: '' });
        setActiveTab('tickets');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to submit ticket');
    }
  };

  return (
    <>
      <Helmet>
        <title>Helpdesk - Venus Enterprises</title>
      </Helmet>

      <div className="bg-[#F5F0E8] min-h-screen py-8">
        <div className="container-custom">
          <h1 className="text-2xl font-medium text-[#8B5A2B] mb-6">Help Center</h1>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'faq' 
                        ? 'bg-[#8B5A2B] text-white' 
                        : 'hover:bg-[#F5F0E8] text-[#8B5A2B]'
                    }`}
                  >
                    <FaQuestionCircle className="inline mr-2" />
                    FAQs
                  </button>
                  
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={() => setActiveTab('tickets')}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'tickets' 
                            ? 'bg-[#8B5A2B] text-white' 
                            : 'hover:bg-[#F5F0E8] text-[#8B5A2B]'
                        }`}
                      >
                        <FaTicketAlt className="inline mr-2" />
                        My Tickets
                      </button>
                      <button
                        onClick={() => setActiveTab('new')}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${
                          activeTab === 'new' 
                            ? 'bg-[#8B5A2B] text-white' 
                            : 'hover:bg-[#F5F0E8] text-[#8B5A2B]'
                        }`}
                      >
                        <FaPlus className="inline mr-2" />
                        New Ticket
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {activeTab === 'faq' && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">
                  <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-[#E8E0D5] pb-3 last:border-0">
                        <h3 className="text-sm font-medium text-[#8B5A2B] mb-1">{faq.question}</h3>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && isAuthenticated && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">
                  <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">My Support Tickets</h2>
                  {tickets.length > 0 ? (
                    <div className="space-y-3">
                      {tickets.map(ticket => (
                        <div key={ticket.id} className="border border-[#E8E0D5] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-medium text-[#8B5A2B]">{ticket.subject}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Ticket #{ticket.ticket_number}</p>
                          <p className="text-sm text-gray-600">{ticket.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No tickets found.</p>
                  )}
                </div>
              )}

              {activeTab === 'new' && isAuthenticated && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">
                  <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">Create Support Ticket</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#8B5A2B] mb-1">Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#8B5A2B] mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="input-field"
                      >
                        <option>General</option>
                        <option>Order Issue</option>
                        <option>Product Question</option>
                        <option>Shipping Problem</option>
                        <option>Return Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#8B5A2B] mb-1">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        rows="4"
                        className="input-field"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full">
                      Submit Ticket
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpdeskPage;