import { Router, Request, Response } from "express";
import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";

const router = Router();
const { CompletedExercise, Exercise, User } = models;

router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const { exerciseID, duration } = req.body;

    if (!exerciseID || !duration) {
      return res
        .status(400)
        .json({ message: "exerciseID and duration are required" });
    }

    try {
      const exercise = await Exercise.findByPk(exerciseID);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const tracked = await CompletedExercise.create({
        userID: req.user.id,
        exerciseID,
        duration,
      });

      return res
        .status(201)
        .json({ message: "Exercise tracked", data: tracked });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error tracking exercise", error });
    }
  },

  router.get(
    "/me/completed-exercises",
    authenticateToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const completedExercises = await CompletedExercise.findAll({
          where: { userID: req.user.id },
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
          message: "Completed exercises list",
        });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error fetching completed exercises", error });
      }
    }
  ),

  router.get(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    async (req: Request, res: Response): Promise<any> => {
      const { id } = req.params;

      try {
        const user = await User.findByPk(id, {
          attributes: { exclude: ["password"] },
          include: [
            {
              model: models.CompletedExercise,
              include: [
                {
                  model: models.Exercise,
                  attributes: ["name", "difficulty"],
                },
              ],
            },
          ],
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.json({
          data: user,
          message: "User detail with completed exercises",
        });
      } catch (error) {
        return res.status(500).json({ message: "Error fetching user", error });
      }
    }
  )
);

export default router;
