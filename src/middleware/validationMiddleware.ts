import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError";
import { getMessage } from "../services/localizationService";

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  const language = req.headers.language as string;

  if (!errors.isEmpty()) {
    const errorDetails = errors.array();
    throw new AppError(
      getMessage(language, "validationFailed"),
      400,
      errorDetails
    );
  }

  next();
};
