import { Router, Request, Response } from "express";
import { models } from "../db";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  updateUserValidation,
  userIdParamValidation,
} from "../validators/userValidator";
import { getMessage } from "../services/localizationService";

const router = Router();
const { User } = models;

//INFO: Authorization require
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  const lang = req.headers.language as string;

  try {
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

    res.json({
      data: users,
      message: getMessage(lang, "listOfUsers"),
    });
  } catch (error) {
    res.status(500).json({
      message: getMessage(lang, "errorFetchingUser"),
      error,
    });
  }
});

router.get(
  "/:id",
  authenticateToken,
  userIdParamValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;
    const { id } = req.params;

    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      return res
        .status(403)
        .json({ message: getMessage(lang, "accessDenied") });
    }

    const user = await User.findByPk(id, {
      attributes: ["name", "surname", "age", "nickName"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      data: user,
      message: getMessage(lang, "userProfileData"),
    });
  }
);

router.put(
  "/:id",
  authenticateToken,
  updateUserValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;
    const { id } = req.params;
    const { name, surname, nickName, age, role } = req.body;

    if (req.user.role !== "ADMIN" && req.user.id !== Number(id)) {
      return res
        .status(403)
        .json({ message: getMessage(lang, "accessDenied") });
    }

    try {
      const [updated] = await User.update(
        { name, surname, nickName, age, role },
        { where: { id } }
      );

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await User.findByPk(id);
      res.json({
        data: updatedUser,
        message: getMessage(lang, "userUpdated"),
      });
    } catch (error) {
      res.status(500).json({
        message: getMessage(lang, "errorUpdatingUser"),
        error,
      });
    }
  }

  //INFO: Without authorization
);

export default router;
