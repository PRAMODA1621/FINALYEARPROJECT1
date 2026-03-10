const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { shippingAddress, phone, email, paymentMethod, notes, items: directItems } = req.body;

    // Validate required fields
    if (!shippingAddress || !phone || !email || !paymentMethod) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let orderItems = [];
    let subtotal = 0;

    if (directItems && directItems.length > 0) {
      // Buy Now flow
      for (const item of directItems) {
        const [products] = await connection.query('SELECT * FROM products WHERE name = ? AND (is_active = 1 OR is_active IS NULL)', [item.productName]);
        const product = products[0];
        
        if (!product) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ success: false, message: `Product not found: ${item.productName}` });
        }
        
        if (product.stock < item.quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
        }

        const itemTotal = item.quantity * parseFloat(product.price);
        subtotal += itemTotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: parseFloat(product.price),
          customization_data: null
        });

        await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, product.id]);
      }
    } else {
      // Cart checkout flow
      const [carts] = await connection.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
      if (carts.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      const [items] = await connection.query(
        `SELECT ci.*, p.name, p.stock FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = ?`,
        [carts[0].id]
      );

      if (items.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      for (const item of items) {
        if (item.stock < item.quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
        }

        const itemTotal = item.quantity * parseFloat(item.unit_price);
        subtotal += itemTotal;

        orderItems.push({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          customization_data: item.customization_data
        });

        await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      // Clear cart after successful order
      await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }

    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const [result] = await connection.query(
      `INSERT INTO orders (order_number, user_id, total_amount, subtotal, payment_method, shipping_address, phone, email, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, req.user.id, subtotal, subtotal, paymentMethod, shippingAddress, phone, email, notes || null]
    );

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, customization_data)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [result.insertId, item.product_id, item.product_name, item.quantity, item.unit_price,
         item.customization_data ? JSON.stringify(item.customization_data) : null]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      data: {
        orderId: result.insertId,
        orderNumber,
        total: subtotal
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  } finally {
    connection.release();
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    console.log('📋 Fetching orders for user:', req.user.id);
    
    const [orders] = await db.query(
      `SELECT o.*, 
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 
                     'quantity', oi.quantity, 'unit_price', oi.unit_price, 'customization_data', oi.customization_data)
        ) FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    console.log(`✅ Found ${orders.length} orders`);

    // Parse JSON strings and format for frontend with proper number parsing
    const formattedOrders = orders.map(order => {
      let items = [];
      if (order.items) {
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
          console.error('Error parsing order items:', e);
          items = [];
        }
      }
      
      return {
        id: order.id,
        order_number: order.order_number,
        total_amount: parseFloat(order.total_amount),
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        items: items
      };
    });

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    const order = orders[0];
    order.total_amount = parseFloat(order.total_amount);
    order.items = items.map(item => ({
      ...item,
      unit_price: parseFloat(item.unit_price)
    }));

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById };