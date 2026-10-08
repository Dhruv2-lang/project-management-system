declare namespace Express {
  interface Request {
    /** Set by the `authenticate` middleware. Always derived from the verified JWT, never from client input. */
    user?: { id: string; fullName: string; email: string };
  }
}
