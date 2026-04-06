const express = require('express');
const router = express.Router();
const pool = require('../db.cjs');
const passport = require('passport');

// Lazy-load passport configuration only when needed
let passportConfigured = false;

function configurePassport() {
  if (passportConfigured) return;
  passportConfigured = true;

  const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
        return done(null, existingUser.rows[0]);
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

      return done(null, newUser.rows[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM admin_users WHERE id = $1', [id]);
      done(null, result.rows[0] || null);
    } catch (error) {
      done(error, null);
    }
  });
}

// Google OAuth — stores returnTo in session, defaults to /admin
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
    // Store customer in session for storefront auth context
    req.session.customer = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
    const returnTo = req.session.returnTo || '/admin';
    delete req.session.returnTo;
    res.redirect(returnTo);
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

module.exports = router;
