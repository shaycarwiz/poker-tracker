# E2E Test Scenarios for Poker Tracker

## **E2E Test Scenarios for Poker Tracker**

### **1. User Authentication & Onboarding Flow**

- **Scenario**: New user signs up and creates their first player profile
- **Steps**:
  1. User visits the web app
  2. Clicks "Sign In with Google"
  3. Completes Google OAuth flow
  4. System creates user account and player profile
  5. User is redirected to dashboard
  6. Verify user can see their profile information

### **2. Complete Poker Session Lifecycle**

- **Scenario**: User starts, manages, and ends a poker session
- **Steps**:
  1. User logs in successfully
  2. Navigates to "Start New Session"
  3. Fills out session form (location, stakes, initial buy-in)
  4. Starts the session
  5. Adds transactions during the session (rebuys, cash-outs)
  6. Updates session notes
  7. Ends the session
  8. Verifies session appears in session history
  9. Verifies bankroll is updated correctly

### **3. Multi-Session Tracking & Analytics**

- **Scenario**: User tracks multiple sessions and views performance analytics
- **Steps**:
  1. User creates and completes 3-4 different poker sessions
  2. Sessions have different outcomes (winning, losing, break-even)
  3. User navigates to analytics/stats page
  4. Verifies session history shows all sessions
  5. Verifies profit/loss calculations are correct
  6. Verifies win rate and other statistics are accurate
  7. Verifies bankroll tracking across sessions

### **4. Bankroll Management**

- **Scenario**: User manages their bankroll across multiple sessions
- **Steps**:
  1. User starts with initial bankroll (e.g., $1000)
  2. Plays multiple sessions with different buy-ins
  3. Updates bankroll manually when needed
  4. Verifies bankroll calculations are consistent
  5. Verifies bankroll updates reflect in all relevant views

### **5. Session Management & Error Handling**

- **Scenario**: User handles various session management scenarios
- **Steps**:
  1. User starts a session but cancels it before playing
  2. User starts a session, adds transactions, then cancels
  3. User tries to start a session with invalid data
  4. User tries to access another user's session data
  5. Verifies proper error messages and data protection

### **6. Data Persistence & Recovery**

- **Scenario**: User data persists across browser sessions and refreshes
- **Steps**:
  1. User logs in and creates sessions
  2. User refreshes the page
  3. User closes browser and reopens
  4. User logs in again
  5. Verifies all previous data is still available
  6. Verifies session state is maintained correctly

### **7. Cross-Platform API Integration**

- **Scenario**: Web app properly integrates with backend API
- **Steps**:
  1. User performs actions in web app
  2. Verify API calls are made correctly
  3. Verify API responses are handled properly
  4. Verify error states from API are displayed correctly
  5. Verify authentication tokens are managed correctly

### **8. Performance & Load Testing**

- **Scenario**: System handles multiple concurrent users
- **Steps**:
  1. Multiple users log in simultaneously
  2. Users create and manage sessions concurrently
  3. Users view analytics with large datasets
  4. Verify system performance remains acceptable
  5. Verify no data corruption occurs

### **9. Security & Authorization**

- **Scenario**: User access is properly restricted and secure
- **Steps**:
  1. User logs in and accesses their data
  2. User tries to access another user's data via URL manipulation
  3. User's session expires and they try to perform actions
  4. User logs out and tries to access protected pages
  5. Verify proper access control and error handling

### **10. Mobile Responsiveness**

- **Scenario**: Application works correctly on mobile devices
- **Steps**:
  1. User accesses app on mobile browser
  2. User performs all major functions on mobile
  3. User views analytics and reports on mobile
  4. Verify UI is responsive and functional
  5. Verify touch interactions work properly

---

These scenarios cover the core functionality of your poker tracker application, including authentication, session management, data persistence, analytics, security, and cross-platform compatibility. Each scenario tests multiple components working together in realistic user workflows.
