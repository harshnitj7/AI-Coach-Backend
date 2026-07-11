import User from "../models/User";

// Augments Express's Request type so `req.user` is typed everywhere
// after the `protect` middleware runs, instead of using `any`.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
