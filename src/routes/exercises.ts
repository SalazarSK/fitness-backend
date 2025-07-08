import { Router, Request, Response } from "express";

import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";
import { Op } from "sequelize";

const router = Router();

const { Exercise, Program } = models;

export default () => {
  router.get("/", async (req: Request, res: Response): Promise<any> => {
    const rawPage = req.query.page as string | undefined;
    const rawLimit = req.query.limit as string | undefined;
    const rawProgramID = req.query.programID as string | undefined;
    const rawSearch = req.query.search as string | undefined;

    const page = rawPage ? parseInt(rawPage) : null;
    const limit = rawLimit ? parseInt(rawLimit) : null;

    const where: any = {};
    if (rawProgramID) where.programID = rawProgramID;
    if (rawSearch) where.name = { [Op.iLike]: `%${rawSearch}%` };

    try {
      const count = await Exercise.count({ where });

      let finalLimit = 10;
      let finalPage = 1;

      if (!page && !limit) {
        finalLimit = count;
        finalPage = 1;
      } else {
        if (page && page >= 1) finalPage = page;
        if (limit && limit >= 1) finalLimit = limit;
      }

      const offset = (finalPage - 1) * finalLimit;

      const { rows: exercises } = await Exercise.findAndCountAll({
        where,
        include: [{ model: Program }],
        offset,
        limit: finalLimit,
        order: [["createdAt", "DESC"]],
      });

      if (offset >= count && count > 0) {
        return res.status(404).json({ message: "Page does not exist" });
      }

      return res.json({
        data: exercises,
        pagination: {
          total: count,
          page: finalPage,
          limit: finalLimit,
          pages: Math.ceil(count / finalLimit),
        },
        message: "List of exercises",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error fetching exercises", error });
    }
  });

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
