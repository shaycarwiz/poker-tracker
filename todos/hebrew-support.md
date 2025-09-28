# Hebrew Support Completion

## Overview

Complete Hebrew translation support for the Poker Tracker application. Currently, most text strings are hardcoded in English and need to be replaced with translation keys.

## Current Status

- ✅ Translation system is set up with react-i18next
- ✅ Hebrew translation file (`he.json`) exists with basic translations
- ✅ English translation file (`en.json`) is complete
- ❌ Many components still use hardcoded English text
- ❌ Missing Hebrew translations for many UI elements

## Priority Tasks

### High Priority - Core Components

#### 1. Landing Page Components

- [ ] **Hero.tsx** - Replace hardcoded text with translation keys
  - "Track your poker sessions with precision."
  - "Learn more"
  - "Master Your Poker Game"
  - "Track every session, analyze your performance, and improve your poker skills with comprehensive statistics and insights."
  - "Get started"
  - "View demo"

- [ ] **Features.tsx** - Replace hardcoded text with translation keys
  - "Everything you need"
  - "Comprehensive poker tracking"
  - "Track every aspect of your poker game with our comprehensive suite of tools designed for serious players."
  - All feature names and descriptions:
    - "Session Tracking"
    - "Performance Analytics"
    - "Profit Tracking"
    - "Detailed Reports"
    - "Achievement System"
    - "Multi-Player Support"

- [ ] **Footer.tsx** - Replace hardcoded text with translation keys
  - Navigation items: "Dashboard", "Sessions", "Statistics", "Settings"
  - Support items: "Help Center", "Documentation", "Contact"
  - Legal items: "Privacy Policy", "Terms of Service", "Cookie Policy"
  - Copyright text: "© 2024 Poker Tracker. All rights reserved."

#### 2. Dashboard Components

- [ ] **StatsDashboard.tsx** - Replace hardcoded text with translation keys
  - "No statistics available"
  - "Total Sessions"
  - "Win Rate"
  - "Total Profit/Loss"
  - "Total Hours"
  - "Average Session Duration"
  - "Average Profit per Session"
  - "Average Session Value"
  - "Best Session"
  - "Worst Session"
  - "Recent Monthly Performance"
  - "Sessions:", "Profit:", "Win Rate:"

#### 3. Header Component

- [ ] **Header.tsx** - Replace hardcoded text with translation keys
  - "Poker Tracker" (brand name)
  - "Open main menu"
  - "Close menu"
  - Navigation items (already partially done)

### Medium Priority - Session Management

#### 4. Session Components

- [ ] **AddTransactionModal.tsx** - Replace hardcoded text with translation keys
  - Currency options: "USD", "EUR", "ILS", etc.
  - Form labels and placeholders

- [ ] **SessionList.tsx** - Replace hardcoded text with translation keys
  - "Session not found"
  - Status labels and other UI text

#### 5. Statistics Components

- [ ] **StatisticsPage.tsx** - Replace hardcoded text with translation keys
  - All chart labels and descriptions
  - Time period selectors
  - Data table headers

### Low Priority - Additional Components

#### 6. UI Components

- [ ] **LoadingSpinner.tsx** - Replace hardcoded text with translation keys
  - "Loading" aria-label

- [ ] **ErrorMessage.tsx** - Replace hardcoded text with translation keys
  - Error message templates

#### 7. Settings and Preferences

- [ ] **UserPreferences.tsx** - Replace hardcoded text with translation keys
  - Form labels and descriptions
  - Success/error messages

## Translation Keys to Add

### Landing Page Keys

```json
{
  "landing": {
    "hero": {
      "tagline": "Track your poker sessions with precision.",
      "learnMore": "Learn more",
      "title": "Master Your Poker Game",
      "description": "Track every session, analyze your performance, and improve your poker skills with comprehensive statistics and insights.",
      "getStarted": "Get started",
      "viewDemo": "View demo"
    },
    "features": {
      "subtitle": "Everything you need",
      "title": "Comprehensive poker tracking",
      "description": "Track every aspect of your poker game with our comprehensive suite of tools designed for serious players.",
      "sessionTracking": {
        "name": "Session Tracking",
        "description": "Record every poker session with detailed information about stakes, duration, and outcomes."
      },
      "performanceAnalytics": {
        "name": "Performance Analytics",
        "description": "Analyze your performance with comprehensive statistics and visualizations."
      },
      "profitTracking": {
        "name": "Profit Tracking",
        "description": "Monitor your winnings and losses across different games and time periods."
      },
      "detailedReports": {
        "name": "Detailed Reports",
        "description": "Generate detailed reports to understand your strengths and areas for improvement."
      },
      "achievementSystem": {
        "name": "Achievement System",
        "description": "Track milestones and achievements to stay motivated in your poker journey."
      },
      "multiPlayerSupport": {
        "name": "Multi-Player Support",
        "description": "Track multiple players and compare performance across different accounts."
      }
    },
    "footer": {
      "support": {
        "helpCenter": "Help Center",
        "documentation": "Documentation",
        "contact": "Contact"
      },
      "legal": {
        "privacyPolicy": "Privacy Policy",
        "termsOfService": "Terms of Service",
        "cookiePolicy": "Cookie Policy"
      },
      "copyright": "© 2024 Poker Tracker. All rights reserved."
    }
  }
}
```

### Dashboard Keys

```json
{
  "dashboard": {
    "stats": {
      "noStatisticsAvailable": "No statistics available",
      "totalSessions": "Total Sessions",
      "winRate": "Win Rate",
      "totalProfitLoss": "Total Profit/Loss",
      "totalHours": "Total Hours",
      "averageSessionDuration": "Average Session Duration",
      "averageProfitPerSession": "Average Profit per Session",
      "averageSessionValue": "Average Session Value",
      "bestSession": "Best Session",
      "worstSession": "Worst Session",
      "recentMonthlyPerformance": "Recent Monthly Performance",
      "sessions": "Sessions:",
      "profit": "Profit:",
      "winRateLabel": "Win Rate:"
    }
  }
}
```

### UI Component Keys

```json
{
  "ui": {
    "loading": "Loading",
    "openMainMenu": "Open main menu",
    "closeMenu": "Close menu",
    "brandName": "Poker Tracker"
  }
}
```

## Implementation Steps

1. **Audit all components** for hardcoded text strings
2. **Add missing translation keys** to both `en.json` and `he.json`
3. **Replace hardcoded strings** with `t()` function calls
4. **Test Hebrew translations** in the browser
5. **Verify RTL support** for Hebrew text
6. **Update component tests** to use translation keys
7. **Document translation workflow** for future updates

## Testing Checklist

- [ ] All text appears in Hebrew when language is set to Hebrew
- [ ] All text appears in English when language is set to English
- [ ] Language switching works correctly
- [ ] No hardcoded English text remains visible in Hebrew mode
- [ ] RTL layout works correctly for Hebrew text
- [ ] All form validations work in both languages
- [ ] Error messages appear in the correct language

## Notes

- Some text like "Poker Tracker" brand name might remain in English for consistency
- Consider keeping technical terms like "USD", "EUR" in their original form
- Ensure proper Hebrew grammar and context for all translations
- Test with different Hebrew text lengths to ensure UI doesn't break
