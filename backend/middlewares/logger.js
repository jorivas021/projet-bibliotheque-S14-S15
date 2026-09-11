function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duree = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duree}ms)`);
  });
  next();
}

module.exports = logger;
