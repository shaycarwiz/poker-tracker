import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { createErrorResponse, API_ERROR_CODES } from "../../shared";

export const validateLoginRequest = [
  body("googleId")
    .notEmpty()
    .withMessage("Google ID is required")
    .isString()
    .withMessage("Google ID must be a string"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse(API_ERROR_CODES.VALIDATION_NAME_REQUIRED, 400, {
          details: errors.array(),
        })
      );
    }
    return next();
  },
];

export const validateUpdateProfileRequest = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse(API_ERROR_CODES.VALIDATION_EMAIL_INVALID, 400, {
          details: errors.array(),
        })
      );
    }
    return next();
  },
];
