# Hebrew Language Support - Poker Tracker

## Overview

This document outlines the implementation requirements for adding Hebrew language support to the Poker Tracker application, including RTL (Right-to-Left) text direction, proper Hebrew text rendering, and localized content.

## Problem Statement

The current application only supports English language, limiting accessibility for Hebrew-speaking users. We need to implement:

1. **RTL Layout Support** - Hebrew text flows right-to-left
2. **Hebrew Text Rendering** - Proper font support and text display
3. **Localized Content** - All UI text translated to Hebrew
4. **Cultural Adaptations** - Date formats, number formatting, and UI patterns
5. **Bidirectional Text** - Mixed Hebrew/English content handling

## Implementation Requirements

### 1. **RTL Layout Implementation**

- **CSS Direction**: Implement `dir="rtl"` and `direction: rtl` support
- **Layout Mirroring**: Mirror UI elements for RTL (navigation, buttons, forms)
- **Flexbox/Grid**: Ensure RTL compatibility with modern CSS layouts
- **Icon Positioning**: Adjust icon placement for RTL layouts
- **Scroll Direction**: Handle horizontal scrolling in RTL context

### 2. **Typography & Font Support**

- **Hebrew Fonts**: Implement proper Hebrew font stack
- **Font Loading**: Ensure Hebrew fonts load correctly
- **Text Rendering**: Proper Hebrew character rendering and spacing
- **Font Fallbacks**: Graceful degradation for unsupported fonts
- **Font Size Scaling**: Appropriate font sizes for Hebrew text

### 3. **Content Localization**

- **UI Text**: Translate all user interface text to Hebrew
- **Error Messages**: Localize all error and success messages
- **Form Labels**: Translate form labels and placeholders
- **Navigation**: Translate navigation menu items
- **Help Text**: Localize help and instruction text

### 4. **Cultural Adaptations**

- **Date Format**: Hebrew date format (DD/MM/YYYY)
- **Number Format**: Hebrew number formatting and currency
- **Time Format**: 24-hour format preference
- **Currency Display**: Proper currency symbol placement
- **Input Validation**: Hebrew-specific validation messages

### 5. **Bidirectional Text Support**

- **Mixed Content**: Handle Hebrew/English mixed text
- **Input Fields**: Proper text direction in form inputs
- **Text Selection**: Correct text selection behavior
- **Copy/Paste**: Maintain text direction when copying

## Technical Implementation

### Frontend (Web App)

#### 1. **RTL CSS Framework**

```css
/* RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .flex {
  flex-direction: row-reverse;
}

[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}
```

#### 2. **Internationalization Setup**

```typescript
// i18n configuration
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    he: { translation: heTranslations },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

#### 3. **Language Toggle Component**

```typescript
// Language selector component
const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <button onClick={toggleLanguage}>
      {i18n.language === 'en' ? 'עברית' : 'English'}
    </button>
  );
};
```

### Backend (API)

#### 1. **Error Code System for Localization**

The backend uses a centralized error code system that enables frontend localization. Instead of sending human-readable error messages, the API returns standardized error codes that the frontend can translate.

```typescript
// Current error code structure (from /packages/api/src/shared/error-codes.ts)
export const API_ERROR_CODES = {
  // Authentication & Authorization
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_PLAYER_NOT_FOUND: "AUTH_PLAYER_NOT_FOUND",

  // Validation Errors
  VALIDATION_GOOGLE_ID_REQUIRED: "VALIDATION_GOOGLE_ID_REQUIRED",
  VALIDATION_EMAIL_INVALID: "VALIDATION_EMAIL_INVALID",
  VALIDATION_NAME_REQUIRED: "VALIDATION_NAME_REQUIRED",

  // Business Logic Errors
  BUSINESS_PLAYER_NOT_FOUND: "BUSINESS_PLAYER_NOT_FOUND",
  BUSINESS_SESSION_NOT_FOUND: "BUSINESS_SESSION_NOT_FOUND",
  BUSINESS_ACTIVE_SESSION_EXISTS: "BUSINESS_ACTIVE_SESSION_EXISTS",

  // Database Operation Errors
  DATABASE_PLAYER_SAVE_FAILED: "DATABASE_PLAYER_SAVE_FAILED",
  DATABASE_SESSION_FIND_FAILED: "DATABASE_SESSION_FIND_FAILED",

  // System Errors
  SYSTEM_RATE_LIMIT_EXCEEDED: "SYSTEM_RATE_LIMIT_EXCEEDED",
  SYSTEM_INTERNAL_ERROR: "SYSTEM_INTERNAL_ERROR",
} as const;
```

#### 2. **Standardized Error Response Structure**

```typescript
// Current API error response format
export interface APIErrorResponse {
  success: false;
  error: string;        // Error code for frontend localization
  code: APIErrorCode;   // Specific error code
  statusCode: number;   // HTTP status code
  details?: Record<string, any>; // Additional error details
}

