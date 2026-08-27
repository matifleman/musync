# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Musync — a music-focused social app (Spanish description in README: users upload and consume music-related content). Built with Expo + React Native + expo-router. Has an auth flow (sign-in/sign-up), a 4-tab authenticated area (home/search/create post/profile), backend integration against `../musync-api`, and a React Context + React Query for state — see Architecture and Related backend below. Still no tests.

## Commands

- `npm start` — start the Expo dev server
- `npm run android` / `npm run ios` / `npm run web` — start the dev server targeting a specific platform
- `npm run lint` — run `expo lint` (ESLint via `eslint-config-expo` flat config)
- `npm run reset-project` — runs `scripts/reset-project.js` (referenced in package.json; script not present in the repo yet)

There is no test runner configured yet. There is no `tsc` script; type-check with `npx tsc --noEmit` if needed.

## Architecture

- **Routing**: `expo-router` with typed routes enabled (`experiments.typedRoutes` in `app.json`). Routes are file-based under `app/`. `app/_layout.tsx` is the root `Stack`: it uses `Stack.Protected` guards on `useSession().currentUser` to switch between the `(app)` group (authenticated) and `sign-in`/`sign-up` (unauthenticated) — see State/auth below. The `(app)` group (`app/(app)/_layout.tsx`) defines the bottom tab navigator (home/search/create post/profile) using `@react-navigation/bottom-tabs` via expo-router's `Tabs`. `app/user/[userId].tsx` is a dynamic route for viewing another user's profile, pushed to from the search tab. Add new authenticated screens under `app/(app)/` (route file + `Tabs.Screen` entry in `app/(app)/_layout.tsx`); add unauthenticated screens as siblings of `sign-in.tsx`/`sign-up.tsx` and list them under the unauthenticated `Stack.Protected` guard in `app/_layout.tsx`.
- **Fonts**: Custom fonts (`SpaceMono-Regular`, `JetBrainsMono-Medium`) are loaded once in `app/_layout.tsx` (inside `RootNavigator`) via `useFonts`, with the splash screen held until both font loading *and* the auth bootstrap (see below) resolve. Font family names are centralized in `constants/Fonts.ts` (`FONTS`) — reference fonts through this constant rather than hardcoding family strings.
- **Theming**: There is no light/dark theme switching despite `userInterfaceStyle: "automatic"` in `app.json` — colors are a single fixed dark palette defined in `constants/Colors.ts` (`COLORS`). Components should pull colors from this constant.
- **Shared components**: `components/` is a flat directory (no `ThemedText`/`Themed*` wrapper exists). Components import `COLORS`/`FONTS` directly into local `StyleSheet.create` blocks (e.g. `components/Loading.tsx`). `AnimatedPressable.tsx` is the base pressable primitive used in place of raw RN `Pressable` throughout the app.
- **State/auth**: `contexts/AuthContext.tsx` (`SessionProvider`/`useSession()`) is the one global Context, wired at the root in `app/_layout.tsx`. It holds `currentUser`/`isBootstrapping` React state and exposes `signIn`/`signUp`/`signOut`/`setUser`, delegating the actual login/register HTTP calls to `hooks/useLoginMutation.ts`/`hooks/useSignUpMutation.ts` (React Query mutations). Actual token persistence lives outside React in `auth/authStore.ts` — access token in memory only, refresh credentials in `expo-secure-store`, with a launch-time silent refresh and a `401`-triggered refresh-and-retry (see `utilities/api.ts`). `QueryClientProvider` (`@tanstack/react-query`) wraps the app for this; there is no other global store (no Redux/Zustand/MobX) and currently no `useQuery` usage, only the two mutations above.
- **Path alias**: `@/*` maps to the repo root (configured in `tsconfig.json`), e.g. `@/constants/Colors`, `@/contexts/AuthContext`.
- **TypeScript**: `strict: true`, extending `expo/tsconfig.base`.


## Related backend
- Repo: `../musync-api` (.NET 9, Clean Architecture + CQRS/MediatR, SQLite)
- Backend integration is live: `utilities/api.ts` exports `apiFetch`, the shared fetch wrapper every authenticated call goes through (attaches the bearer token, retries once on 401 after a token refresh). Domain calls are grouped under `services/` (`searchService.ts`, `instrumentsService.ts`); env vars `EXPO_PUBLIC_API_URL`/`EXPO_PUBLIC_SERVER_URL` (in `.env`, not committed) point at the backend.
- OpenAPI type generation is set up and working: `npm run gen:types` runs `openapi-typescript` against the running backend's swagger spec and writes `types/api.d.ts` (git-ignored-looking generated file, do not hand-edit). **Gap to be aware of:** the hand-written domain types in `types/` (`User.type.ts`, `Post.type.ts`, etc.) are not yet derived from `types/api.d.ts` — they're separately authored and only loosely mirror the generated schemas. When adding a new endpoint, prefer wiring the hand-written type to the generated one (or generating fresh and diffing) over hand-typing from scratch.
- A few screens/components still use static dummy data instead of the real API — e.g. `components/CommentsModal.tsx` reads from `data/dummyComments.ts`/`data/dummyUsers.ts` since there's no comments endpoint wired up yet. Check `data/` before assuming a given feature is backend-integrated.
