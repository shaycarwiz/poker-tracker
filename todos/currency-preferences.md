# Currency Preferences Integration

## **Issue Description**

The user can set their default currency in the preferences, but this setting is not being used throughout the application. For example, in the create session form, there is a currency input field that should default to the user's preferred currency, but it currently doesn't.

## **Expected Behavior**

- When a user sets their default currency in preferences, this setting should be used as the default value in all currency-related input fields
- The create session form should pre-populate the currency field with the user's default currency
- Any other forms or components that require currency selection should respect the user's preference

## **Current State**

- ✅ User can set default currency in preferences
- ❌ Default currency is not used in create session form
- ❌ Default currency is not used in other currency input fields
- ❌ Currency preference is not consistently applied across the application

## **Tasks to Complete**

### **1. Investigate Current Implementation**

- [ ] Review how currency preferences are stored and retrieved
- [ ] Identify all forms/components that have currency input fields
- [ ] Check if there's a centralized way to get user preferences
- [ ] Document current currency handling patterns

### **2. Update Create Session Form**

- [ ] Modify the create session form to use default currency as initial value
- [ ] Ensure the currency field is pre-populated when the form loads
- [ ] Test that the form still allows users to change the currency if needed

### **3. Update Other Currency Inputs**

- [ ] Find all other components with currency selection
- [ ] Update each component to use the default currency preference
- [ ] Ensure consistency across all currency inputs

### **4. Create Utility Functions**

- [ ] Create a utility function to get user's default currency
- [ ] Create a hook for easy access to currency preferences
- [ ] Ensure proper error handling when preferences are not available

### **5. Testing**

- [ ] Test that default currency is applied correctly in create session form
- [ ] Test that changing preferences updates the default values
- [ ] Test edge cases (no preference set, invalid currency, etc.)
- [ ] Verify that users can still override the default when needed

### **6. Documentation**

- [ ] Update component documentation to reflect currency preference usage
- [ ] Document the currency preference system for future developers

## **Files Likely to be Modified**

- `src/components/sessions/CreateSessionForm.tsx` (or similar)
- `src/contexts/UserPreferencesContext.tsx`
- `src/hooks/` (new hook for currency preferences)
- `src/lib/` (utility functions)
- Any other components with currency inputs

## **Acceptance Criteria**

- [ ] User's default currency is automatically selected in create session form
- [ ] All currency input fields respect the user's default preference
- [ ] Users can still change currency selection when needed
- [ ] The system gracefully handles cases where no default currency is set
- [ ] All changes are properly tested and documented

## **Priority**

**Medium** - This is a UX improvement that affects user experience but doesn't break core functionality.

## **Estimated Effort**

2-4 hours depending on the number of components that need updating.

---

**Created**: $(date)
**Status**: Open
**Assignee**: TBD
