// Check the actual file names in your folder and use EXACT matches
const User = require('./user'); // or './User' depending on actual file name
const Product = require('./Product'); // or './Product'
const Testimonial = require('./testimonial'); // or './Testimonial'
const Cart = require('./Cart'); // or './Cart'
const CartItem = require('./CartItem'); // or './CartItem'
const Order = require('./Order'); // or './Order'
const OrderItem = require('./OrderItem'); // or './OrderItem'
const Wishlist = require('./Wishlist'); // or './Wishlist'
const HelpdeskTicket = require('./HelpdeskTicket'); // or './HelpdeskTicket'
const TicketResponse = require('./TicketResponse'); // or './TicketResponse'
const FAQ = require('./FAQ'); // or './FAQ'
const CustomizationOption = require('./CustomizationOption'); // or './CustomizationOption'
const ProductFeature = require('./ProductFeature'); // or './ProductFeature'
const ProductImage = require('./productImage'); // or './ProductImage'

module.exports = {
  User,
  Product,
  Testimonial,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Wishlist,
  HelpdeskTicket,
  TicketResponse,
  FAQ,
  CustomizationOption,
  ProductFeature,
  ProductImage
};