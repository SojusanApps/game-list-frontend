# My Game List Frontend

[![Maintainability](https://api.codeclimate.com/v1/badges/005e009f096170220106/maintainability)](https://codeclimate.com/github/MyGameListPlaceholder/my-game-list-frontend/maintainability)

A modern, responsive web application for gamers to track their game collections, write reviews, rate titles, and connect with friends. This project serves as the frontend client for the My Game List platform.

## 🚀 Features

- **Game Management:** Browse extensive game libraries, view details, and manage your personal lists (Playing, Completed, Plan to Play, etc.).
- **Social Connection:** Search for users, send friend requests, and view friend's activities.
- **Reviews & Ratings:** Rate games and write detailed reviews.
- **Advanced Search:** Filter games by company, genre, or title.
- **User Profiles:** Customize your profile and view statistics.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Mantine UI](https://mantine.dev/)
- **State Management & Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **Forms & Validation:** [Mantine Form](https://mantine.dev/form/use-form/), [Zod](https://zod.dev/)
- **API Client Generation:** [OpenAPI-TS](https://hey-api.dev/openapi-ts)
- **Testing:** [Vitest](https://vitest.dev/)
- **Linting & Formatting:** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## ⚙️ Prerequisites

- **Node.js:** v20 or higher recommended.
- **pnpm:** v10 or higher. Enable via Corepack (`corepack enable`) or install from [pnpm.io](https://pnpm.io/installation).
- **Backend:** The application relies on the [My Game List Backend](https://github.com/MyGameListPlaceholder/my-game-list-backend). Ensure you have access to the backend API and its `openapi.json` definition.

## 📥 Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/my-game-list-frontend.git
   cd my-game-list-frontend
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   The project uses environment variables. You can check `env/.env.development` for reference.
   Create a `.env` file in the root directory if you need custom configurations:

   ```bash
   VITE_API_URL=http://localhost:8000
   ```

4. **API Definition:**
   The `dev` script expects the backend's `openapi.json` file to generate the API client.
   - **Option A:** Have the backend project checked out at `../my-game-list-backend/`. The script will attempt to copy `openapi.json` from there.
   - **Option B:** Manually place the `openapi.json` file in the root of this project before running dev.

## 🏃‍♂️ Running the Application

### Development Server

Starts the Vite development server. This command will also attempt to regenerate the API client from `openapi.json`.

```bash
pnpm dev
```

### Production Build

Builds the application for production.

```bash
pnpm build
```

### Preview Production Build

Locally preview the production build.

```bash
pnpm preview
```

## 🧪 Testing & Code Quality

- **Run Tests:**

  ```bash
  pnpm test
  ```

- **Check Test Coverage:**

  ```bash
  pnpm coverage
  ```

- **Lint Code:**

  ```bash
  pnpm lint
  ```

- **Format Code:**

  ```bash
  pnpm format
  ```

## 🐳 Docker

To build and run the application using Docker:

The image bakes `VITE_*` variables into the JS bundle at build time (Vite convention), so pass the production values as build args:

1. **Build the image:**

   ```bash
   docker build \
     --build-arg VITE_API_URL=https://api.example.com \
     --build-arg VITE_KEYCLOAK_URL=https://keycloak.example.com \
     --build-arg VITE_KEYCLOAK_REALM=your-realm \
     --build-arg VITE_KEYCLOAK_CLIENT_ID=your-client-id \
     -t my-game-list-frontend .
   ```

2. **Run the container:**

   ```bash
   docker run -p 3000:8080 my-game-list-frontend
   ```

   The app is served by nginx and listens on port `8080` inside the container.

## 📂 Project Structure

```text
src/
├── assets/         # Static assets (images, logos)
├── client/         # Generated API client code (do not edit manually)
├── components/     # Reusable UI components (layout, forms, shared UI)
├── config/         # Environment configuration and validation
├── css/            # Global styles and CSS variable definitions
├── features/       # Feature modules (auth, games, collections, users, etc.)
│   └── [feature]/
│       ├── api/        # API wrapper functions
│       ├── components/ # Feature-specific components
│       ├── hooks/      # TanStack Query hooks
│       └── pages/      # Page components
├── hooks/          # Shared custom React hooks
├── lib/            # Shared library configuration (query keys, validation)
├── routes/         # TanStack Router route definitions (file-based routing)
├── theme/          # Mantine theme configuration
├── types/          # Global TypeScript type definitions
└── utils/          # Utility functions and constants
```
