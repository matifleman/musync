# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Musync — a music-focused social app (Spanish description in README: users upload and consume music-related content). Built with Expo + React Native + expo-router. Currently very early-stage: three tab screens (home, search, profile), no backend, no state management, no tests yet.

## Commands

- `npm start` — start the Expo dev server
- `npm run android` / `npm run ios` / `npm run web` — start the dev server targeting a specific platform
- `npm run lint` — run `expo lint` (ESLint via `eslint-config-expo` flat config)
- `npm run reset-project` — runs `scripts/reset-project.js` (referenced in package.json; script not present in the repo yet)

There is no test runner configured yet. There is no `tsc` script; type-check with `npx tsc --noEmit` if needed.

## Architecture

- **Routing**: `expo-router` with typed routes enabled (`experiments.typedRoutes` in `app.json`). Routes are file-based under `app/`. The `(tabs)` group (`app/(tabs)/_layout.tsx`) defines the bottom tab navigator (home/search/profile) using `@react-navigation/bottom-tabs` via expo-router's `Tabs`. Add new screens by adding files under `app/`, and new tabs by adding both a route file and a `Tabs.Screen` entry in `app/(tabs)/_layout.tsx`.
- **Fonts**: Custom fonts (`SpaceMono-Regular`, `JetBrainsMono-Medium`) are loaded once in `app/(tabs)/_layout.tsx` via `useFonts`, with the splash screen held until loading resolves. Font family names are centralized in `constants/Fonts.ts` (`FONTS`) — reference fonts through this constant rather than hardcoding family strings.
- **Theming**: There is no light/dark theme switching despite `userInterfaceStyle: "automatic"` in `app.json` — colors are a single fixed dark palette defined in `constants/Colors.ts` (`COLORS`). Components should pull colors from this constant.
- **Shared components**: `components/ThemedText.tsx` wraps RN `Text` and applies `COLORS.white` plus optional `fontFamily`/`fontSize` props from the constants above. Prefer extending this pattern (a `Themed*` wrapper reading from `constants/`) for new shared UI rather than styling RN primitives ad hoc.
- **Path alias**: `@/*` maps to the repo root (configured in `tsconfig.json`), e.g. `@/constants/Colors`, `@/components/ThemedText`.
- **TypeScript**: `strict: true`, extending `expo/tsconfig.base`.


## Related backend
- Repo: `../musync-api` (.NET 9, Clean Architecture + CQRS/MediatR, SQLite)
- No backend integration or OpenAPI-based type generation set up yet — pending setup
- Once configured: API types will be generated automatically from `musync-api`'s spec — never hand-write request/response types
