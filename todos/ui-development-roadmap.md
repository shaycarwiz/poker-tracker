# UI Development Roadmap - Poker Tracker

## Current State Analysis

### ✅ What We Have

- **Google OAuth authentication** working with backend token exchange
- **Landing page** with marketing content (Hero, Features, Stats, Footer)
- **Navigation header** with links to Dashboard, Sessions, Statistics, Settings
- **Robust backend API** with player management and session tracking
- **Authentication flow** that exchanges Google tokens for backend JWT tokens

### ❌ What's Missing

- **No actual pages** - the navigation links go nowhere yet
- **No authenticated user experience** - users can sign in but have nowhere to go
- **No data visualization** - no way to see poker performance
- **No session management UI** - can't start, track, or end sessions

## Recommended Development Order

### 1. **Dashboard Page** (Priority 1 - START HERE)

**Why start here?**

- Gives users immediate value after login
- Shows their data in a digestible way
- Uses existing API endpoints
- Not too complex - good starting point
- Foundation for other pages

**What to build:**

- **Quick stats overview**
  - Current bankroll
  - Recent sessions count
  - Win/loss summary
  - Session frequency
- **Recent sessions list**
  - Last 3-5 sessions with key metrics
  - Quick view of profit/loss per session
- **Quick actions**
  - "Start New Session" button
  - "View All Sessions" link
  - "Update Bankroll" link
- **Performance charts**
  - Profit/loss over time (last 30 days)
  - Session frequency chart
  - Win rate trend

**API Endpoints to use:**

- `GET /api/players/me` - Get user profile and current bankroll
- `GET /api/players/me/stats` - Get player statistics
- `GET /api/sessions/player/:playerId` - Get recent sessions

### 2. **Sessions Page** (Priority 2)

**Why second?**

- Core functionality - users need to track their sessions
- Most frequently used page
- Builds on dashboard patterns

**What to build:**

- **Session list**
  - All sessions with filtering (date range, location, stakes)
  - Search functionality
  - Sort by date, profit, duration
- **Session details modal/page**
  - Transaction history (buy-ins, rebuys, cash-outs)
  - Session notes
  - Duration and location
  - Final profit/loss
- **Start/End session functionality**
  - Quick start session form
  - End session with final cash-out
- **Add transactions**
  - Buy-in form
  - Rebuy form
  - Cash-out form

**API Endpoints to use:**

- `GET /api/sessions/player/:playerId` - List all sessions
- `POST /api/sessions` - Start new session
- `POST /api/sessions/:id/end` - End session
- `POST /api/sessions/:id/transactions` - Add transaction
- `PATCH /api/sessions/:id/notes` - Update notes

### 3. **Player Profile/Settings Page** (Priority 3)

**Why third?**

- Important but not core functionality
- Users need to manage their profile
- Simpler to implement

**What to build:**

- **Profile management**
  - Name and email display
  - Profile picture (from Google)
- **Bankroll management**
  - Current bankroll display
  - Update bankroll form
  - Bankroll history
- **Account settings**
  - Change display name
  - Privacy settings
  - Data export options

**API Endpoints to use:**

- `GET /api/players/me` - Get current profile
- `PATCH /api/players/me/bankroll` - Update bankroll
- `PUT /api/auth/profile` - Update profile info

### 4. **Statistics Page** (Priority 4)

**Why last?**

- Most complex to implement
- Requires good data foundation
- Nice-to-have rather than essential

**What to build:**

- **Advanced analytics**
  - Profit/loss by time period
  - Win rate by stakes
  - Session duration analysis
  - Location performance
- **Performance trends**
  - Monthly/yearly comparisons
  - Improvement over time
  - Best/worst sessions
- **Detailed reports**
  - Exportable reports
  - Custom date ranges
  - Filtered views

## Implementation Strategy

### Phase 1: Dashboard Foundation (Week 1)

1. Create dashboard page structure
2. Implement basic data fetching
3. Add key metrics display
4. Create simple charts
5. Add quick action buttons

### Phase 2: Session Management (Week 2)

1. Create sessions list page
2. Implement session CRUD operations
3. Add transaction management
4. Create session detail views
5. Add filtering and search

### Phase 3: Profile & Polish (Week 3)

1. Create profile/settings page
2. Implement bankroll management
3. Add responsive design
4. Improve error handling
5. Add loading states

### Phase 4: Advanced Features (Week 4+)

1. Create statistics page
2. Add advanced charts
3. Implement data export
4. Add real-time updates
5. Performance optimizations

## Technical Considerations

### State Management

- Use React Query for server state
- Use React Context for auth state
- Local state for UI interactions

### UI Components

- Build reusable components (Button, Card, Modal, etc.)
- Use Tailwind CSS for styling
- Implement responsive design
- Add loading and error states

### Data Flow

- Centralized API client
- Consistent error handling
- Optimistic updates where appropriate
- Proper loading states

### Authentication

- Protect all pages except landing
- Redirect to sign-in if not authenticated
- Handle token refresh
- Show user info in header

## Next Steps

1. **Start with Dashboard page** - Create the foundation
2. **Set up routing** - Add protected routes
3. **Implement data fetching** - Connect to existing API
4. **Add basic UI components** - Build reusable components
5. **Iterate and improve** - Get user feedback and refine

## Success Metrics

- Users can see their poker performance at a glance
- Users can easily start and track sessions
- Users can view detailed session history
- Users can manage their profile and bankroll
- The app feels fast and responsive
- The UI is intuitive and easy to use

---

**Ready to start?** Let's begin with the Dashboard page implementation!
