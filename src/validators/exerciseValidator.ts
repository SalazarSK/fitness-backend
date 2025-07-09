import { body, param, query } from "express-validator";

export const createExerciseValidation = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("difficulty")
    .isString()
    .notEmpty()
    .withMessage("Difficulty is required"),
  body("programID")
    .isInt({ gt: 0 })
    .withMessage("programID must be a positive integer"),
];

export const updateExerciseValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Exercise ID must be a positive integer"),
  body("name").optional().isString(),
  body("description").optional().isString(),
  body("duration").optional().isNumeric(),
];

export const deleteExerciseValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Exercise ID must be a positive integer"),
];

export const getExerciseQueryValidation = [
  query("page")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Limit must be a positive integer"),
  query("programID")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("ProgramID must be a positive integer"),
  query("search").optional().isString().withMessage("Search must be a string"),
];
