import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import adminApi from '../../api/adminApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaEye, FaReply, FaCheck, FaTimes } from 'react-icons/fa';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getTickets({ 
        page: pagination.page,
        status: statusFilter || undefined
      });
      setTickets(response.data);
      setPagination(prev => ({ ...prev, totalPages: response.pagination.pages }));
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await adminApi.updateTicketStatus(ticketId, newStatus);
      toast.success('Ticket status updated');
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      await adminApi.respondToTicket(ticketId, replyMessage);
      toast.success('Reply sent successfully');
      setReplyMessage('');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Support Ticket Management</h1>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination({ page: 1, totalPages: 1 });
          }}
          className="input-field w-48"
        >
          <option value="">All Tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {ticket.ticket_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.customer?.first_name} {ticket.customer?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{ticket.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(ticket.status)}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex justify-between items-center border-t">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Ticket #{selectedTicket.ticket_number}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Ticket Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">
                        {selectedTicket.customer?.first_name} {selectedTicket.customer?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedTicket.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject and Message */}
                <div>
                  <h3 className="font-semibold mb-2">Subject</h3>
                  <p className="text-gray-900">{selectedTicket.subject}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Message</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Responses */}
                {selectedTicket.TicketResponses?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Responses</h3>
                    <div className="space-y-3">
                      {selectedTicket.TicketResponses.map((response) => (
                        <div
                          key={response.id}
                          className={`p-3 rounded-lg ${
                            response.is_staff_response
                              ? 'bg-indigo-50 ml-8'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">
                              {response.User?.first_name} {response.User?.last_name}
                              {response.is_staff_response && ' (Staff)'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Reply to Ticket</h3>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows="4"
                      className="input-field mb-3"
                      placeholder="Type your response here..."
                    ></textarea>
                    <button
                      onClick={() => handleReply(selectedTicket.id)}
                      className="btn-primary"
                    >
                      Send Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;