// Example error response
{
  "success": false,
  "error": "VALIDATION_NAME_REQUIRED",
  "code": "VALIDATION_NAME_REQUIRED",
  "statusCode": 400,
  "details": {
    "field": "name",
    "value": ""
  }
}
```

#### 3. **Frontend Localization Mapping**

The frontend will need to map these error codes to Hebrew translations:

```typescript
// Frontend error code to Hebrew translation mapping
const errorTranslations = {
  he: {
    AUTH_INVALID_TOKEN: "אסימון לא תקין",
    AUTH_TOKEN_EXPIRED: "אסימון פג תוקף",
    AUTH_PLAYER_NOT_FOUND: "שחקן לא נמצא",
    VALIDATION_NAME_REQUIRED: "שם שחקן נדרש",
    VALIDATION_EMAIL_INVALID: "כתובת אימייל לא תקינה",
    BUSINESS_SESSION_NOT_FOUND: "המשחק לא נמצא",
    BUSINESS_ACTIVE_SESSION_EXISTS: "קיים משחק פעיל",
    DATABASE_PLAYER_SAVE_FAILED: "שגיאה בשמירת שחקן",
    SYSTEM_INTERNAL_ERROR: "שגיאה פנימית בשרת",
  },
  en: {
    AUTH_INVALID_TOKEN: "Invalid token",
    AUTH_TOKEN_EXPIRED: "Token expired",
    AUTH_PLAYER_NOT_FOUND: "Player not found",
    VALIDATION_NAME_REQUIRED: "Player name is required",
    VALIDATION_EMAIL_INVALID: "Invalid email address",
    BUSINESS_SESSION_NOT_FOUND: "Session not found",
    BUSINESS_ACTIVE_SESSION_EXISTS: "Active session exists",
    DATABASE_PLAYER_SAVE_FAILED: "Failed to save player",
    SYSTEM_INTERNAL_ERROR: "Internal server error",
  },
};
```

#### 4. **Hebrew Date Formatting (Frontend Implementation)**

```typescript
// Date formatting for Hebrew locale (implemented in frontend)
const formatDateHebrew = (date: Date) => {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Number formatting for Hebrew locale
const formatCurrencyHebrew = (amount: number, currency: string = "ILS") => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
```

## Content Translation Requirements

### 1. **Core UI Elements**

- **Navigation Menu**
  - Dashboard → לוח בקרה
  - Sessions → משחקים
  - Statistics → סטטיסטיקות
  - Settings → הגדרות
  - Sign In → התחברות
  - Sign Out → התנתקות

### 2. **Dashboard Content**

- **Quick Stats**
  - Current Bankroll → בנקול נוכחי
  - Recent Sessions → משחקים אחרונים
  - Win/Loss Summary → סיכום זכיות/הפסדים
  - Session Frequency → תדירות משחקים

### 3. **Session Management**

- **Session Form**
  - Location → מיקום
  - Stakes → הימורים
  - Buy-in → רכישת כניסה
  - Cash-out → משיכת כסף
  - Start Session → התחל משחק
  - End Session → סיים משחק

### 4. **Transaction Types**

- **Transaction Labels**
  - Buy-in → רכישת כניסה
  - Rebuy → רכישה חוזרת
  - Cash-out → משיכת כסף
  - Add Transaction → הוסף עסקה

### 5. **Error Messages (Error Code Mapping)**

- **Authentication Errors**
  - `AUTH_INVALID_TOKEN` → "אסימון לא תקין"
  - `AUTH_TOKEN_EXPIRED` → "אסימון פג תוקף"
  - `AUTH_PLAYER_NOT_FOUND` → "שחקן לא נמצא"

- **Validation Errors**
  - `VALIDATION_NAME_REQUIRED` → "שם שחקן נדרש"
  - `VALIDATION_EMAIL_INVALID` → "כתובת אימייל לא תקינה"
  - `VALIDATION_STAKES_REQUIRED` → "הימורים נדרשים"

- **Business Logic Errors**
  - `BUSINESS_SESSION_NOT_FOUND` → "המשחק לא נמצא"
  - `BUSINESS_ACTIVE_SESSION_EXISTS` → "קיים משחק פעיל"
  - `BUSINESS_CANNOT_ADD_TRANSACTION_INACTIVE` → "לא ניתן להוסיף עסקה למשחק לא פעיל"

- **System Errors**
  - `SYSTEM_INTERNAL_ERROR` → "שגיאה פנימית בשרת"
  - `SYSTEM_RATE_LIMIT_EXCEEDED` → "חרגת ממגבלת הבקשות"

## Testing Scenarios

### 1. **RTL Layout Testing**

- Verify all UI elements are properly mirrored
- Test form layouts in RTL mode
- Ensure navigation works correctly
- Test responsive design in RTL

### 2. **Hebrew Text Rendering**

- Test Hebrew font loading
- Verify text alignment and spacing
- Test mixed Hebrew/English content
- Ensure proper text selection

### 3. **Content Translation**

- Verify all UI text is translated
- Test error message localization
- Ensure form validation messages are in Hebrew
- Test date and number formatting

### 4. **User Experience**

- Test language switching functionality
- Verify RTL/LTR switching works smoothly
- Test form input in Hebrew
- Ensure proper text direction in inputs

## Configuration

### Environment Variables

```env
# Language support (Frontend configuration)
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,he
RTL_LANGUAGES=he

# Hebrew-specific settings (Frontend)
HEBREW_DATE_FORMAT=DD/MM/YYYY
HEBREW_CURRENCY_SYMBOL=₪

# Backend API configuration (already implemented)
NODE_ENV=development
PORT=4000
```

### Frontend Configuration

```typescript
const i18nConfig = {
  supportedLanguages: ["en", "he"],
  rtlLanguages: ["he"],
  defaultLanguage: "en",
  fallbackLanguage: "en",
  dateFormats: {
    en: "MM/DD/YYYY",
    he: "DD/MM/YYYY",
  },
};
```

## Current Implementation Status

### ✅ Backend (API) - Complete

- **Error Code System**: Centralized error codes implemented in `/packages/api/src/shared/error-codes.ts`
- **Error Response Structure**: Standardized API error responses with error codes
- **Error Handling**: Domain error classes and error handling middleware
- **API Response Types**: TypeScript interfaces for all API responses

### ❌ Frontend (Web App) - Pending

- **RTL Support**: Not implemented
- **Internationalization**: Not implemented
- **Error Code Mapping**: Not implemented
- **Hebrew Fonts**: Not implemented
- **Language Toggle**: Not implemented

## Implementation Priority

### Phase 1: Frontend Error Code Integration (Week 1)

- Create error code mapping system in frontend
- Implement error message localization
- Update API client to handle error codes
- Test error message display in Hebrew

### Phase 2: RTL Foundation (Week 2)

- Implement RTL CSS framework
- Set up internationalization infrastructure (react-i18next)
- Add language toggle component
- Test basic RTL layout

### Phase 3: Content Translation (Week 3)

- Translate core UI elements
- Implement Hebrew date and number formatting
- Add Hebrew font support
- Localize form labels and placeholders

### Phase 4: Advanced Features & Testing (Week 4)

- Implement bidirectional text support
- Add cultural adaptations
- Comprehensive RTL testing
- Cross-browser compatibility testing

## Success Criteria

### Backend (Already Complete)

- [x] Centralized error code system implemented
- [x] Standardized API error response structure
- [x] Error handling middleware with proper error codes
- [x] TypeScript interfaces for all API responses

### Frontend (To Be Implemented)

- [ ] All UI elements properly mirrored for RTL
- [ ] Hebrew text renders correctly with proper fonts
- [ ] All user-facing text translated to Hebrew
- [ ] Date and number formatting adapted for Hebrew locale
- [ ] Language switching works seamlessly
- [ ] Mixed Hebrew/English content displays correctly
- [ ] Form inputs handle Hebrew text properly
- [ ] Error messages appear in Hebrew using error code mapping
- [ ] Responsive design works in RTL mode
- [ ] API error codes properly mapped to Hebrew translations

## Related Files

### Frontend (Web App)

- `/packages/web/src/lib/i18n.ts` - Internationalization setup
- `/packages/web/src/locales/` - Translation files (to be created)
- `/packages/web/src/styles/rtl.css` - RTL-specific styles (to be created)
- `/packages/web/src/components/LanguageToggle.tsx` - Language selector (to be created)
- `/packages/web/src/lib/error-codes.ts` - Frontend error code mapping (to be created)

### Backend (API) - Already Implemented

- `/packages/api/src/shared/error-codes.ts` - Centralized error codes
- `/packages/api/src/shared/error-helpers.ts` - Error response helpers
- `/packages/api/src/shared/errors/domain-error.ts` - Domain error classes
- `/packages/api/src/api/middleware/errorHandler.ts` - Error handling middleware
- `/packages/api/src/api/types.ts` - API response types

## Dependencies

- **react-i18next** - React internationalization
- **i18next** - Core internationalization framework
- **@types/react-i18next** - TypeScript definitions
- **Hebrew fonts** - Google Fonts or custom Hebrew fonts

---

**Status**: Backend Complete, Frontend Pending  
**Priority**: Medium  
**Estimated Effort**: 3-4 weeks (Frontend only)  
**Dependencies**: Frontend internationalization setup, content translation, RTL CSS framework
