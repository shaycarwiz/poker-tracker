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

#### 1. **Localized Error Messages**

```typescript
// Error message localization
const getLocalizedMessage = (error: string, language: string) => {
  const messages = {
    en: {
      INVALID_CREDENTIALS: "Invalid credentials",
      SESSION_NOT_FOUND: "Session not found",
    },
    he: {
      INVALID_CREDENTIALS: "פרטי התחברות לא תקינים",
      SESSION_NOT_FOUND: "המשחק לא נמצא",
    },
  };

  return messages[language]?.[error] || messages.en[error];
};
```

#### 2. **Hebrew Date Formatting**

```typescript
// Date formatting for Hebrew locale
const formatDateHebrew = (date: Date) => {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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

### 5. **Error Messages**

- **Common Errors**
  - "Invalid session data" → "נתוני משחק לא תקינים"
  - "Session not found" → "המשחק לא נמצא"
  - "Insufficient funds" → "אין מספיק כסף"
  - "Network error" → "שגיאת רשת"

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
# Language support
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,he
RTL_LANGUAGES=he

# Hebrew-specific settings
HEBREW_DATE_FORMAT=DD/MM/YYYY
HEBREW_CURRENCY_SYMBOL=₪
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

## Implementation Priority

### Phase 1: RTL Foundation (Week 1)

- Implement RTL CSS framework
- Set up internationalization infrastructure
- Add language toggle component
- Test basic RTL layout

### Phase 2: Content Translation (Week 2)

- Translate core UI elements
- Localize error messages
- Implement Hebrew date formatting
- Add Hebrew font support

### Phase 3: Advanced Features (Week 3)

- Implement bidirectional text support
- Add cultural adaptations
- Test mixed content scenarios
- Polish user experience

### Phase 4: Testing & Polish (Week 4)

- Comprehensive RTL testing
- Cross-browser compatibility
- Performance optimization
- User acceptance testing

## Success Criteria

- [ ] All UI elements properly mirrored for RTL
- [ ] Hebrew text renders correctly with proper fonts
- [ ] All user-facing text translated to Hebrew
- [ ] Date and number formatting adapted for Hebrew locale
- [ ] Language switching works seamlessly
- [ ] Mixed Hebrew/English content displays correctly
- [ ] Form inputs handle Hebrew text properly
- [ ] Error messages appear in Hebrew
- [ ] Responsive design works in RTL mode

## Related Files

- `/packages/web/src/lib/i18n.ts` - Internationalization setup
- `/packages/web/src/locales/` - Translation files
- `/packages/web/src/styles/rtl.css` - RTL-specific styles
- `/packages/web/src/components/LanguageToggle.tsx` - Language selector
- `/packages/api/src/shared/localization/` - Backend localization

## Dependencies

- **react-i18next** - React internationalization
- **i18next** - Core internationalization framework
- **@types/react-i18next** - TypeScript definitions
- **Hebrew fonts** - Google Fonts or custom Hebrew fonts

---

**Status**: Pending Implementation  
**Priority**: Medium  
**Estimated Effort**: 3-4 weeks  
**Dependencies**: UI framework completion, content translation

