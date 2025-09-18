# Poker Tracker Web

A modern Next.js web application for tracking poker sessions and analyzing performance.

## Features

- 🎯 **Session Tracking** - Record every poker session with detailed information
- 📊 **Performance Analytics** - Comprehensive statistics and visualizations
- 💰 **Profit Tracking** - Monitor winnings and losses across different games
- 📈 **Detailed Reports** - Generate reports to understand your game
- 🏆 **Achievement System** - Track milestones and stay motivated
- 👥 **Multi-Player Support** - Track multiple players and compare performance

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp env.example .env.local
   ```

3. Update environment variables in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run export` - Export static site

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section
│   ├── Features.tsx    # Features section
│   ├── Stats.tsx       # Statistics section
│   └── Footer.tsx      # Footer
├── lib/               # Utility libraries
│   ├── api.ts         # API client
│   └── utils.ts       # Utility functions
├── types/             # TypeScript type definitions
│   └── index.ts       # Main types
└── hooks/             # Custom React hooks
```

## API Integration

The web app integrates with the Poker Tracker API. Make sure the API server is running on the configured port (default: 3001).

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Contributing

1. Follow the project's coding standards
2. Write tests for new features
3. Update documentation as needed
4. Submit pull requests for review

## License

This project is part of the Poker Tracker application suite.
