import { Request, Response, NextFunction } from "express";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("X-API-ADMIN-KEY");

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // Verify the token using your secret key
  if (token !== process.env.API_ADMIN_KEY) {
    console.log(token, process.env.API_ADMIN_KEY);
    return res.status(401).send("Access denied. Invalid token.");
  }

  next();
};
