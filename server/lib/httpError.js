// server/lib/httpError.js
// Errors thrown with a status are returned to the client as { message } with that status.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Wraps an async route handler so rejected promises reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
