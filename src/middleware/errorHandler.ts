import type { NextFunction, Request, Response } from "express";
interface CustomError extends Error {
  statusCode?: number;
}
export const errorHandler = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(error.statusCode || 500).json({
    error: error.message,
  });
};
