const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send confirmation email
const sendOrderEmail = async (email, orderNumber, total) => {
  try {
    await transporter.sendMail({
      from: `"Venus Crafts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Order Confirmation - Venus Crafts",
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order has been placed successfully.</p>
        <p><b>Order Number:</b> ${orderNumber}</p>
        <p><b>Total Amount:</b> ₹${total}</p>
        <p>We will notify you once the order is shipped.</p>
      `
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
};


// CREATE ORDER
const createOrder = async (req, res) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    const { shippingAddress, phone, email, paymentMethod, notes, items: directItems } = req.body;

    if (!shippingAddress || !phone || !email || !paymentMethod) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success:false, message:"Missing required fields" });
    }

    let orderItems = [];
    let subtotal = 0;

    if (directItems && directItems.length > 0) {

      for (const item of directItems) {

        const [products] = await connection.query(
          "SELECT * FROM products WHERE name=? AND (is_active=1 OR is_active IS NULL)",
          [item.productName]
        );

        const product = products[0];

        if (!product) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ success:false, message:`Product not found: ${item.productName}` });
        }

        if (product.stock < item.quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ success:false, message:`Insufficient stock for ${product.name}` });
        }

        const itemTotal = item.quantity * parseFloat(product.price);
        subtotal += itemTotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: parseFloat(product.price)
        });

        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id=?",
          [item.quantity, product.id]
        );
      }

    } else {

      const [carts] = await connection.query(
        "SELECT id FROM cart WHERE user_id=?",
        [req.user.id]
      );

      if (carts.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ success:false, message:"Cart not found" });
      }

      const [items] = await connection.query(
        `SELECT ci.*, p.name, p.stock
         FROM cart_items ci
         JOIN products p ON ci.product_id=p.id
         WHERE ci.cart_id=?`,
        [carts[0].id]
      );

      if (items.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success:false, message:"Cart is empty" });
      }

      for (const item of items) {

        if (item.stock < item.quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ success:false, message:`Insufficient stock for ${item.name}` });
        }

        const itemTotal = item.quantity * parseFloat(item.unit_price);
        subtotal += itemTotal;

        orderItems.push({
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price)
        });

        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id=?",
          [item.quantity, item.product_id]
        );
      }

      await connection.query(
        "DELETE FROM cart_items WHERE cart_id=?",
        [carts[0].id]
      );
    }

    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0,6)}`;

    const [result] = await connection.query(
      `INSERT INTO orders
      (order_number,user_id,total_amount,subtotal,payment_method,shipping_address,phone,email,notes)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        orderNumber,
        req.user.id,
        subtotal,
        subtotal,
        paymentMethod,
        shippingAddress,
        phone,
        email,
        notes || null
      ]
    );

    for (const item of orderItems) {

      await connection.query(
        `INSERT INTO order_items
        (order_id,product_id,product_name,quantity,unit_price)
        VALUES (?,?,?,?,?)`,
        [
          result.insertId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price
        ]
      );
    }

   await connection.commit();

res.status(201).json({
  success:true,
  data:{
    orderId:result.insertId,
    orderNumber,
    total:subtotal
  }
});

// SEND EMAIL IN BACKGROUND
sendOrderEmail(email, orderNumber, subtotal).catch(console.error);

  } catch (error) {

    await connection.rollback();
    console.error("Create order error:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  } finally {
    connection.release();
  }
};



// GET USER ORDERS
const getUserOrders = async (req,res) => {

  try {

    const [orders] = await db.query(
      `SELECT *
       FROM orders
       WHERE user_id=?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success:true,
      data:orders
    });

  } catch(error) {

    console.error("Get orders error:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
};



// GET ALL ORDERS (ADMIN DASHBOARD)
const getAllOrders = async (req,res) => {

  try {

    const [orders] = await db.query(
      `SELECT o.*,u.first_name,u.last_name
       FROM orders o
       JOIN users u ON o.user_id=u.id
       ORDER BY o.created_at DESC`
    );

    res.json({
      success:true,
      data:orders
    });

  } catch(error) {

    console.error("Admin orders error:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
};



// GET SINGLE ORDER
const getOrderById = async (req,res) => {

  try {

    const [orders] = await db.query(
      `SELECT * FROM orders WHERE id=?`,
      [req.params.id]
    );

    if (orders.length===0) {
      return res.status(404).json({
        success:false,
        message:"Order not found"
      });
    }

    res.json({
      success:true,
      data:orders[0]
    });

  } catch(error) {

    console.error("Get order error:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
};


module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders
};