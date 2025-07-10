import { Router, Request, Response } from "express";
import { models } from "../db";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import {
  createProgramValidation,
  updateProgramValidation,
  deleteProgramValidation,
  assignExerciseToProgramValidation,
  removeExerciseFromProgramValidation,
} from "../validators/programsValidator";
import { validateRequest } from "../middleware/validationMiddleware";
import { getMessage } from "../services/localizationService";
import { AppError } from "../utils/AppError";
import { USER_ROLE } from "../utils/user_role_enums";

const router = Router();
const { Program, Exercise } = models;

export default () => {
  router.get(
    "/",
    authenticateToken,
    authorizeRole(USER_ROLE.USER),
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;

      const programs = await Program.findAll();

      return res.json({
        data: programs,
        message: getMessage(lang, "exerciseList"),
      });
    }
  );

  router.post(
    "/",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    createProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { name } = req.body;

      if (!name) throw new AppError("Name is required", 400);

      const program = await Program.create({ name });

      return res.status(201).json({
        message: getMessage(lang, "programCreated"),
        data: program,
      });
    }
  );

  router.put(
    "/:id",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    updateProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { id } = req.params;
      const { name } = req.body;

      const [updated] = await Program.update({ name }, { where: { id } });
      if (!updated) throw new AppError("Program not found", 404);

      const updatedProgram = await Program.findByPk(id);

      return res.status(200).json({
        message: getMessage(lang, "programUpdated"),
        data: updatedProgram,
      });
    }
  );

  router.delete(
    "/:id",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    deleteProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { id } = req.params;

      const deleted = await Program.destroy({ where: { id } });
      if (!deleted) throw new AppError("Program not found", 404);

      return res
        .status(200)
        .json({ message: getMessage(lang, "programDeleted") });
    }
  );

  router.put(
    "/:programId/add-exercise/:exerciseId",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    assignExerciseToProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { programId, exerciseId } = req.params;

      const program = await Program.findByPk(programId);
      if (!program) throw new AppError("Program not found", 404);

      const exercise = await Exercise.findByPk(exerciseId);
      if (!exercise) throw new AppError("Exercise not found", 404);

      if (Number(exercise.dataValues.programID) === Number(programId)) {
        throw new AppError(getMessage(lang, "exerciseAddedToProgram"), 400);
      }

      await exercise.update({ programID: programId });

      return res.status(200).json({
        message: getMessage(lang, "exerciseAddedToProgram"),
        exercise,
      });
    }
  );

  router.put(
    "/:programId/remove-exercise/:exerciseId",
    authenticateToken,
    authorizeRole(USER_ROLE.ADMIN),
    removeExerciseFromProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { exerciseId } = req.params;

      const exercise = await Exercise.findByPk(exerciseId);
      if (!exercise) throw new AppError("Exercise not found", 404);

      await exercise.update({ programID: null });

      return res.status(200).json({
        message: getMessage(lang, "exerciseRemovedFromProgram"),
        exercise,
      });
    }
  );

  return router;
};
