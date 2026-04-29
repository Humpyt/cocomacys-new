require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const PgSession = require('connect-pg-simple')(session);
const pool = require('./db.cjs');

// Import routes
const authRoutes = require('./routes/auth.cjs');
const productRoutes = require('./routes/products.cjs');
const collectionRoutes = require('./routes/collections.cjs');
const uploadRoutes = require('./routes/upload.cjs');
const importRoutes = require('./routes/import.cjs');
const clearanceRoutes = require('./routes/clearance.cjs');
const cartRoutes = require('./routes/cart.cjs');
const wishlistRoutes = require('./routes/wishlist.cjs');
const homepageSectionsRoutes = require('./routes/homepage-sections.cjs');
const ordersRoutes = require('./routes/orders.cjs');
const contactRoutes = require('./routes/contact.cjs');
const requireAuth = require('./middleware/requireAuth.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Nginx reverse proxy (required for secure cookies behind HTTPS)
app.set('trust proxy', 1);

// CORS configuration for development
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with PostgreSQL store
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'cocomacys-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/import', importRoutes);
app.use('/api/clearance', requireAuth, clearanceRoutes);
app.use('/api/homepage-sections', requireAuth, homepageSectionsRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend (built by Vite before server start)
const distPath = path.join(__dirname, '../dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    // Don't override existing API routes and auth routes
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('Warning: dist/ not found. Run "npm run build" first.');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

function startServer(port = PORT) {
  return app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });
}

startServer();

module.exports = app;
module.exports.startServer = startServer;
