const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const passport = require('passport');

// Configure both admin and customer Passport strategies immediately
configurePassport();

function configurePassport() {

  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  // Admin Google strategy (default 'google')
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await pool.query(
        'SELECT * FROM admin_users WHERE google_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];
        user._type = 'admin';
        return done(null, user);
      }

      const newUser = await pool.query(
        `INSERT INTO admin_users (google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0]?.value
        ]
      );
      newUser.rows[0]._type = 'admin';
      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

  // Customer Google strategy
  const customerCallbackURL = process.env.GOOGLE_CUSTOMER_CALLBACK_URL ||
    (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/customer/google/callback';

  passport.use('google-customer', new GoogleStrategy({
    name: 'google-customer',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: customerCallbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingCustomer = await pool.query(
        'SELECT * FROM customers WHERE google_id = $1',
        [profile.id]
      );

      if (existingCustomer.rows.length > 0) {
        const customer = existingCustomer.rows[0];
        customer._type = 'customer';
        return done(null, customer);
      }

      const newCustomer = await pool.query(
        `INSERT INTO customers (google_id, email, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0]?.value
        ]
      );
      newCustomer.rows[0]._type = 'customer';
      return done(null, newCustomer.rows[0]);
    } catch (error) {
      console.error('Customer Google auth error:', error.message, error.code || '');
      return done(error, null);
    }
  }
));

  // Session serialization — store both id and type to distinguish admin vs customer
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, type: user._type || 'admin' });
  });

  passport.deserializeUser(async (data, done) => {
    try {
      const table = data.type === 'customer' ? 'customers' : 'admin_users';
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [data.id]);
      if (!result.rows[0]) {
        console.warn(`Deserialize: no ${table.slice(0, -1)} found for id=${data.id}, session may be stale`);
        return done(null, null);
      }
      result.rows[0]._type = data.type;
      done(null, result.rows[0]);
    } catch (error) {
      console.error('Deserialize: database error:', error.message);
      done(error, null);
    }
  });
}

// ============================================================
// Admin OAuth routes
// ============================================================

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
  }
  configurePassport();
  req.session.returnTo = req.query.returnTo || '/admin';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    configurePassport();
    next();
  },
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/admin/login?error=auth_failed`
  }),
  (req, res) => {
    const returnTo = req.session.returnTo || '/admin';
    delete req.session.returnTo;
    req.session.save((err) => {
      if (err) console.error('Admin callback: session save error:', err.message);
      res.redirect(returnTo);
    });
  }
);

router.get('/login-failed', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  });
});

// ============================================================
// Customer OAuth routes
// ============================================================

router.get('/customer/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth not configured.' });
  }
  configurePassport();
  req.session.returnTo = req.query.returnTo || '/customer/account';
  req.session._authFlow = 'customer';
  passport.authenticate('google-customer', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/customer/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    configurePassport();
    next();
  },
  passport.authenticate('google-customer', {
    failureRedirect: `${process.env.FRONTEND_URL}/customer/login?error=auth_failed`
  }),
  (req, res) => {
    const returnTo = req.session.returnTo || '/customer/account';
    delete req.session.returnTo;
    delete req.session._authFlow;
    req.session.save((err) => {
      if (err) console.error('Customer callback: session save error:', err.message);
      res.redirect(returnTo);
    });
  }
);

router.get('/customer/me', (req, res) => {
  if (!req.user || req.user._type !== 'customer') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

router.post('/customer/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
