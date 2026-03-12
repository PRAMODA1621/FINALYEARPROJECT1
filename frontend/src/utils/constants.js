export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finalyearproject1-pvex.onrender.com/api';
export const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8000/api';
export const RECOMMENDATION_URL = import.meta.env.VITE_RECOMMENDATION_URL || 'http://localhost:8001/api';

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI Payment' },
  { value: 'cod', label: 'Cash on Delivery' }
];

export const ORDER_STATUS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export const PAYMENT_STATUS = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded'
};

export const TICKET_STATUS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

export const TICKET_PRIORITY = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const USER_ROLES = {
  user: 'User',
  admin: 'Admin'
};

export const PRODUCT_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price', label: 'Price' },
  { value: 'name', label: 'Name' }
];

export const PRODUCT_LIMITS = [12, 24, 48, 96];

export const DEFAULT_PAGE_SIZE = 12;

export const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const ZIP_REGEX = /^\d{5}(-\d{4})?$/;