import { body, param } from "express-validator";

export const trackCompletedExerciseValidation = [
  body("exerciseID")
    .isInt({ min: 1 })
    .withMessage("exerciseID must be a positive integer"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("duration must be a positive number (seconds)"),
];

export const deleteCompletedExerciseValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Completed exercise ID must be a valid number"),
];

export const getUserCompletedExercisesValidation = [
  param("id").isInt({ min: 1 }).withMessage("User ID must be a valid number"),
];
