// Enums - Constants for domain concepts

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TransactionType {
  BUY_IN = "buy_in",
  CASH_OUT = "cash_out",
  REBUY = "rebuy",
  ADD_ON = "add_on",
  TIP = "tip",
  RAKEBACK = "rakeback",
  BONUS = "bonus",
  OTHER = "other",
}
