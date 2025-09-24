/**
 * Error code mapping for the Poker Tracker web application
 * Maps API error codes to localized messages
 */

export const ERROR_MESSAGES = {
  en: {
    // Authentication & Authorization
    AUTH_INVALID_TOKEN: 'Invalid or expired token',
    AUTH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    AUTH_PLAYER_NOT_FOUND: 'Player not found',
    AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED:
      'This Google account is already linked to another player',

    // Validation Errors
    VALIDATION_GOOGLE_ID_REQUIRED: 'Google ID is required',
    VALIDATION_GOOGLE_ID_INVALID: 'Google ID must be a valid string',
    VALIDATION_EMAIL_REQUIRED: 'Email is required',
    VALIDATION_EMAIL_INVALID: 'Please enter a valid email address',
    VALIDATION_NAME_REQUIRED: 'Name is required',
    VALIDATION_NAME_INVALID: 'Name must be a valid string',
    VALIDATION_NAME_LENGTH: 'Name must be between 1 and 100 characters',
    VALIDATION_PLAYER_ID_REQUIRED: 'Player ID is required',
    VALIDATION_PLAYER_ID_INVALID: 'Player ID must be a valid string',
    VALIDATION_LOCATION_REQUIRED: 'Location is required',
    VALIDATION_LOCATION_INVALID: 'Location must be a valid string',
    VALIDATION_STAKES_REQUIRED:
      'Stakes with small blind and big blind are required',
    VALIDATION_STAKES_INVALID: 'Invalid stakes configuration',
    VALIDATION_BUY_IN_REQUIRED: 'Initial buy-in amount is required',
    VALIDATION_BUY_IN_INVALID: 'Buy-in amount must be a positive number',
    VALIDATION_CASH_OUT_REQUIRED: 'Final cash out amount is required',
    VALIDATION_CASH_OUT_INVALID:
      'Cash out amount must be a non-negative number',
    VALIDATION_TRANSACTION_TYPE_REQUIRED: 'Transaction type is required',
    VALIDATION_TRANSACTION_TYPE_INVALID: 'Invalid transaction type',
    VALIDATION_AMOUNT_REQUIRED: 'Amount is required',
    VALIDATION_AMOUNT_INVALID: 'Amount must be a valid number',
    VALIDATION_AMOUNT_POSITIVE: 'Amount must be a positive number',
    VALIDATION_TRANSACTION_ID_REQUIRED: 'Transaction ID is required',
    VALIDATION_SESSION_ID_REQUIRED: 'Session ID is required',
    VALIDATION_SESSION_ID_INVALID: 'Session ID must be a valid string',
    VALIDATION_NOTES_REQUIRED: 'Notes are required',
    VALIDATION_NOTES_INVALID: 'Notes must be a valid string',
    VALIDATION_NAME_QUERY_REQUIRED: 'Name query parameter is required',
    VALIDATION_NAME_QUERY_INVALID: 'Name query must be a valid string',

    // Business Logic Errors
    BUSINESS_PLAYER_NOT_FOUND: 'Player not found',
    BUSINESS_PLAYER_ALREADY_EXISTS: 'Player already exists',
    BUSINESS_SESSION_NOT_FOUND: 'Session not found',
    BUSINESS_ACTIVE_SESSION_EXISTS: 'Player already has an active session',
    BUSINESS_CANNOT_ADD_TRANSACTION_INACTIVE:
      'Cannot add transactions to inactive session',
    BUSINESS_CANNOT_END_INACTIVE_SESSION: 'Cannot end inactive session',
    BUSINESS_CANNOT_CANCEL_INACTIVE_SESSION: 'Cannot cancel inactive session',
    BUSINESS_CURRENCY_NOT_FOUND: 'Currency not found',
    BUSINESS_TRANSACTION_NOT_FOUND: 'Transaction not found',

    // Database Operation Errors
    DATABASE_PLAYER_SAVE_FAILED: 'Failed to save player',
    DATABASE_PLAYER_DELETE_FAILED: 'Failed to delete player',
    DATABASE_PLAYER_FIND_FAILED: 'Failed to find player',
    DATABASE_PLAYER_FIND_BY_EMAIL_FAILED: 'Failed to find player by email',
    DATABASE_PLAYER_FIND_BY_GOOGLE_ID_FAILED:
      'Failed to find player by Google ID',
    DATABASE_PLAYER_FIND_ALL_FAILED: 'Failed to find players',
    DATABASE_PLAYER_FIND_BY_NAME_FAILED: 'Failed to find players by name',
    DATABASE_SESSION_SAVE_FAILED: 'Failed to save session',
    DATABASE_SESSION_DELETE_FAILED: 'Failed to delete session',
    DATABASE_SESSION_FIND_FAILED: 'Failed to find session',
    DATABASE_SESSION_FIND_ALL_FAILED: 'Failed to find sessions',
    DATABASE_SESSION_FIND_ACTIVE_FAILED: 'Failed to find active session',
    DATABASE_SESSION_FIND_COMPLETED_FAILED: 'Failed to find completed sessions',
    DATABASE_SESSION_FIND_RECENT_FAILED: 'Failed to find recent sessions',
    DATABASE_SESSION_FIND_BY_FILTERS_FAILED:
      'Failed to find sessions by filters',
    DATABASE_TRANSACTION_SAVE_FAILED: 'Failed to save transaction',
    DATABASE_TRANSACTION_DELETE_FAILED: 'Failed to delete transaction',
    DATABASE_TRANSACTION_FIND_FAILED: 'Failed to find transaction',
    DATABASE_TRANSACTION_FIND_ALL_FAILED: 'Failed to find transactions',
    DATABASE_TRANSACTION_FIND_BY_FILTERS_FAILED:
      'Failed to find transactions by filters',
    DATABASE_TRANSACTION_BEGIN_FAILED: 'Failed to begin transaction',
    DATABASE_TRANSACTION_COMMIT_FAILED: 'Failed to commit transaction',
    DATABASE_TRANSACTION_ROLLBACK_FAILED: 'Failed to rollback transaction',

    // API Operation Errors
    API_CREATE_PLAYER_FAILED: 'Failed to create player',
    API_GET_PLAYER_FAILED: 'Failed to get player',
    API_GET_PLAYER_STATS_FAILED: 'Failed to get player stats',
    API_UPDATE_PLAYER_FAILED: 'Failed to update player',
    API_UPDATE_PLAYER_BANKROLL_FAILED: 'Failed to update player bankroll',
    API_DELETE_PLAYER_FAILED: 'Failed to delete player',
    API_GET_PLAYERS_FAILED: 'Failed to get players',
    API_SEARCH_PLAYERS_FAILED: 'Failed to search players',
    API_START_SESSION_FAILED: 'Failed to start session',
    API_END_SESSION_FAILED: 'Failed to end session',
    API_ADD_TRANSACTION_FAILED: 'Failed to add transaction',
    API_GET_SESSION_FAILED: 'Failed to get session',
    API_LIST_SESSIONS_FAILED: 'Failed to list sessions',
    API_CANCEL_SESSION_FAILED: 'Failed to cancel session',
    API_UPDATE_SESSION_NOTES_FAILED: 'Failed to update session notes',
    API_GET_PLAYER_SESSIONS_FAILED: 'Failed to get player sessions',
    API_GET_ACTIVE_SESSION_FAILED: 'Failed to get active session',

    // System Errors
    SYSTEM_RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    SYSTEM_UNKNOWN_ERROR: 'An unknown error occurred',
    SYSTEM_INTERNAL_ERROR: 'Internal server error',
  },
  he: {
    // Authentication & Authorization
    AUTH_INVALID_TOKEN: 'אסימון לא תקין או פג תוקף',
    AUTH_TOKEN_EXPIRED: 'הפגישה שלך פגה. אנא התחבר שוב.',
    AUTH_PLAYER_NOT_FOUND: 'השחקן לא נמצא',
    AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED: 'חשבון Google זה כבר מקושר לשחקן אחר',

    // Validation Errors
    VALIDATION_GOOGLE_ID_REQUIRED: 'מזהה Google נדרש',
    VALIDATION_GOOGLE_ID_INVALID: 'מזהה Google חייב להיות מחרוזת תקינה',
    VALIDATION_EMAIL_REQUIRED: 'אימייל נדרש',
    VALIDATION_EMAIL_INVALID: 'אנא הזן כתובת אימייל תקינה',
    VALIDATION_NAME_REQUIRED: 'שם נדרש',
    VALIDATION_NAME_INVALID: 'שם חייב להיות מחרוזת תקינה',
    VALIDATION_NAME_LENGTH: 'שם חייב להיות בין 1 ל-100 תווים',
    VALIDATION_PLAYER_ID_REQUIRED: 'מזהה שחקן נדרש',
    VALIDATION_PLAYER_ID_INVALID: 'מזהה שחקן חייב להיות מחרוזת תקינה',
    VALIDATION_LOCATION_REQUIRED: 'מיקום נדרש',
    VALIDATION_LOCATION_INVALID: 'מיקום חייב להיות מחרוזת תקינה',
    VALIDATION_STAKES_REQUIRED: 'הימורים עם עיוורון קטן וגדול נדרשים',
    VALIDATION_STAKES_INVALID: 'תצורת הימורים לא תקינה',
    VALIDATION_BUY_IN_REQUIRED: 'סכום רכישת כניסה ראשונית נדרש',
    VALIDATION_BUY_IN_INVALID: 'סכום רכישת כניסה חייב להיות מספר חיובי',
    VALIDATION_CASH_OUT_REQUIRED: 'סכום משיכת כסף סופי נדרש',
    VALIDATION_CASH_OUT_INVALID: 'סכום משיכת כסף חייב להיות מספר לא שלילי',
    VALIDATION_TRANSACTION_TYPE_REQUIRED: 'סוג עסקה נדרש',
    VALIDATION_TRANSACTION_TYPE_INVALID: 'סוג עסקה לא תקין',
    VALIDATION_AMOUNT_REQUIRED: 'סכום נדרש',
    VALIDATION_AMOUNT_INVALID: 'סכום חייב להיות מספר תקין',
    VALIDATION_AMOUNT_POSITIVE: 'סכום חייב להיות מספר חיובי',
    VALIDATION_TRANSACTION_ID_REQUIRED: 'מזהה עסקה נדרש',
    VALIDATION_SESSION_ID_REQUIRED: 'מזהה משחק נדרש',
    VALIDATION_SESSION_ID_INVALID: 'מזהה משחק חייב להיות מחרוזת תקינה',
    VALIDATION_NOTES_REQUIRED: 'הערות נדרשות',
    VALIDATION_NOTES_INVALID: 'הערות חייבות להיות מחרוזת תקינה',
    VALIDATION_NAME_QUERY_REQUIRED: 'פרמטר חיפוש שם נדרש',
    VALIDATION_NAME_QUERY_INVALID: 'חיפוש שם חייב להיות מחרוזת תקינה',

    // Business Logic Errors
    BUSINESS_PLAYER_NOT_FOUND: 'השחקן לא נמצא',
    BUSINESS_PLAYER_ALREADY_EXISTS: 'השחקן כבר קיים',
    BUSINESS_SESSION_NOT_FOUND: 'המשחק לא נמצא',
    BUSINESS_ACTIVE_SESSION_EXISTS: 'לשחקן כבר יש משחק פעיל',
    BUSINESS_CANNOT_ADD_TRANSACTION_INACTIVE:
      'לא ניתן להוסיף עסקאות למשחק לא פעיל',
    BUSINESS_CANNOT_END_INACTIVE_SESSION: 'לא ניתן לסיים משחק לא פעיל',
    BUSINESS_CANNOT_CANCEL_INACTIVE_SESSION: 'לא ניתן לבטל משחק לא פעיל',
    BUSINESS_CURRENCY_NOT_FOUND: 'מטבע לא נמצא',
    BUSINESS_TRANSACTION_NOT_FOUND: 'עסקה לא נמצאה',

    // Database Operation Errors
    DATABASE_PLAYER_SAVE_FAILED: 'נכשל בשמירת שחקן',
    DATABASE_PLAYER_DELETE_FAILED: 'נכשל במחיקת שחקן',
    DATABASE_PLAYER_FIND_FAILED: 'נכשל במציאת שחקן',
    DATABASE_PLAYER_FIND_BY_EMAIL_FAILED: 'נכשל במציאת שחקן לפי אימייל',
    DATABASE_PLAYER_FIND_BY_GOOGLE_ID_FAILED:
      'נכשל במציאת שחקן לפי מזהה Google',
    DATABASE_PLAYER_FIND_ALL_FAILED: 'נכשל במציאת שחקנים',
    DATABASE_PLAYER_FIND_BY_NAME_FAILED: 'נכשל במציאת שחקנים לפי שם',
    DATABASE_SESSION_SAVE_FAILED: 'נכשל בשמירת משחק',
    DATABASE_SESSION_DELETE_FAILED: 'נכשל במחיקת משחק',
    DATABASE_SESSION_FIND_FAILED: 'נכשל במציאת משחק',
    DATABASE_SESSION_FIND_ALL_FAILED: 'נכשל במציאת משחקים',
    DATABASE_SESSION_FIND_ACTIVE_FAILED: 'נכשל במציאת משחק פעיל',
    DATABASE_SESSION_FIND_COMPLETED_FAILED: 'נכשל במציאת משחקים שהושלמו',
    DATABASE_SESSION_FIND_RECENT_FAILED: 'נכשל במציאת משחקים אחרונים',
    DATABASE_SESSION_FIND_BY_FILTERS_FAILED: 'נכשל במציאת משחקים לפי מסננים',
    DATABASE_TRANSACTION_SAVE_FAILED: 'נכשל בשמירת עסקה',
    DATABASE_TRANSACTION_DELETE_FAILED: 'נכשל במחיקת עסקה',
    DATABASE_TRANSACTION_FIND_FAILED: 'נכשל במציאת עסקה',
    DATABASE_TRANSACTION_FIND_ALL_FAILED: 'נכשל במציאת עסקאות',
    DATABASE_TRANSACTION_FIND_BY_FILTERS_FAILED:
      'נכשל במציאת עסקאות לפי מסננים',
    DATABASE_TRANSACTION_BEGIN_FAILED: 'נכשל בהתחלת עסקה',
    DATABASE_TRANSACTION_COMMIT_FAILED: 'נכשל באישור עסקה',
    DATABASE_TRANSACTION_ROLLBACK_FAILED: 'נכשל בביטול עסקה',

    // API Operation Errors
    API_CREATE_PLAYER_FAILED: 'נכשל ביצירת שחקן',
    API_GET_PLAYER_FAILED: 'נכשל בקבלת שחקן',
    API_GET_PLAYER_STATS_FAILED: 'נכשל בקבלת סטטיסטיקות שחקן',
    API_UPDATE_PLAYER_FAILED: 'נכשל בעדכון שחקן',
    API_UPDATE_PLAYER_BANKROLL_FAILED: 'נכשל בעדכון בנקול שחקן',
    API_DELETE_PLAYER_FAILED: 'נכשל במחיקת שחקן',
    API_GET_PLAYERS_FAILED: 'נכשל בקבלת שחקנים',
    API_SEARCH_PLAYERS_FAILED: 'נכשל בחיפוש שחקנים',
    API_START_SESSION_FAILED: 'נכשל בהתחלת משחק',
    API_END_SESSION_FAILED: 'נכשל בסיום משחק',
    API_ADD_TRANSACTION_FAILED: 'נכשל בהוספת עסקה',
    API_GET_SESSION_FAILED: 'נכשל בקבלת משחק',
    API_LIST_SESSIONS_FAILED: 'נכשל ברשימת משחקים',
    API_CANCEL_SESSION_FAILED: 'נכשל בביטול משחק',
    API_UPDATE_SESSION_NOTES_FAILED: 'נכשל בעדכון הערות משחק',
    API_GET_PLAYER_SESSIONS_FAILED: 'נכשל בקבלת משחקי שחקן',
    API_GET_ACTIVE_SESSION_FAILED: 'נכשל בקבלת משחק פעיל',

    // System Errors
    SYSTEM_RATE_LIMIT_EXCEEDED: 'יותר מדי בקשות. אנא נסה שוב מאוחר יותר.',
    SYSTEM_UNKNOWN_ERROR: 'אירעה שגיאה לא ידועה',
    SYSTEM_INTERNAL_ERROR: 'שגיאת שרת פנימית',
  },
} as const;

