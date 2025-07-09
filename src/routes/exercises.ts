import { Router, Request, Response } from "express";

import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";
import { Op } from "sequelize";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  getExerciseQueryValidation,
} from "../validators/exerciseValidator";

const router = Router();

const { Exercise, Program } = models;

function parseExerciseQuery(query: any) {
  const rawPage = query.page as string | undefined;
  const rawLimit = query.limit as string | undefined;
  const rawProgramID = query.programID as string | undefined;
  const rawSearch = query.search as string | undefined;

  const page = rawPage ? parseInt(rawPage) : null;
  const limit = rawLimit ? parseInt(rawLimit) : null;

  return {
    page,
    limit,
    programID: rawProgramID,
    search: rawSearch,
  };
}

export default () => {
  router.get(
    "/",
    getExerciseQueryValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const { page, limit, programID, search } = parseExerciseQuery(req.query);

      const where: any = {};
      if (programID) where.programID = programID;
      if (search) where.name = { [Op.iLike]: `%${search}%` };

      try {
        const total = await Exercise.count({ where });

        const finalLimit =
          page === null && limit === null ? total : limit ?? 10;
        const finalPage = page ?? 1;
        const offset = (finalPage - 1) * finalLimit;

        if (offset >= total && total > 0) {
          return res.status(404).json({ message: "Page does not exist" });
        }

        const { rows: exercises } = await Exercise.findAndCountAll({
          where,
          include: [{ model: Program }],
          offset,
          limit: finalLimit,
          order: [["createdAt", "DESC"]],
        });

        return res.json({
          data: exercises,
          pagination: {
            total,
            page: finalPage,
            limit: finalLimit,
            pages: Math.ceil(total / finalLimit),
          },
          message: "List of exercises",
        });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error fetching exercises", error });
      }
    }
  );

  router.post(
    "/",
    authenticateToken,
    authorizeAdmin,
    createExerciseValidation,
    validateRequest,
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
    deleteExerciseValidation,
    validateRequest,
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
    updateExerciseValidation,
    validateRequest,
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
