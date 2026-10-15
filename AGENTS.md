<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reelbound

## Project Overview

Reelbound is a small, curated streaming site for AI-generated video series.

The product combines:

* YouTube's familiar watch experience
* Netflix's series/episode model
* Douyin-style short-form video content

The goal is a polished, cinematic browsing and watching experience for a curated catalogue of AI-generated video series.

This is a **static, content-driven personal project**. Keep the architecture intentionally simple.

## Core Product Model

The primary content hierarchy is:

```text
Series
  └── Episodes
       └── Video
```

The homepage displays **series**, not individual episodes.

Users:

1. Browse the series catalogue.
2. Open a series at its first episode.
3. Watch episodes sequentially.
4. Navigate between episodes.

Hover previews are a possible future enhancement, not part of the current PoC.

There are no user accounts or per-user state.

## Experience and Visual Direction

Design Reelbound as a modern, polished video product: cinematic and distinctive, but restrained. Let the catalogue, artwork, and playback carry the experience. Use strong typography, deliberate spacing, and a limited palette to create hierarchy; avoid generic “AI” decoration such as glowing gradients, glass effects, animated blobs, and oversized ornamental type.

Every visible element should help users discover a series, understand what they are watching, or continue to another episode. Keep screens focused, with one clear primary action. Do not add controls, navigation, or feature placeholders without a real product need.

Use the existing CSS variables, spacing, typography, and radius patterns. The current UI is primarily authored in `app/globals.css`; do not add a second styling system just because Tailwind is installed. Keep content within a sensible maximum width. Prefer readable contrast and subtle, short transitions. Respect `prefers-reduced-motion`; motion should communicate feedback or state, not decorate the page.

Use familiar, accessible interactions: semantic links for navigation, buttons for actions, clear hover and pressed feedback, and visible keyboard focus. Make content cards easy to activate across their full area. Prefer native browser behavior unless there is a clear UX reason to replace it.

Reserve space for images and video to prevent layout shifts. Keep series and episode artwork at a consistent video aspect ratio. Use configured artwork when available and a deliberate fallback when it is not; the current catalogue has no thumbnail assets. Avoid overloading catalogue cards; show the artwork, title, and only useful supporting metadata. Put fuller episode information on the watch page.

Design mobile intentionally rather than shrinking desktop layouts. In particular, the watch page should place the player first, followed by episode information and the episode list. Keep the current episode obvious through more than color alone, and retain the series context while navigating.

Use reusable components where they represent genuinely repeated UI, such as `SeriesCard`, `EpisodeCard`, `VideoPlayer`, `EpisodeList`, and `Header`. Keep their responsibilities clear; do not build a large generic component for unrelated patterns.

The current core experience is:

```text
Discover a series → Open it → Watch → Continue to the next episode
```

Evaluate design changes against this loop: they should make discovery or viewing clearer, more comfortable, or more engaging. Do not describe or imply a feature is implemented unless it exists in the code.


## Engineering Standards

Approach implementation with the judgment of a senior/principal engineer experienced in Next.js, React, TypeScript, frontend architecture, web performance, and production systems.

* **Understand before changing:** Inspect the existing codebase, relevant components, package versions, and established conventions before implementing changes.
* **Follow the actual framework version:** Before writing or modifying Next.js code, consult the relevant documentation in `node_modules/next/dist/docs/`. Do not assume APIs or conventions from previous Next.js versions still apply.
* **Prefer simple, maintainable solutions:** Make the smallest coherent change that solves the problem. Avoid unnecessary abstractions, dependencies, configuration, and infrastructure.
* **Respect existing architecture:** Reuse established patterns where appropriate. Refactor only when it materially improves correctness, clarity, maintainability, or performance.
* **Think through failure cases:** Consider loading, empty, error, invalid-input, and boundary states where relevant. Avoid introducing regressions to existing functionality.
* **Validate your work:** Run the relevant lint, type-check, tests, and production build when appropriate and feasible. Fix issues introduced by your changes. Never claim a check passed unless it actually ran successfully.
* **Explain trade-offs:** For meaningful architectural decisions, briefly explain why the chosen approach fits this project's requirements and why additional complexity is unnecessary.


## UI/UX and Visual Design Standards

Approach interface design with the judgment of an experienced product designer and frontend engineer specializing in polished, content-driven streaming experiences.

