import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { models } from "../db";
import { UserInstance } from "../types/schemas/UserInstance";
import {
  loginValidation,
  registerValidation,
} from "../validators/authValidator";
import { validateRequest } from "../middleware/validationMiddleware";
import { getMessage } from "../services/localizationService";
import { AppError } from "../utils/AppError";

const router: Router = Router();
const JWT_SECRET = "e292472cf1c2248cbf5c386844d50365ee00af35";

router.post(
  "/register",
  registerValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { name, surname, nickName, email, password, age, role } = req.body;
    const language = req.headers.language as string;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = (await models.User.create({
        name,
        surname,
        nickName,
        email,
        password: hashedPassword,
        age,
        role,
      })) as UserInstance;

      res.json({
        data: { id: user.id },
        message: getMessage(language, "registrationSuccess"),
      });
    } catch (error) {
      throw new AppError("Registration failed", 500, error);
    }
  }
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    const language = req.headers.language as string;

    try {
      const user = (await models.User.findOne({
        where: { email },
      })) as UserInstance;

      const isValidPassword =
        user && (await bcrypt.compare(password, user.password));

      if (!isValidPassword) {
        throw new AppError(getMessage(language, "invalidCredentials"), 401);
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        data: { token },
        message: getMessage(language, "loginSuccess"),
      });
    } catch (error) {
      throw new AppError("Login failed", 500, error);
    }
  }
);

export default router;
