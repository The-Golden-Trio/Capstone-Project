# DATN

Capstone project monorepo — React frontend + NestJS backend, managed with Nx and pnpm.

## Structure

```
apps/
  web/    React app (Vite)
  api/    NestJS app
```

## Prerequisites

- Node.js 22+
- pnpm 10+

## Getting started

```sh
pnpm install
```

Run the backend:

```sh
pnpm exec nx serve api
```

Run the frontend:

```sh
pnpm exec nx serve web
```

The API listens on `http://localhost:3000/api`, the web app on `http://localhost:4200`.

## Common tasks

```sh
pnpm exec nx run-many -t lint test build typecheck   # run for all projects
pnpm exec nx build web                                # single project
pnpm exec nx graph                                     # visualize the project graph
```
