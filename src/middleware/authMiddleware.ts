import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtUserPayload } from "../types/schemas/jwt";
import { USER_ROLE } from "../utils/user_role_enums";
import { config } from "../config";
import { AppError } from "../utils/AppError";
import { getMessage } from "../services/localizationService";

const JWT_SECRET = config.jwtSecret;

const roleHierarchy: Record<USER_ROLE, number> = {
  [USER_ROLE.USER]: 1,
  [USER_ROLE.ADMIN]: 2,
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  const language = req.headers.language as string;

  if (!token) {
    throw new AppError(getMessage(language, "noTokenProvided"), 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      throw new AppError(getMessage(language, "invalidToken"), 403);
    }

    req.user = user as JwtUserPayload;
    next();
  });
};

export const authorizeRole = (minRole: USER_ROLE) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const language = req.headers.language as string;
    const userRole = req.user?.role;

    if (!userRole || roleHierarchy[userRole] < roleHierarchy[minRole]) {
      throw new AppError(
        getMessage(language, "accessDenied") +
          `: ${minRole} ${getMessage(language, "required")}`,
        403
      );
    }

    next();
  };
};
