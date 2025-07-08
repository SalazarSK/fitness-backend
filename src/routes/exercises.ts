import { Router, Request, Response, NextFunction } from "express";

import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";

const router = Router();

const { Exercise, Program } = models;

export default () => {
  router.get(
    "/",
    async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {
      const exercises = await Exercise.findAll({
        include: [
          {
            model: Program,
          },
        ],
      });

      return res.json({
        data: exercises,
        message: "List of exercises",
      });
    }
  );

  router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    async (req: Request, res: Response): Promise<any> => {
      const { name, difficulty, programID } = req.body;
      if (!name || !difficulty || !programID) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      try {
        const exercise = await Exercise.create({ name, difficulty, programID });
        return res.status(201).json({ message: "Exercise created", exercise });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error creating exercise", error });
      }
    }
  );

  router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.params;

      try {
        const deleted = await Exercise.destroy({ where: { id } });
        if (!deleted) {
          return res.status(404).json({ message: "Exercise not found" });
        }

        return res.status(200).json({ message: "Exercise deleted" });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error deleting exercise", error });
      }
    }
  );

  router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.params;
      const { name, description, duration } = req.body;

      try {
        const [updated] = await Exercise.update(
          { name, description, duration },
          { where: { id } }
        );

        if (!updated) {
          return res.status(404).json({ message: "Exercise not found" });
        }

        const updatedExercise = await Exercise.findByPk(id);
        return res
          .status(200)
          .json({ message: "Exercise updated", data: updatedExercise });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error updating exercise", error });
      }
    }
  );

  return router;
};
