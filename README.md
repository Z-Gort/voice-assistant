# Gmail AI Monorepo

This is a monorepo containing both the mobile frontend and backend for the Gmail AI application.

## Structure

- `backend/` - Next.js backend with tRPC, Drizzle ORM, and PostgreSQL
- `mobile/` - React Native mobile app with Expo

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Expo CLI (for mobile development)

## Setup

1. Install pnpm if you haven't already:
   ```bash
   npm install -g pnpm
   ```

2. Install dependencies for all workspaces:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Configure your database and other environment variables

## Development

### Run all services in development mode:
```bash
pnpm dev
```

### Run specific services:

**Backend only:**
```bash
pnpm --filter backend dev
```

**Mobile only:**
```bash
pnpm --filter mobile start
```

### Build all packages:
```bash
pnpm build
```

### Lint all packages:
```bash
pnpm lint
```

### Type checking:
```bash
pnpm typecheck
```

### Format code:
```bash
pnpm format
```

## Workspace Commands

- `pnpm --filter backend <command>` - Run commands in backend workspace
- `pnpm --filter mobile <command>` - Run commands in mobile workspace
- `pnpm --parallel <command>` - Run commands in parallel across all workspaces
- `pnpm --recursive <command>` - Run commands recursively in all workspaces

## Ports

- Backend: http://localhost:3000
- Mobile: Expo development server (default port)

## Technologies

- **Backend**: Next.js, tRPC, Drizzle ORM, PostgreSQL, Stripe
- **Mobile**: React Native, Expo, TypeScript
- **Package Manager**: pnpm workspaces 