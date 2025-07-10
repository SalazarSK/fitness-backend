import { Router, Request, Response } from "express";
import { models } from "../db";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  updateUserValidation,
  userIdParamValidation,
} from "../validators/userValidator";
import { getMessage } from "../services/localizationService";
import { AppError } from "../utils/AppError";
import { USER_ROLE } from "../utils/user_role_enums";

const router = Router();
const { User } = models;

//INFO: Authorization require
router.get(
  "/",
  authenticateToken,
  authorizeRole(USER_ROLE.USER),
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;

    let users;

    if (req.user.role === "ADMIN") {
      users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
    } else {
      users = await User.findAll({
        attributes: ["id", "nickName"],
      });
    }

    return res.json({
      data: users,
      message: getMessage(lang, "listOfUsers"),
    });
  }
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole(USER_ROLE.USER),
  userIdParamValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;
    const { id } = req.params;

    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      throw new AppError(getMessage(lang, "accessDenied"), 403);
    }

    const user = await User.findByPk(id, {
      attributes: ["name", "surname", "age", "nickName"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.json({
      data: user,
      message: getMessage(lang, "userProfileData"),
    });
  }
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRole(USER_ROLE.USER),
  updateUserValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;
    const { id } = req.params;
    const { name, surname, nickName, age, role } = req.body;

    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      throw new AppError(getMessage(lang, "accessDenied"), 403);
    }

    const [updated] = await User.update(
      { name, surname, nickName, age, role },
      { where: { id } }
    );

    if (!updated) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await User.findByPk(id);

    return res.json({
      data: updatedUser,
      message: getMessage(lang, "userUpdated"),
    });
  }
  //INFO: Without authorization
);

export default router;
