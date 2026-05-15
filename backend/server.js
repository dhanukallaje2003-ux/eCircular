const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- MIDDLEWARE ---------------- */

// CORS (ALLOW LOCAL + PRODUCTION)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://e-circular-gqa96p98n-abhimos-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------------- ROUTES ---------------- */

try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/circular', require('./routes/circularRoutes'));
} catch (err) {
  console.log("Route loading error:", err.message);
}

/* ---------------- DB CONNECTION ---------------- */

const connectDB = require('./config/db');

connectDB()
  .then(() => {
    console.log('MySQL Connected');
  })
  .catch(err => {
    console.log('DB Warning (non-fatal):', err.message);
  });

/* ---------------- MODEL INIT (SAFE) ---------------- */

(async () => {
  try {
    const User = require('./models/User');
    const Circular = require('./models/Circular');

    if (User?.initUserModel) await User.initUserModel();
    if (Circular?.initCircularModel) await Circular.initCircularModel();

    console.log("Models initialized");
  } catch (err) {
    console.log("Model init warning:", err.message);
  }
})();

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "eCircular backend running"
  });
});

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
