# NextFrame

![CI](https://github.com/yeoyujie/NextFrame/actions/workflows/ci.yml/badge.svg?branch=main)

NextFrame is a curated catalogue of AI-generated video series from Douyin. Browse a series, watch it episode by episode in Douyin's official embedded player, and continue with the next episode.

## Features

- Series-first catalogue with deliberate fallback artwork
- Shareable, episode-specific watch URLs
- Official Douyin iframe playback
- Previous and next episode navigation
- Responsive episode list that highlights the current episode
- Static TypeScript content; no database or account system

## Getting started

Use Node.js 24 and pnpm 12.10.1. The pnpm version is pinned in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

The catalogue lives in [`data/series.ts`](data/series.ts). Add a series there, including its slug, title, description, and ordered episodes. Each episode uses a public Douyin video ID. Series artwork is optional; cards show a designed fallback when no thumbnail is configured.

## Checks and deployments

GitHub Actions runs ESLint and a production build for pull requests targeting `main` and pushes to `main`. It also scans dependencies for high and critical vulnerabilities and scans Git history for exposed secrets. The security checks run weekly, and Dependabot checks for dependency and workflow updates weekly.

Vercel handles deployments through its Git integration: feature branches and pull requests get Preview deployments, while `main` deploys to Production. The GitHub workflow validates changes; it does not deploy them.

Run the same main checks locally with:

```bash
pnpm lint
pnpm build
```