* **Design for the product, not a template:** Every screen should feel purpose-built for discovering and watching curated video series. Avoid generic SaaS dashboards, boilerplate landing pages, and cookie-cutter AI-generated interfaces.
* **Prioritize visual hierarchy:** Use deliberate typography, spacing, alignment, composition, and imagery. Establish a clear focal point and primary action on each screen.
* **Make the experience feel cinematic:** Let video, artwork, and content define the experience. Use restrained colors, cohesive visual styling, subtle transitions, and consistent component treatments.
* **Design complete interactions:** Consider default, hover, focus, pressed, loading, error, and selected states wherever applicable. Ensure interactions work with both mouse and keyboard.
* **Design responsively:** Make intentional layout decisions for mobile, tablet, and desktop rather than simply shrinking desktop layouts.
* **Respect accessibility:** Maintain readable contrast, visible focus indicators, semantic HTML, accessible names, reduced-motion preferences, and appropriate keyboard behavior.
* **Maintain visual consistency:** Reuse established spacing, typography, sizing, and radius conventions. Introduce new patterns only when they solve a real design problem.
* **Avoid unnecessary UI:** Every visible element must support discovery, playback, navigation, or understanding. Do not add decorative elements or controls without a clear purpose.
* **Evaluate the finished result:** When possible, inspect the rendered interface at relevant viewport sizes. Look for awkward spacing, inconsistent alignment, overflow, poor contrast, broken interactions, and visual regressions. Fix issues rather than stopping when the code compiles.


## Homepage

The homepage should feel closer to YouTube/Netflix than Pinterest.

* Display curated series cards.
* Show configured thumbnails immediately; use the card's fallback artwork when none is configured.
* Series are the primary unit of discovery.

The current PoC has no hover video previews. If they are added later, require a dedicated preview source that can play muted and independently of the official Douyin watch player. Delay loading until interaction, allow at most one preview at a time, and stop/unload it when interaction ends. Do not load previews on initial page load. If Douyin's embed cannot provide that behavior reliably, keep cards thumbnail-only.

A featured series section may be used if it improves the visual presentation.

### Watch Page

The watch experience is the primary product experience.

Desktop layout:

```text
┌──────────────────────────────┬────────────────────┐
│                              │ Episode list       │
│                              │                    │
│          Video player        │ Episode 1          │
│                              │ Episode 2          │
│                              │ Episode 3          │
│                              │ Episode 4 ← current│
└──────────────────────────────┴────────────────────┘

Series title / episode title
Episode description

Previous Episode                 Next Episode
```

The current episode should be visually highlighted.

Mobile should stack:

1. Video player
2. Episode metadata
3. Episode list

Do not force the desktop sidebar layout onto small screens.

## Routing

Use shareable, episode-specific URLs:

```text
/series/[slug]/episode/[episode]
```

For example:

```text
/series/the-last-human/episode/4
```

The URL should uniquely identify the series and currently selected episode.

## Content Model

Content is stored as static TypeScript data.

Treat `data/series.ts` as the canonical schema. Episodes currently store a public Douyin video ID and optional player dimensions directly on the episode; series and episode artwork are optional. `previewUrl` is reserved but currently unused. Keep the model small and add fields when a real UI feature needs them.

Avoid introducing a database, CMS, or backend unless there is a clear future requirement.

## Video Architecture

Douyin is the only supported video provider for this PoC. Keep player URL construction and iframe behavior in `VideoPlayer`; keep any Douyin API lookup in a small, named helper rather than spreading it through the UI. The episode route currently looks up optional player dimensions this way. Do not build a generic multi-provider or CDN player path for hypothetical future sources; add one only when the catalogue actually needs it.

For Douyin episodes, use the official iframe player at `https://open.douyin.com/player/video?...` with a public video ID. The documented `get_iframe_by_video` API returns `iframe_code`, title, and dimensions without requiring permission application. The current code calls it for dimensions and constructs the equivalent player URL itself; it does not currently consume `iframe_code`. Do not embed a regular Douyin watch page as an iframe or scrape/download Douyin video files. If another provider becomes a real requirement, add its playback path behind the same component boundary.

## Performance

Performance is important, particularly on the homepage.

Initial page load should prioritize:

```text
Series metadata
      ↓
Configured thumbnails or fallback artwork
      ↓
User opens an episode
      ↓
Load the official Douyin player
```

If hover previews are introduced, follow the deferred, single-preview loading rules in the Homepage section.

## Architecture Philosophy

Prefer the simplest architecture that satisfies the product.

This project intentionally does **not** need:

* User accounts
* Authentication
* Database
* Backend API
* Likes
* Comments
* Saved videos
* User preferences
* Recommendation algorithms
* Categories unless they become genuinely useful
* Complex state management

Prefer static TypeScript data and Next.js server/static rendering where appropriate.

Do not introduce infrastructure merely because it is technically possible.

## Technology

Current stack:

* Next.js
* React
* TypeScript
* Tailwind CSS
* ESLint
* pnpm

Use the existing Next.js App Router structure.

Avoid adding libraries unless they provide clear value.

## Simplicity

Prefer the simplest implementation that delivers the intended experience. This is a curated, static catalogue, not a social platform. Do not add accounts, search, likes, comments, saved videos, recommendations, or other hypothetical features without a clear product requirement. Keep dependencies and infrastructure minimal.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Ignore routine debugging and unverified changes. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Keep a qualifying candidate through the reporting pass even if you resolve or work around it. A successful fix changes the report outcome; it does not erase the friction that qualified it.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `node node_modules/next/dist/bin/next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
