import { JwtPayload } from "jsonwebtoken";

export interface JwtUserPayload extends JwtPayload {
  id: number;
  role: "ADMIN" | "USER";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
