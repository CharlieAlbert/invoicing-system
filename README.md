# Project Name

Ankards Company Invoicing System.

## Overview

This project is a full-stack application that leverages the power of Next.js for the frontend and Supabase for the backend database and authentication services.

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Supabase
- **Language**: TypeScript
- **Authentication**: Supabase Auth

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

## Environment Setup

Create a `.env` file in the root directory with the following variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

You don't expect to get the Environment Variables from the REAMDE, do you?

## Installation

1. Clone the repository:

```bash
git clone https://github.com/CharlieAlbert/invoicing-system.git
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
app/
    layout.tsx
    page.tsx
    auth/
    dashboard/
components/
    ...
contexts/
    AuthContext.tsx
lib/
    supabase/
        server-extended/ # Supabase server-side functions
        client.ts        # Supabase client configuration
        server.ts        # Server-side Supabase utilities
        types.ts         # TypeScript types for Supabase
        middleware.ts    # Authentication middleware
    utils.ts             # Utility functions
public/
    ...
utils/
    supabase.ts          # Supabase utilities
    auth.tsx             # Authentication components and hooks
```

## Features

- User authentication (sign up, sign in, sign out)
- Protected routes with middleware
- Type-safe database operations
- Server-side rendering support

Features will be updated as the development proceeds.

## Authentication

The project uses Supabase Authentication for user management. Authentication utilities can be found in `utils/auth.tsx` and protected routes are handled by the middleware in `lib/supabase/middleware.ts`.

## Database

Supabase is used as the primary database. Database types and client configurations can be found in:

- `lib/supabase/types.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

## Server Function

Server functions for Supabase `CRUD` operations can be found in:

- `lib/supabase/server-extended`

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

charlieraph36@gmail.com

## Acknowledgments

- Next.js
- Supabase
- TypeScript community
