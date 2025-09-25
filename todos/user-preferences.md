# User Preferences & Localization

## **User Language and Default Currency Settings**

### **1. Language Selection & Persistence**

- **Feature**: Allow users to select their preferred language
- **Implementation Tasks**:
  1. Add language selection dropdown to user settings/profile page
  2. Store user language preference in database (user profile table)
  3. Implement language persistence across browser sessions
  4. Add language context provider to manage current language state
  5. Update all UI components to use selected language
  6. Add language detection based on browser settings (optional)
  7. Implement language switching without page refresh

### **2. Default Currency Selection**

- **Feature**: Allow users to set their default currency for all monetary values
- **Implementation Tasks**:
  1. Add currency selection dropdown to user settings/profile page
  2. Store user currency preference in database (user profile table)
  3. Update all monetary displays to use selected currency
  4. Implement currency conversion logic (if supporting multiple currencies)
  5. Add currency symbol and formatting based on locale
  6. Update session forms to use default currency
  7. Update analytics and reports to display in selected currency

### **3. Database Schema Updates**

- **Feature**: Extend user profile to support preferences
- **Implementation Tasks**:
  1. Add `preferred_language` column to user profile table (default: 'he')
  2. Add `default_currency` column to user profile table (default: 'ILS')
  3. Create migration script for existing users
  4. Set default values for existing users (Hebrew + ILS)
  5. Update user profile API endpoints to handle new fields
  6. Add validation for language and currency values

### **4. API Endpoints**

- **Feature**: Create endpoints for managing user preferences
- **Implementation Tasks**:
  1. Create `GET /api/user/preferences` endpoint
  2. Create `PUT /api/user/preferences` endpoint
  3. Add validation for language and currency values
  4. Update user profile endpoints to include preferences
  5. Add proper error handling and validation messages
  6. Update API documentation

### **5. Frontend Components**

- **Feature**: Create UI components for preference management
- **Implementation Tasks**:
  1. Create `UserPreferences` component
  2. Create `LanguageSelector` component
  3. Create `CurrencySelector` component
  4. Add preferences section to user profile/settings page
  5. Implement real-time preference updates
  6. Add loading states and error handling
  7. Style components to match existing design system

### **6. Internationalization (i18n) Support**

- **Feature**: Implement proper i18n infrastructure
- **Implementation Tasks**:
  1. Set up i18n library (react-i18next or similar)
  2. Create translation files for supported languages
  3. Implement dynamic language loading
  4. Add translation keys for all UI text
  5. Create language-specific date/time formatting
  6. Add RTL support for languages like Hebrew/Arabic (if needed)

### **7. Currency Support & Formatting**

- **Feature**: Support multiple currencies with proper formatting
- **Implementation Tasks**:
  1. Create currency configuration file with supported currencies
  2. Implement currency formatting utility functions
  3. Add currency symbols and decimal places per currency
  4. Create currency validation functions
  5. Add currency conversion rates (if supporting live rates)
  6. Update all monetary inputs to use currency formatting

### **8. User Experience Enhancements**

- **Feature**: Improve UX for preference management
- **Implementation Tasks**:
  1. Add preference change confirmation dialogs
  2. Implement preference change history/audit log
  3. Add preference reset to defaults option
  4. Create preference import/export functionality
  5. Add preference change notifications
  6. Implement preference change rollback functionality

### **9. Testing & Validation**

- **Feature**: Ensure preference functionality works correctly
- **Implementation Tasks**:
  1. Write unit tests for preference components
  2. Write integration tests for preference API endpoints
  3. Write E2E tests for preference management flow
  4. Test language switching across all pages
  5. Test currency formatting with different values
  6. Test preference persistence across browser sessions
  7. Test preference validation and error handling

### **10. Documentation & Migration**

- **Feature**: Document and support preference migration
- **Implementation Tasks**:
  1. Update API documentation with new endpoints
  2. Create user guide for preference settings
  3. Document supported languages and currencies
  4. Create migration guide for existing users
  5. Add preference-related error codes and messages
  6. Update deployment documentation

---

### **Supported Languages (Initial)**

- Hebrew (he) - **Default**
- English (en)
- Spanish (es) - _if needed_
- French (fr) - _if needed_

### **Supported Currencies (Initial)**

- ILS (₪) - **Default**
- USD ($)
- EUR (€)
- GBP (£)
- CAD (C$)

### **Priority Levels**

- **High**: Language selection, currency selection, database schema
- **Medium**: i18n infrastructure, API endpoints, frontend components
- **Low**: Advanced features, additional languages/currencies, audit logging

This todo covers the complete implementation of user language and default currency settings, including database changes, API development, frontend components, and user experience enhancements.
