import { NextFunction, Request, Response } from "express";
import { TransactionType } from "../../model/enums";

export const validateStartSession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { playerId, location, stakes, initialBuyIn, notes } = req.body;

  // Validate playerId
  if (
    !playerId ||
    typeof playerId !== "string" ||
    playerId.trim().length === 0
  ) {
    res.status(400).json({
      error: "Player ID is required and must be a non-empty string",
    });

    return;
  }

  // Validate location
  if (
    !location ||
    typeof location !== "string" ||
    location.trim().length === 0
  ) {
    res.status(400).json({
      error: "Location is required and must be a non-empty string",
    });

    return;
  }

  // Validate stakes
  if (!stakes || !stakes.smallBlind || !stakes.bigBlind) {
    res.status(400).json({
      error: "Stakes with smallBlind and bigBlind are required",
    });

    return;
  }

  if (
    !stakes.smallBlind.amount ||
    typeof stakes.smallBlind.amount !== "number" ||
    stakes.smallBlind.amount <= 0
  ) {
    res.status(400).json({
      error: "Small blind amount must be a positive number",
    });

    return;
  }

  if (
    !stakes.bigBlind.amount ||
    typeof stakes.bigBlind.amount !== "number" ||
    stakes.bigBlind.amount <= 0
  ) {
    res.status(400).json({
      error: "Big blind amount must be a positive number",
    });

    return;
  }

  if (stakes.bigBlind.amount <= stakes.smallBlind.amount) {
    res.status(400).json({
      error: "Big blind must be greater than small blind",
    });

    return;
  }

  // Validate initial buy-in
  if (
    !initialBuyIn ||
    !initialBuyIn.amount ||
    typeof initialBuyIn.amount !== "number" ||
    initialBuyIn.amount <= 0
  ) {
    res.status(400).json({
      error: "Initial buy-in amount is required and must be a positive number",
    });

    return;
  }

  // Validate notes if provided
  if (notes && typeof notes !== "string") {
    res.status(400).json({
      error: "Notes must be a string",
    });

    return;
  }

  next();
};

export const validateEndSession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { finalCashOut, notes } = req.body;

  // Validate final cash out
  if (
    !finalCashOut ||
    !finalCashOut.amount ||
    typeof finalCashOut.amount !== "number" ||
    finalCashOut.amount < 0
  ) {
    res.status(400).json({
      error:
        "Final cash out amount is required and must be a non-negative number",
    });

    return;
  }

  // Validate notes if provided
  if (notes && typeof notes !== "string") {
    res.status(400).json({
      error: "Notes must be a string",
    });

    return;
  }

  next();
};

export const validateAddTransaction = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { type, amount, description, notes } = req.body;

  // Validate transaction type
  if (!type || !Object.values(TransactionType).includes(type)) {
    res.status(400).json({
      error: "Valid transaction type is required",
      validTypes: Object.values(TransactionType),
    });

    return;
  }

  // Validate amount
  if (
    !amount ||
    !amount.amount ||
    typeof amount.amount !== "number" ||
    amount.amount <= 0
  ) {
    res.status(400).json({
      error: "Amount is required and must be a positive number",
    });

    return;
  }

  // Validate description if provided
  if (description && typeof description !== "string") {
    res.status(400).json({
      error: "Description must be a string",
    });

    return;
  }

  // Validate notes if provided
  if (notes && typeof notes !== "string") {
    res.status(400).json({
      error: "Notes must be a string",
    });

    return;
  }

  next();
};

export const validateSessionId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { id } = req.params;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    res.status(400).json({
      error: "Session ID is required and must be a non-empty string",
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
  const { playerId } = req.params;

  if (
    !playerId ||
    typeof playerId !== "string" ||
    playerId.trim().length === 0
  ) {
    res.status(400).json({
      error: "Player ID is required and must be a non-empty string",
    });

    return;
  }

  next();
};

export const validateUpdateNotes = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { notes } = req.body;

  if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
    res.status(400).json({
      error: "Notes are required and must be a non-empty string",
    });

    return;
  }

  next();
};

export const validateCancelSession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { reason } = req.body;

  if (reason && typeof reason !== "string") {
    res.status(400).json({
      error: "Reason must be a string",
    });

    return;
  }

  next();
};
