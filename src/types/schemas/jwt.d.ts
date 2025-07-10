import { JwtPayload } from "jsonwebtoken";
import { USER_ROLE } from "../../utils/user_role_enums";

export interface JwtUserPayload extends JwtPayload {
  id: number;
  role: USER_ROLE;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
