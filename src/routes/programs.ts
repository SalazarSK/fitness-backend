import { Router, Request, Response, NextFunction } from "express";
import { models } from "../db";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/authMiddleware";
import {
  createProgramValidation,
  updateProgramValidation,
  deleteProgramValidation,
  assignExerciseToProgramValidation,
  removeExerciseFromProgramValidation,
} from "../validators/programsValidator";
import { validateRequest } from "../middleware/validationMiddleware";
import { getMessage } from "../services/localizationService";

const router = Router();
const { Program, Exercise } = models;

export default () => {
  router.get(
    "/",
    async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
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
    authorizeAdmin,
    createProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      try {
        const program = await Program.create({ name });
        return res.status(201).json({
          message: getMessage(lang, "programCreated"),
          data: program,
        });
      } catch (err) {
        return res.status(500).json({
          message: getMessage(lang, "errorCreatingProgram"),
          error: err,
        });
      }
    }
  );

  router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { id } = req.params;
      const { name } = req.body;

      try {
        const [updated] = await Program.update({ name }, { where: { id } });
        if (!updated)
          return res.status(404).json({ message: "Program not found" });

        const updatedProgram = await Program.findByPk(id);
        return res.status(200).json({
          message: getMessage(lang, "programUpdated"),
          data: updatedProgram,
        });
      } catch (err) {
        return res.status(500).json({
          message: getMessage(lang, "errorUpdatingProgram"),
          error: err,
        });
      }
    }
  );

  router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { id } = req.params;

      try {
        const deleted = await Program.destroy({ where: { id } });
        if (!deleted)
          return res.status(404).json({ message: "Program not found" });

        return res
          .status(200)
          .json({ message: getMessage(lang, "programDeleted") });
      } catch (err) {
        return res.status(500).json({
          message: getMessage(lang, "errorDeletingProgram"),
          error: err,
        });
      }
    }
  );

  router.put(
    "/:programId/add-exercise/:exerciseId",
    authenticateToken,
    authorizeAdmin,
    assignExerciseToProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { programId, exerciseId } = req.params;

      try {
        const program = await Program.findByPk(programId);
        if (!program) {
          return res.status(404).json({ message: "Program not found" });
        }

        const exercise = await Exercise.findByPk(exerciseId);
        if (!exercise) {
          return res.status(404).json({ message: "Exercise not found" });
        }

        if (Number(exercise.dataValues.programID) === Number(programId)) {
          return res.status(400).json({
            message: getMessage(lang, "exerciseAddedToProgram"),
          });
        }

        await exercise.update({ programID: programId });

        return res.status(200).json({
          message: getMessage(lang, "exerciseAddedToProgram"),
          exercise,
        });
      } catch (err) {
        return res.status(500).json({
          message: getMessage(lang, "errorAssigningExercise"),
          error: err,
        });
      }
    }
  );

  router.put(
    "/:programId/remove-exercise/:exerciseId",
    authenticateToken,
    authorizeAdmin,
    removeExerciseFromProgramValidation,
    validateRequest,
    async (req: Request, res: Response): Promise<any> => {
      const lang = req.headers.language as string;
      const { exerciseId } = req.params;

      try {
        const exercise = await Exercise.findByPk(exerciseId);
        if (!exercise)
          return res.status(404).json({ message: "Exercise not found" });

        await exercise.update({ programID: null });
        return res.status(200).json({
          message: getMessage(lang, "exerciseRemovedFromProgram"),
          exercise,
        });
      } catch (err) {
        return res.status(500).json({
          message: getMessage(lang, "errorRemovingExercise"),
          error: err,
        });
      }
    }
  );

  return router;
};