export type SupportedLanguage = keyof typeof ERROR_MESSAGES;
export type ErrorCode = keyof typeof ERROR_MESSAGES.en;

/**
 * Get localized error message for a given error code and language
 */
export function getErrorMessage(
  errorCode: string,
  language: SupportedLanguage = 'en'
): string {
  const messages = ERROR_MESSAGES[language];
  return messages[errorCode as ErrorCode] || messages.SYSTEM_UNKNOWN_ERROR;
}

/**
 * Get error message with fallback to English
 */
export function getErrorMessageWithFallback(
  errorCode: string,
  language: SupportedLanguage = 'en'
): string {
  const messages = ERROR_MESSAGES[language];
  const fallbackMessages = ERROR_MESSAGES.en;

  return (
    messages[errorCode as ErrorCode] ||
    fallbackMessages[errorCode as ErrorCode] ||
    messages.SYSTEM_UNKNOWN_ERROR
  );
}

/**
 * Check if an error code exists
 */
export function isValidErrorCode(errorCode: string): errorCode is ErrorCode {
  return errorCode in ERROR_MESSAGES.en;
}

/**
 * Get all error codes for a specific category
 */
export function getErrorCodesByCategory(category: string): ErrorCode[] {
  return Object.keys(ERROR_MESSAGES.en).filter((code) =>
    code.startsWith(category)
  ) as ErrorCode[];
}
