function requireAuth(req, res, next) {
  const isAuthenticated = typeof req.isAuthenticated === 'function'
    ? req.isAuthenticated()
    : Boolean(req.user || req.session?.passport?.user);

  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
  }
  next();
}

module.exports = requireAuth;
