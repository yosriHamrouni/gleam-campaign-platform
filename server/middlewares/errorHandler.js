// server/middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('[API ERROR]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};
