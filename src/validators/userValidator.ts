import { body, param } from "express-validator";

export const userIdParamValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("User ID must be a positive integer"),
];

export const updateUserValidation = [
  ...userIdParamValidation,
  body("name").optional().isString().withMessage("Name must be a string"),
  body("surname").optional().isString().withMessage("Surname must be a string"),
  body("nickName")
    .optional()
    .isString()
    .withMessage("Nickname must be a string"),
  body("age")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Age must be a positive number"),
  body("role")
    .optional()
    .isIn(["USER", "ADMIN"])
    .withMessage("Role must be either 'USER' or 'ADMIN'"),
];
