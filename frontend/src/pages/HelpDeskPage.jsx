import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaQuestionCircle, FaTicketAlt, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

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
      const response = await axios.get(`${API_URL}/api/helpdesk/tickets`, {
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

      const response = await axios.post(
        `${API_URL}/api/helpdesk/tickets`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Ticket submitted successfully!');
        setFormData({ subject: '', category: 'General', message: '' });
        setActiveTab('tickets');
        fetchTickets();
      }

    } catch (error) {
      console.error(error);
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

          <h1 className="text-2xl font-medium text-[#8B5A2B] mb-6">
            Help Center
          </h1>

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

            {/* Main */}
            <div className="md:col-span-3">

              {activeTab === 'faq' && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">

                  <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">
                    Frequently Asked Questions
                  </h2>

                  <div className="space-y-4">

                    {faqs.map((faq, index) => (

                      <div key={index} className="border-b border-[#E8E0D5] pb-3 last:border-0">

                        <h3 className="text-sm font-medium text-[#8B5A2B] mb-1">
                          {faq.question}
                        </h3>

                        <p className="text-sm text-gray-600">
                          {faq.answer}
                        </p>

                      </div>

                    ))}

                  </div>

                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">

                  <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">
                    My Support Tickets
                  </h2>

                  {tickets.length === 0 ? (
                    <p className="text-sm text-gray-500">No tickets found.</p>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id} className="border border-[#E8E0D5] rounded-md p-4 mb-3">

                        <div className="flex justify-between">

                          <h3 className="text-sm font-medium text-[#8B5A2B]">
                            {ticket.subject}
                          </h3>

                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {ticket.status}
                          </span>

                        </div>

                        <p className="text-xs text-gray-500">
                          Ticket #{ticket.ticket_number}
                        </p>

                        <p className="text-sm text-gray-600">
                          {ticket.message}
                        </p>

                      </div>
                    ))
                  )}

                </div>
              )}

              {activeTab === 'new' && (
                <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">

                  <h2 className="text-lg font-medium text-[#8B5A2B] mb-4">
                    Create Support Ticket
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="input-field"
                    />

                    <textarea
                      placeholder="Message"
                      rows="4"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="input-field"
                    />

                    <button
                      type="submit"
                      className="btn-primary w-full"
                    >
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