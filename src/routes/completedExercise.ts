import { Router, Request, Response } from "express";
import { models } from "../db";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

import { validateRequest } from "../middleware/validationMiddleware";
import {
  deleteCompletedExerciseValidation,
  getUserCompletedExercisesValidation,
  trackCompletedExerciseValidation,
} from "../validators/completedExerciseValidator";
import { getMessage } from "../services/localizationService";
import { AppError } from "../utils/AppError";
import { USER_ROLE } from "../utils/user_role_enums";

const router = Router();
const { CompletedExercise, Exercise, User } = models;

router.post(
  "/",
  authenticateToken,
  authorizeRole(USER_ROLE.USER),
  trackCompletedExerciseValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { exerciseID, duration } = req.body;
    const lang = req.headers.language as string;

    if (!exerciseID || !duration) {
      throw new AppError("exerciseID and duration are required", 400);
    }

    const exercise = await Exercise.findByPk(exerciseID);
    if (!exercise) {
      throw new AppError(getMessage(lang, "errorFetchingUser"), 404);
    }

    const tracked = await CompletedExercise.create({
      userID: req.user.id,
      exerciseID,
      duration,
    });

    return res.status(201).json({
      message: getMessage(lang, "exerciseTracked"),
      data: tracked,
    });
  }
);

router.get(
  "/me/completed-exercises",
  authenticateToken,
  authorizeRole(USER_ROLE.USER),
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;

    const completedExercises = await CompletedExercise.findAll({
      where: { userID: req.user.id },
      attributes: ["id", "exerciseID", "completedAt", "duration"],
      include: [
        {
          model: Exercise,
          attributes: ["id", "name", "difficulty"],
        },
      ],
      order: [["completedAt", "DESC"]],
    });

    return res.status(200).json({
      data: completedExercises,
      message: getMessage(lang, "completedExercisesList"),
    });
  }
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole(USER_ROLE.ADMIN),
  getUserCompletedExercisesValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const lang = req.headers.language as string;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: CompletedExercise,
          as: "completedExercises",
          include: [
            {
              model: Exercise,
              attributes: ["name", "difficulty"],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new AppError(getMessage(lang, "errorFetchingUser"), 404);
    }

    return res.status(200).json({
      data: user,
      message: getMessage(lang, "userDetailWithExercises"),
    });
  }
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(USER_ROLE.USER),
  deleteCompletedExerciseValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const lang = req.headers.language as string;

    const exercise = await CompletedExercise.findByPk(id);

    if (!exercise) {
      throw new AppError(getMessage(lang, "completedExerciseRemoved"), 404);
    }

    if (req.user.role !== "ADMIN" && exercise.userID !== req.user.id) {
      throw new AppError(getMessage(lang, "accessDenied"), 403);
    }

    await exercise.destroy();
    return res.status(200).json({
      message: getMessage(lang, "completedExerciseRemoved"),
    });
  }
);

export default router;
