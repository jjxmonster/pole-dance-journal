<!-- 9535a746-d180-4c94-b15b-67e9a9d0a492 ae9cc0ba-dbf8-4ea0-bf9b-1663400ba284 -->
# Enable Static Rendering for Index Route

## Overview

Configure TanStack Start to statically prerender the index route (`/`) at build time. This will generate a static HTML file for the homepage, improving initial load performance and SEO.

## Implementation Steps

### 1. Update vite.config.ts

Enable prerendering in the `tanstackStart` plugin configuration:

- Add `prerender: { enabled: true }` to the `tanstackStart()` plugin options
- Optionally configure prerendering settings:
- `autoSubfolderIndex: true` - generates `/index.html` instead of `index.html`
- `crawlLinks: true` - automatically discovers and prerenders linked routes
- `concurrency: 8` - number of parallel prerender jobs (adjust based on build environment)

### 2. Verify Route Configuration

The `src/routes/index.tsx` file doesn't need changes because:

- It has no `loader` function (no server-side data fetching)
- It has no `beforeLoad` function
- All components (`Hero`, `Features`, `Benefits`, `Cta`) are purely presentational
- The route is already suitable for static rendering

### 3. Build Verification

After configuration, running `pnpm build` should:

- Generate static HTML files in the output directory
- Include the index route as a prerendered page
- Maintain all existing functionality (animations, styling, etc.)

## Files to Modify

- `vite.config.ts` - Add prerender configuration to tanstackStart plugin

## Technical Details

Based on TanStack Start documentation, enabling `prerender: { enabled: true }` will:

- Automatically detect routes that can be statically rendered
- Generate HTML files at build time for those routes
- The index route qualifies because it has no server dependencies