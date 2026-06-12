require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.log('Database connection error:', err));

// Simple Test Route
app.get('/', (req, res) => {
    res.send('Gardenology Server is Running with MongoDB!');
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));