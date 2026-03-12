const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const helpdeskRoutes = require("./routes/helpdeskRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();


// ---------------------
// CORS (ALLOW EVERYTHING)
// ---------------------

app.use(cors());
app.options("*", cors());


// ---------------------
// SECURITY + MIDDLEWARE
// ---------------------

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


// ---------------------
// RATE LIMITING
// ---------------------

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", limiter);


// ---------------------
// STATIC FILES
// ---------------------

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "../frontend/public/images")));


// ---------------------
// HEALTH CHECK
// ---------------------

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
  });
});


// ---------------------
// ROUTES
// ---------------------

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/helpdesk", helpdeskRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
// ---------------------
// 404 HANDLER
// ---------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


// ---------------------
// ERROR HANDLER
// ---------------------

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error"
  });
});

module.exports = app;