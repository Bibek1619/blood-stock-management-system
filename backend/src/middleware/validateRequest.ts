import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { z } from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new AppError(errorMessage, 400);
      }
      throw error;
    }
  };
};
