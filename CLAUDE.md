# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an LLM Chat application built with React Router, TypeScript, TailwindCSS, and PostgreSQL. The application allows users to chat with different LLM models (GPT-4, Claude 3 Sonnet, Gemini Pro) through a web interface. It uses Supabase for local development and Drizzle ORM for database operations.

## Development Commands

### Main Application (apps/web)

All development commands should be run from the `apps/web` directory:

```bash
cd apps/web
```

- **Start development server**: `pnpm dev` (runs on http://localhost:5173)
- **Build for production**: `pnpm build`
- **Type checking**: `pnpm typecheck`
- **Database operations**:
  - Generate migrations: `pnpm db:generate`
  - Run migrations: `pnpm db:migrate`

### Root Level Commands

- **Linting**: `pnpm lint` (runs oxlint; fast JS/TS linter)
- **Auto-fix**: `pnpm lint:fix` (applies safe fixes via oxlint)
- **Supabase local development**: `supabase start` (starts local Supabase instance)

### Package Manager

This project uses **pnpm** exclusively (configured in engines). Always use `pnpm` instead of npm or yarn.

## Architecture

### Monorepo Structure

- `apps/web/` - Main React Router application
- `supabase/` - Local Supabase configuration and migrations
- `terraform/gcp/` - Google Cloud Platform infrastructure

### Application Structure

The web app follows React Router v7 patterns:

- `app/routes/` - Route handlers
  - `home.tsx` - Main chat interface
  - `chats.$chatId.send.tsx` - Chat message endpoint
- `app/components/` - React components
  - `custom/` - Application-specific components (ChatSpace, ChatSideBar, etc.)
  - `ui/` - Reusable UI components (shadcn/ui based)
- `database/` - Drizzle ORM schema and migrations
- `server/` - Express server setup

### Database Schema

Uses PostgreSQL with Drizzle ORM. Main tables:
- `chats` - Chat sessions with id, title, and timestamps

### Key Technologies

- **Frontend**: React Router v7, React 19, TypeScript
- **Styling**: TailwindCSS v4, next-themes for dark mode
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL, Drizzle ORM
- **Development**: Supabase (local), dotenv-cli for environment variables
- **Deployment**: Docker support, Terraform for GCP

## Environment Setup

1. Copy `.env.example` to `.env` in `apps/web/`
2. Set `DATABASE_URL` (defaults to local Supabase: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`)
3. Run `pnpm db:migrate` to initialize the database

## UI/UX Notes

- Interface is in Japanese (ja-JP locale)
- Dark mode support using next-themes
- Responsive design with mobile sidebar support
- Chat interface supports multiple LLM models with model selection dropdown

## Code Patterns

- Uses shadcn/ui component library conventions
- TypeScript interfaces defined in `app/lib/api.ts` for chat messages and responses
- Formatting: not configured at root. Consider adding Prettier or keeping Biome's formatter if you want formatting-on-save.
- React Router v7 file-based routing
- Custom components use Lucide React icons
