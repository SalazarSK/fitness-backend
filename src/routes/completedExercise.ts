import { Router, Request, Response } from "express";
import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";

import { validateRequest } from "../middleware/validationMiddleware";
import {
  deleteCompletedExerciseValidation,
  getUserCompletedExercisesValidation,
  trackCompletedExerciseValidation,
} from "../validators/completedExerciseValidator";
import { getMessage } from "../services/localizationService";

const router = Router();
const { CompletedExercise, Exercise, User } = models;

router.post(
  "/",
  authenticateToken,
  trackCompletedExerciseValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { exerciseID, duration } = req.body;
    const lang = req.headers.language as string;

    if (!exerciseID || !duration) {
      return res
        .status(400)
        .json({ message: "exerciseID and duration are required" });
    }

    try {
      const exercise = await Exercise.findByPk(exerciseID);
      if (!exercise) {
        return res
          .status(404)
          .json({ message: getMessage(lang, "errorFetchingUser") });
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
    } catch (error) {
      return res.status(500).json({
        message: getMessage(lang, "errorTrackingExercise"),
        error,
      });
    }
  }
);

router.get(
  "/me/completed-exercises",
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const lang = req.headers.language as string;

    try {
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

      return res.json({
        data: completedExercises,
        message: getMessage(lang, "completedExercisesList"),
      });
    } catch (error) {
      return res.status(500).json({
        message: getMessage(lang, "errorFetchingCompletedExercises"),
        error,
      });
    }
  }
);

router.get(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  getUserCompletedExercisesValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const lang = req.headers.language as string;

    try {
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
        return res
          .status(404)
          .json({ message: getMessage(lang, "errorFetchingUser") });
      }

      return res.json({
        data: user,
        message: getMessage(lang, "userDetailWithExercises"),
      });
    } catch (error) {
      return res.status(500).json({
        message: getMessage(lang, "errorFetchingUser"),
        error,
      });
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  deleteCompletedExerciseValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const lang = req.headers.language as string;

    try {
      const exercise = await CompletedExercise.findByPk(id);

      if (!exercise) {
        return res
          .status(404)
          .json({ message: getMessage(lang, "completedExerciseRemoved") });
      }

      if (req.user.role !== "ADMIN" && exercise.userID !== req.user.id) {
        return res
          .status(403)
          .json({ message: getMessage(lang, "accessDenied") });
      }

      await exercise.destroy();
      return res.json({
        message: getMessage(lang, "completedExerciseRemoved"),
      });
    } catch (error) {
      return res.status(500).json({
        message: getMessage(lang, "errorRemovingCompletedExercise"),
        error,
      });
    }
  }
);

export default router;
