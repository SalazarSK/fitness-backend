import { Router, Request, Response } from "express";
import { models } from "../db";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import { Op } from "sequelize";
import { validateRequest } from "../middleware/validationMiddleware";
import {
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  getExerciseQueryValidation,
} from "../validators/exerciseValidator";
import { getMessage } from "../services/localizationService";
import { AppError } from "../utils/AppError";
import { USER_ROLE } from "../utils/user_role_enums";

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
    authorizeRole(USER_ROLE.USER),
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { page, limit, programID, search } = parseExerciseQuery(req.query);

      const where: any = {};
      if (programID) where.programID = programID;
      if (search) where.name = { [Op.iLike]: `%${search}%` };

      const total = await Exercise.count({ where });

      const finalLimit = page === null && limit === null ? total : limit ?? 10;
      const finalPage = page ?? 1;
      const offset = (finalPage - 1) * finalLimit;

      if (offset >= total && total > 0) {
        throw new AppError(getMessage(lang, "pageNotExist"), 404);
      }

      const { rows: exercises } = await Exercise.findAndCountAll({
        where,
        include: [{ model: Program }],
        offset,
        limit: finalLimit,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        data: exercises,
        pagination: {
          total,
          page: finalPage,
          limit: finalLimit,
          pages: Math.ceil(total / finalLimit),
        },
        message: getMessage(lang, "exerciseList"),
      });
    }
  );

  router.post(
    "/",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    createExerciseValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { name, difficulty, programID } = req.body;

      if (!name || !difficulty || !programID) {
        throw new AppError("Missing required fields", 400);
      }

      const exercise = await Exercise.create({ name, difficulty, programID });
      return res.status(201).json({
        message: getMessage(lang, "exerciseCreated"),
        exercise,
      });
    }
  );

  router.delete(
    "/:id",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    deleteExerciseValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { id } = req.params;

      const deleted = await Exercise.destroy({ where: { id } });
      if (!deleted) {
        throw new AppError("Exercise not found", 404);
      }

      return res
        .status(200)
        .json({ message: getMessage(lang, "exerciseDeleted") });
    }
  );

  router.put(
    "/:id",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    updateExerciseValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { id } = req.params;
      const { name, description, duration } = req.body;

      const [updated] = await Exercise.update(
        { name, description, duration },
        { where: { id } }
      );

      if (!updated) {
        throw new AppError("Exercise not found", 404);
      }

      const updatedExercise = await Exercise.findByPk(id);
      return res.status(200).json({
        message: getMessage(lang, "exerciseUpdated"),
        data: updatedExercise,
      });
    }
  );

  return router;
};
