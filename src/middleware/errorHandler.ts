import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/AppError";
import { getMessage } from "../services/localizationService";

const logDir = path.join(__dirname, "..", "logs");
const logPath = path.join(logDir, "error.log");

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const language = req.headers.language as string;
  const timestamp = new Date().toISOString();
  const errorMessage = err.stack || err.message;

  // Log do konzoly
  if (statusCode >= 500) {
    console.error(`[${timestamp}] [${statusCode}] ${errorMessage}`);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    // Log do súboru
    fs.appendFileSync(
      logPath,
      `[${timestamp}] [${statusCode}] ${errorMessage}\n`
    );
  }

  // Odpoveď pre klienta
  const message =
    statusCode >= 500
      ? getMessage(language, "internalServerError")
      : err.message || getMessage(language, "unexpectedError");

  res.status(statusCode).json({
    data: {},
    message,
  });
}
