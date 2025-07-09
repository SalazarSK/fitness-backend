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

const router = Router();

const { Program, Exercise } = models;

export default () => {
  router.get(
    "/",
    async (_req: Request, res: Response, _next: NextFunction): Promise<any> => {
      const programs = await Program.findAll();
      return res.json({
        data: programs,
        message: "List of programs",
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
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      try {
        const program = await Program.create({ name });
        return res
          .status(201)
          .json({ message: "Program created", data: program });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error creating program", error: err });
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
      const { id } = req.params;
      const { name } = req.body;

      try {
        const [updated] = await Program.update({ name }, { where: { id } });
        if (!updated)
          return res.status(404).json({ message: "Program not found" });

        const updatedProgram = await Program.findByPk(id);
        return res
          .status(200)
          .json({ message: "Program updated", data: updatedProgram });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error updating program", error: err });
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
      const { id } = req.params;

      try {
        const deleted = await Program.destroy({ where: { id } });
        if (!deleted)
          return res.status(404).json({ message: "Program not found" });

        return res.status(200).json({ message: "Program deleted" });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error deleting program", error: err });
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

        //check if already assigned
        if (Number(exercise.dataValues.programID) === Number(programId)) {
          return res
            .status(400)
            .json({ message: "Exercise is already in this program" });
        }

        await exercise.update({ programID: programId });

        return res.status(200).json({
          message: "Exercise added to program",
          exercise,
        });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error assigning exercise", error: err });
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
      const { exerciseId } = req.params;

      try {
        const exercise = await Exercise.findByPk(exerciseId);
        if (!exercise)
          return res.status(404).json({ message: "Exercise not found" });

        await exercise.update({ programID: null });
        return res
          .status(200)
          .json({ message: "Exercise removed from program", exercise });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error removing exercise", error: err });
      }
    }
  );

  return router;
};
