import { NextFunction, Request, Response } from "express";

export const validateCreatePlayer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name, email, initialBankroll } = req.body;

  // Validate name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: "Name is required and must be a non-empty string",
    });

    return;
  }

  // Validate email if provided
  if (email && (typeof email !== "string" || !isValidEmail(email))) {
    res.status(400).json({
      error: "Email must be a valid email address",
    });

    return;
  }

  // Validate initial bankroll if provided
  if (initialBankroll) {
    if (
      !initialBankroll.amount ||
      typeof initialBankroll.amount !== "number" ||
      initialBankroll.amount < 0
    ) {
      res.status(400).json({
        error: "Initial bankroll amount must be a non-negative number",
      });

      return;
    }

    if (
      initialBankroll.currency &&
      typeof initialBankroll.currency !== "string"
    ) {
      res.status(400).json({
        error: "Initial bankroll currency must be a string",
      });

      return;
    }
  }

  next();
};

export const validateUpdateBankroll = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { amount, currency } = req.body;

  if (!amount || typeof amount !== "number") {
    res.status(400).json({
      error: "Amount is required and must be a number",
    });

    return;
  }

  if (currency && typeof currency !== "string") {
    res.status(400).json({
      error: "Currency must be a string",
    });

    return;
  }

  next();
};

export const validatePlayerId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { id } = req.params;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    res.status(400).json({
      error: "Player ID is required and must be a non-empty string",
    });

    return;
  }

  next();
};

export const validateSearchQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name } = req.query;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: "Name query parameter is required and must be a non-empty string",
    });

    return;
  }

  next();
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}
