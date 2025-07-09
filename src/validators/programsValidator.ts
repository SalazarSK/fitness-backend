import { body, param } from "express-validator";

export const createProgramValidation = [
  body("name").isString().notEmpty().withMessage("Program name is required"),
];

export const updateProgramValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Program ID must be a positive integer"),
  body("name").isString().notEmpty().withMessage("Program name is required"),
];

export const deleteProgramValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Program ID must be a positive integer"),
];

export const assignExerciseToProgramValidation = [
  param("programId")
    .isInt({ gt: 0 })
    .withMessage("Program ID must be a positive integer"),
  param("exerciseId")
    .isInt({ gt: 0 })
    .withMessage("Exercise ID must be a positive integer"),
];

export const removeExerciseFromProgramValidation =
  assignExerciseToProgramValidation;
