require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and parsing middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.log('Database connection error:', err));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Endpoint: Get all categories
// Naya MongoDB approach
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Yahan aapka Model use hoga
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MongoDB se data fetch karne ka naya code
app.get('/api/categories', async (req, res) => {
    try {
        // Yahan 'Category' aapka Mongoose model hona chahiye
        const categories = await Category.find(); 
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Database error fetching categories' });
    }
});
// API Endpoint: Submit seller application
// app.post('/api/sellers', async (req, res) => {
//   try {
//     const { name, email, brandName, category, description } = req.body;
//     if (!name || !email || !brandName || !category) {
//       return res.status(400).json({ error: 'Please provide all required fields' });
//     }
//     const [result] = await pool.query(
//       'INSERT INTO seller_applications (name, email, brand_name, category, description) VALUES (?, ?, ?, ?, ?)',
//       [name, email, brandName, category, description || null]
//     );
//     res.status(201).json({ success: true, sellerId: result.insertId });
//   } catch (err) {
//     console.error('Error saving seller application:', err);
//     res.status(500).json({ error: 'Database error saving seller application' });
//   }
// });
// API Endpoint: Submit seller application (With Back-end Validations)
app.post('/api/sellers', async (req, res) => {
  try {
    const { name, email, brandName, category, description } = req.body;
    
    if (!name || !email || !brandName || !category) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Backend Validation: Reject if name contains numbers or special characters like minus (-)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ error: 'Name validation failed. No special characters or numbers allowed.' });
    }

    const [result] = await pool.query(
      'INSERT INTO seller_applications (name, email, brand_name, category, description) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), brandName.trim(), category, description || null]
    );
    res.status(201).json({ success: true, sellerId: result.insertId });
  } catch (err) {
    console.error('Error saving seller application:', err);
    res.status(500).json({ error: 'Database error saving seller application' });
  }
});
// API Endpoint: Submit contact message
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const query = 'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)';
    pool.query(query, [name, email, subject, message], (err, result) => {
        if (err) {
            console.error('Error saving contact message:', err);
            return res.status(500).json({ error: 'Database error saving contact message' });
        }
        res.status(201).json({ success: true, message: 'Message sent successfully!', submissionId: result.insertId });
    });
});

// API Endpoint: Checkout order
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { total_price, items } = req.body;
    if (!total_price || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order structure or empty items' });
    }

    await connection.beginTransaction();

    // 1. Insert order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (total_price) VALUES (?)',
      [total_price]
    );
    const orderId = orderResult.insertId;

    // 2. Insert order items
    for (const item of items) {
      if (!item.product_id || !item.qty || !item.price) {
        throw new Error('Invalid item parameters');
      }
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.qty, item.price]
      );
    }

    await connection.commit();
    console.log(`Order #${orderId} successfully saved to MySQL database.`);
    res.status(201).json({ success: true, orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Transaction rollback. Error placing order:', err);
    res.status(500).json({ error: 'Database error placing order' });
  } finally {
    connection.release();
  }
});

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`Gardenology server is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
  console.log(`===================================================`);
});