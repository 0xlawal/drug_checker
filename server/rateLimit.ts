import rateLimit from 'express-rate-limit';

export const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    state: 'unable_to_verify',
    message: 'Too many requests. Please wait a moment and try again.',
    status: 'rate_limited',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.ip === '127.0.0.1';
  },
});