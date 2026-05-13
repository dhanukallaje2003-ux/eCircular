const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/circular', require('./routes/circularRoutes'));

// Model initializations after DB connection
const User = require('./models/User');
const Circular = require('./models/Circular');

// Connect to DB
const connectDB = require('./config/db');
connectDB()
  .then(async () => {
    console.log('MySQL Connected');
    
    // Initialize models
    await User.initUserModel();
    await Circular.initCircularModel();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB Connection failed:', err);
    process.exit(1);
  });

