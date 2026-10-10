# NextFrame

<p align="right">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://nextframe-ivory.vercel.app/"><img src="https://img.shields.io/badge/Live%20demo-nextframe--ivory.vercel.app-black?logo=vercel&logoColor=white" alt="Live demo"></a>
  <a href="https://github.com/yeoyujie/NextFrame/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/yeoyujie/NextFrame/ci.yml?branch=main&label=CI" alt="CI status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js 16"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6"></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white" alt="pnpm 12"></a>
</p>

**Find a story. Stay for the next frame.**

NextFrame is a small, curated streaming experience for AI-generated video
series. It brings a series-first browsing model to short-form video: discover a
series, open its first episode, and keep watching in sequence through the
official Douyin player.

> This is a personal, non-commercial project. It currently has no accounts,
> payments, advertising, or user tracking.

## What it includes

- A curated catalogue of **series**, rather than a feed of unrelated videos
- Designed fallback artwork when a series has no configured thumbnail
- Shareable, episode-specific URLs such as
  `/series/the-last-human/episode/4`
- Official Douyin iframe playback, with responsive sizing for portrait video
- Previous/next episode navigation
- A responsive episode list that keeps the current episode visible and clear
- Static TypeScript content with no database, backend API, or account system
- Automated linting, production builds, dependency auditing, and secret
  scanning in GitHub Actions

The core loop is intentionally simple:

```text
Discover a series → Open an episode → Watch → Continue to the next episode
```

## Tech stack

- [Next.js](https://nextjs.org/) 16 App Router
- [React](https://react.dev/) 19
- TypeScript
- Tailwind CSS 4, alongside the project’s existing global CSS
- pnpm
- Vercel for deployment
- [Douyin’s official embedded player](https://open.douyin.com/) for video
  playback, with metadata and player dimensions retrieved through the
  [Douyin Open Platform API](https://developer.open-douyin.com/docs/resource/zh-CN/developer/introduction/overview)

There is deliberately no database or CMS. This keeps the project easy to
understand and makes the curated catalogue reproducible from source control.

## Current scope

NextFrame is currently a curated viewing platform, not a social network. There
are no user accounts, social sign-in, profiles, comments, likes, follows,
personalized recommendations, or save-for-later lists. The catalogue is
intentionally selected and maintained as static TypeScript content.

## Roadmap

Possible future work, in priority order:

- Add a backend and database when persistent user features are ready
- Support optional social sign-in and user accounts
- Let viewers save episodes or series for later
- Add viewing progress and continue-watching history
- Introduce comments and other carefully moderated community features
- Improve catalogue management with a lightweight editorial workflow
- Add richer metadata, search, and discovery tools as the catalogue grows

These are exploratory ideas, not implemented features or guarantees. Any
account or community functionality would need clear privacy, moderation,
security, and data-retention policies before launch.

## Run locally

Use Node.js 24 and pnpm 12.10.1. The pnpm version is pinned in
[`package.json`](package.json).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production-like local run:

```bash
pnpm build
pnpm start
```

## Add or update catalogue content

The canonical content model and catalogue are in
[`data/series.ts`](data/series.ts).

Each series contains:

- `slug`: stable URL segment
- `title` and `description`
- optional `thumbnail`
- an ordered `episodes` array

Each episode contains a public Douyin `videoId`, a number, and a title.
Optional `videoWidth` and `videoHeight` values can be provided when known;
otherwise the app uses the player’s portrait defaults and may look up
dimensions from Douyin’s iframe API. `previewUrl` is reserved for a future
feature and is not currently used.

Episode pages are generated from the catalogue at build time. The route is:

```text
/series/[slug]/episode/[episode]
```

Player URL construction and iframe behavior live in
[`components/video-player.tsx`](components/video-player.tsx), keeping provider
details out of the rest of the UI.

## Project structure

```text
app/                         App Router pages, layout, and global styles
components/                  Header, cards, episode list, and video player
data/series.ts               Canonical static catalogue and TypeScript types
.github/workflows/ci.yml     Lint, build, security, and dependency checks
```

## Checks and deployment

Run the main checks locally:

```bash
pnpm lint
pnpm build
```

GitHub Actions runs linting and a production build for pull requests targeting
`main` and pushes to `main`. It also runs a production dependency audit,
Dependabot/dependency review checks, and a Gitleaks history scan. The scheduled
security workflow runs weekly.

Vercel is connected through Git integration: pull requests and feature branches
receive Preview deployments, while `main` deploys to Production. GitHub Actions
validates the app; it does not perform the deployment.

## Content, copyright, and licensing

The original NextFrame source code is available under the
[MIT License](LICENSE). You may use, modify, redistribute, and commercialize
that code, provided the copyright notice and license text are preserved as
required by the license.

The video IDs and embedded videos come from Douyin and remain subject to the
rights of their respective creators, publishers, and platform terms. NextFrame
does not claim ownership of those videos, does not download or re-host them,
and uses Douyin’s official embed rather than scraping video files. The MIT
License does not grant permission to copy, redistribute, monetize, or otherwise
reuse those third-party materials. See [`NOTICE`](NOTICE) for the attribution
request and the third-party content boundary.

If you own or represent content shown in the catalogue and want it removed,
please open an issue with enough information to identify the relevant series or
episode. This README is informational, not legal advice; review the applicable
Douyin terms and local law before publishing the site or adding monetization.

## Contributing

Keep changes focused on the curated viewing experience. When adding a series,
use stable slugs, keep episode numbers ordered, verify that video IDs are
public and playable in the official embed, and run `pnpm lint` and `pnpm build`
before opening a pull request.

## License

Original NextFrame source code: [MIT License](LICENSE).

Third-party content is not covered by the MIT License. See [`NOTICE`](NOTICE)
for details.
