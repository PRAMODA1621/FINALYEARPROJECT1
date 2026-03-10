import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const TicketForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [charCount, setCharCount] = useState(0);

  const categories = [
    'Order Issue',
    'Product Question',
    'Shipping Problem',
    'Return Request',
    'Technical Support',
    'Billing Question',
    'Account Issue',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const onFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
      setCharCount(0);
      toast.success('Ticket created successfully');
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject *
        </label>
        <input
          type="text"
          id="subject"
          {...register('subject', { 
            required: 'Subject is required',
            minLength: { value: 5, message: 'Subject must be at least 5 characters' },
            maxLength: { value: 100, message: 'Subject cannot exceed 100 characters' }
          })}
          className="input-field"
          placeholder="Brief description of your issue"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            {...register('category', { required: 'Category is required' })}
            className="input-field"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <select
            id="priority"
            {...register('priority', { required: 'Priority is required' })}
            className="input-field"
          >
            <option value="">Select priority</option>
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          rows="6"
          {...register('message', { 
            required: 'Message is required',
            minLength: { value: 20, message: 'Message must be at least 20 characters' },
            maxLength: { value: 2000, message: 'Message cannot exceed 2000 characters' }
          })}
          className="input-field"
          placeholder="Please provide detailed information about your issue..."
          onChange={(e) => setCharCount(e.target.value.length)}
        ></textarea>
        <div className="flex justify-between mt-1">
          {errors.message ? (
            <p className="text-sm text-red-600">{errors.message.message}</p>
          ) : (
            <p className="text-sm text-gray-500">Minimum 20 characters</p>
          )}
          <p className="text-sm text-gray-500">{charCount}/2000</p>
        </div>
      </div>

      {/* Optional: Order Number */}
      <div>
        <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Order Number (if applicable)
        </label>
        <input
          type="text"
          id="orderNumber"
          {...register('orderNumber')}
          className="input-field"
          placeholder="e.g., ORD-12345678"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Ticket...' : 'Submit Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;