# Musync — Product Backlog

Planned product features for Musync. Each feature spans this repo (Expo front) and `../musync-api` (.NET back).
Backend tech debt and refactors aren't listed here. They're tracked in [`musync-api/docs/refactor-plan.md`](../../musync-api/docs/refactor-plan.md).

**How to use this file**
- Check off the acceptance criteria as they're completed. A feature is done when every box in it is checked.
- When a feature is picked up, settle its *Open questions* first and write the decision into the item.
- Size: **S** ≈ a day or two · **M** ≈ a few days · **L** ≈ a week+ · **XL** ≈ multiple weeks.
- Priority: 🔴 next · 🟡 soon · ⚪ later.

**Conventions to follow** (existing patterns in the codebase)
- **Paging:** `PageNumber`/`PageSize` query params on the back (see `GetUserFollowingQuery`) and `useInfiniteQuery` on the front, with the `getNextPageParam` pattern from `hooks/useBandFollowers.ts`.
- **Band permissions:** "band leader" = `Band.CreatedById` (see `RemoveBandMemberCommandHandler`).
- **Backend commands:** CQRS slice under `Features/<Area>/[Commands|Queries]/<UseCase>/`, with the validator instantiated and called manually in the handler.
- **Contract changes:** after adding or changing an endpoint, run `npm run gen:types` and derive the hand-written type in `types/` from `types/api.d.ts`.
- **Front calls:** go through `apiFetch` in a `services/*Service.ts`, wrapped in a React Query hook in `hooks/`.

---

## Suggested order

| Phase | Features | Why this order |
|---|---|---|
| 1 — Finish the core loop | 1. Following feed + paging · 2. Post management · 3. Real comments · 4. UX polish pack | Fixes what looks built but isn't (the feed, comments) before adding surface area. |
| 2 — Growth & bands | 5. Discover · 6. Onboarding · 7. Band join requests | New users get a populated feed; bands get control over who joins. |
| 3 — Engagement & music scene | 8. Notifications · 9. Musicians wanted · 10. Gigs / events | Builds on the events and flows from phases 1–2. |

Dependencies: **6 → 5** (onboarding uses the suggestions), **8 → 3, 7** (comments and join requests generate notifications), **9 → 7** (musicians wanted leads to a join request), **10 → 8** (optional: new-gig notifications).

---

## Phase 1 — Finish the core loop

### 1. Following feed + paging
**Size:** M · **Priority:** 🔴 · **Depends on:** —

**Problem.** `GetAllPostsQueryHandler` returns every post in the database, unpaged, regardless of who you follow. The home screen's empty state already says "Start following people to watch posts", so the UI promises a following feed that doesn't exist. `Liked` is resolved by loading *all* of the user's likes on every request.

**Scope: Back**
- `GET /api/posts/feed?pageNumber&pageSize`: posts by users the caller follows plus the caller's own posts, newest first.
- Resolve `Liked` only for the posts in the returned page.
- Decide what happens to `GET /api/posts` (remove it, or keep it as an admin/explore endpoint).

**Scope: Front**
- `usePosts` → `useInfiniteQuery` (same pattern as `useBandFollowers`).
- Home `FlatList`: `onEndReached` loads the next page, with a footer spinner while fetching; keep pull-to-refresh.
- Keep the existing empty state for users who follow nobody.

**Acceptance criteria**
- [x] The feed only shows posts from followed users and yourself, newest first.
- [x] Scrolling to the end loads the next page; the last page stops requesting.
- [x] Pull-to-refresh resets to page 1.
- [x] Following or unfollowing someone is reflected on the next refresh.

**Open questions**
- Should posts by members of bands you follow show up too? (Bands can't post today.)

---

### 2. Post management
**Size:** S · **Priority:** 🔴 · **Depends on:** —

**Problem.** Posts are write-once: there's no way to edit a caption, delete a post, or open a single post. Deep links (4) and notifications (8) need a post detail screen to navigate to.

**Scope: Back**
- `GET /api/posts/{id}`: a single post, with `Liked` resolved.
- `PATCH /api/posts/{id}`: update the caption (author only).
- `DELETE /api/posts/{id}`: author only; also deletes the image file under `wwwroot/images` and the post's likes (and comments, once 3 exists).

**Scope: Front**
- "⋯" menu in `PostHeader`, shown only on your own posts: *Edit caption* / *Delete* (delete asks for confirmation in a modal, like `ConfirmLogoutModal`).
- New route `app/post/[postId].tsx`: post detail.
- Invalidate the feed and profile post queries after an edit or delete.

**Acceptance criteria**
- [x] The author can edit a caption; the change shows in the feed, profile and detail.
- [x] The author can delete a post after confirming; it disappears everywhere and the image file is removed.
- [x] A non-author gets 403 from PATCH/DELETE and never sees the menu.
- [x] `/post/{id}` opens a single post.

---

### 3. Real comments
**Size:** M · **Priority:** 🔴 · **Depends on:** —

**Problem.** `components/CommentsModal.tsx` reads `data/dummyComments.ts` / `data/dummyUsers.ts`. New comments only live in local state, and there's no backend entity or endpoint.

**Scope: Back**
- `Comment` entity (`PostId`, `AuthorId`, `Text`, `CreatedAt`) plus a migration, deleted with its post (cascade).
- `GET /api/posts/{id}/comments?pageNumber&pageSize` (newest first, see Decisions), `POST /api/posts/{id}/comments`, `DELETE /api/comments/{id}` (comment author or post author).
- Validator: text required and trimmed, max length (e.g. 500).
- Add `CommentsCount` to `PostDTO`.

**Scope: Front**
- `services/commentsService.ts`, `hooks/useComments.ts` (infinite) and `useAddComment` / `useDeleteComment` mutations.
- Wire `CommentsModal` to them; show the comment count in `PostFooter`.
- Remove `data/dummyComments.ts` and any other dummy data that ends up unused.

**Acceptance criteria**
- [x] Comments persist and show for every user who opens the post.
- [ ] Adding a comment updates the list and the count without a manual refresh.
- [x] A comment's author and the post's author can delete it; nobody else can.
- [x] No imports from `data/dummyComments.ts` remain.

The three checked boxes were verified against the running API (three accounts,
including the 403 for an unrelated caller and the cascade when the post is
deleted). The remaining box is pure client-side cache behaviour and still needs
one pass on a device/emulator, together with the long-press delete affordance.

**Decisions** (settled when the feature was picked up)
- **Flat comments, no replies.** A `ParentCommentId` makes paging ambiguous (replies would need their own cursor) for no v1 value. Stays additive later.
- **No likes on comments.** A `CommentLike` mirroring `PostLike` can be added later without changing the comment contract.
- **Pages are newest-first, rendered in an `inverted` FlatList.** The modal opens on the newest comment and scrolling up loads older pages. Oldest-first was the original sketch, but it made the modal open on ancient comments and put a just-posted comment on an unfetched page.
- **Deleting is long-press → confirm.** No trash icon and no swipe gesture, which would need a gesture library nothing else in the app uses.
- **`CommentDTO.Author` reuses `UserDTO`**, consistent with `PostDTO.Author`, rather than adding a fourth user-card shape (see `musync-api/docs/refactor-plan.md` Group 6).

---

### 4. UX polish pack
**Size:** S · **Priority:** 🟡 · **Depends on:** — (deep links to posts need 2)

Small, independent improvements. They can ship as separate small PRs alongside the other features.

**Scope: Front**
- **Skeleton loaders** in place of the `Loading` spinner on the feed, profile and band screens.
- **Optimistic updates** for like/unlike and follow/unfollow (React Query `onMutate` with rollback on error).
- **Haptics** on like, follow and successful post creation (`expo-haptics`).
- **Deep links + sharing:** `musync://user/:id`, `band/:id`, `release/:id`, `post/:id` (expo-router already maps routes). Add a share button on profile, band, release and post that uses RN `Share`.

**Acceptance criteria**
- [ ] Likes and follows respond instantly and roll back with a message if the request fails.
- [ ] The main screens show skeletons instead of a full-screen spinner on first load.
- [ ] Opening a `musync://` link lands on the right screen (after sign-in if needed).
- [ ] The share button produces a link that opens the app on that screen.

All four are implemented but every one of them is only observable on a device or
emulator, so none is ticked yet — they need one pass on a real build. What is
verified: `tsc` and lint clean, the whole app bundles, and the `musync://` URL
parser passes its cases including unknown kinds and missing ids.

**Decisions taken while implementing**
- Pages are newest-first with an `inverted` list; see feature 3's decisions.
- Like and follow were reimplemented five times across the app; they are now three
  shared mutation hooks (`useToggleLike`, `useToggleFollowUser`,
  `useToggleFollowBand`) that own the optimistic patch and the rollback. The
  per-site local mirrors and per-row pending spinners are gone.
- Skeletons cover only the screens named above. Button and paging spinners stay.
- Share links are `musync://` only — there is no associated domain or intent
  filter for `https`, so a recipient without the app gets a link their OS cannot
  open. A web fallback needs infrastructure that does not exist yet.
- The detail routes (`user/`, `band/`, `release/`, `post/`, `list/`, both edit
  screens) were reachable while signed out: `Stack.Protected` only guards screens
  declared as its children, and these were merely present on disk. They are now
  named explicitly, which is what the "after sign-in if needed" criterion needs.

---

## Phase 2 — Growth & bands

### 5. Discover / recommendations
**Size:** M · **Priority:** 🟡 · **Depends on:** —

**Problem.** The search tab is empty until you type, and a new user has no way to find people or bands. The data needed to suggest them is already stored: favourite genres and instruments on users, genres on bands.

**Scope: Back**
- `GET /api/discover/users?pageNumber&pageSize`: users ranked by the number of genres and instruments they share with you, excluding yourself and people you already follow.
- `GET /api/discover/bands?pageNumber&pageSize`: bands ranked by shared genres, excluding bands you follow or belong to.

**Scope: Front**
- Search tab with an empty query: "Suggested musicians" and "Bands you might like" sections, each with a follow button.

**Acceptance criteria**
- [ ] Suggestions never include yourself, people you already follow, or your own bands.
- [ ] Following a suggestion removes it from the list.
- [ ] A user with no genres or instruments still gets suggestions (fall back to most-followed).

---

### 6. Onboarding
**Size:** S/M · **Priority:** 🟡 · **Depends on:** 5

**Problem.** After sign-up the user lands on an empty feed with no instruments or genres set, so nothing is personalised.

**Scope: Back**
- `OnboardingCompleted` flag on `ApplicationUser` (migration), exposed on `GET /api/users/me`, plus an endpoint to set it.

**Scope: Front**
- After `signUp`, a one-time step flow: instruments → genres → follow suggestions (from 5) → home.
- Reuse `SelectInstrumentsModal` / `SelectGenresModal` content as steps. Every step can be skipped.
- Gate it in `app/_layout.tsx` based on the flag.

**Acceptance criteria**
- [ ] New users see the flow once; finishing or skipping sets the flag.
- [ ] Signing in on another device doesn't show the flow again.
- [ ] Choices made during onboarding show on the profile.

**Open questions**
- Stored flag or derived from "has genres"? (Recommendation: stored flag. Deriving it would re-trigger onboarding for anyone who clears their genres.)

---

### 7. Band join requests
**Size:** M · **Priority:** 🔴 · **Depends on:** —

**Problem.** `JoinBandCommandHandler` makes you a member immediately if the instrument slot is free. The band has no say in who joins.

**Scope: Back**
- `BandJoinRequest` entity (`BandId`, `UserId`, `InstrumentId`, `Status`: Pending/Accepted/Rejected, `Message?`, `CreatedAt`) plus a migration.
- `POST /api/bands/{id}/join` now creates a pending request (at most one pending request per user per band).
- `GET /api/bands/{id}/join-requests`: pending requests, band leader only.
- `POST /api/bands/{id}/join-requests/{requestId}/accept` / `.../reject`: leader only. Accepting re-checks that the slot is still free, then creates the `BandMember`.
- `DELETE /api/bands/{id}/join-requests/{requestId}`: the requester cancels their own request.
- Expose the caller's request status on `BandDTO` (none/pending).

**Scope: Front**
- Band page button states: *Request to join* → *Pending (cancel)* → *Member*.
- Optional message when requesting.
- A pending-requests section on the band page, visible only to the leader, with accept/reject.

**Acceptance criteria**
- [ ] Requesting doesn't add a member; accepting does.
- [ ] Only the leader can see and act on requests.
- [ ] Accepting a request for a slot that has since been filled fails with a clear error.
- [ ] The requester can cancel a pending request.

**Open questions**
- Leader only, or any member can approve? (Recommendation: leader, which matches the existing permission model.)

---

## Phase 3 — Engagement & music scene

### 8. Notifications
**Size:** L (8a in-app: M · 8b push: M) · **Priority:** 🟡 · **Depends on:** 3, 7 (2 for navigating to posts)

**Problem.** There's no way to find out that someone liked, commented on or followed you, or wants to join your band, without checking manually.

**8a — In-app activity feed**
- **Back:** `Notification` entity (`RecipientId`, `ActorId`, `Type`: Like/Comment/Follow/BandFollow/JoinRequest/JoinAccepted/NewGig, `TargetId`, `CreatedAt`, `ReadAt?`). Created inside the existing handlers (like, comment, follow, join request/accept). No notification for your own actions.
- `GET /api/notifications?pageNumber&pageSize`, `GET /api/notifications/unread-count`, `POST /api/notifications/read` (all, or by ids).
- **Front:** bell icon in the home header with an unread badge → `app/notifications.tsx` (infinite list). Tapping an item marks it read and navigates to its target (post, profile, band).

**8b — Push notifications**
- **Back:** store Expo push tokens per device (`PUT /api/users/me/push-token`, removed on logout); send through the Expo Push API when a notification is created.
- **Front:** `expo-notifications`: ask permission after login, register the token, and on tap navigate the same way as the in-app list. Needs a dev build (already in use via `expo run:android`).

**Acceptance criteria**
- [ ] Each listed event creates exactly one notification for the right recipient, and none for self-actions.
- [ ] The unread badge updates and clears when notifications are read.
- [ ] Tapping a notification (in-app or push) opens the right screen.
- [ ] Logging out stops push delivery to that device.

**Open questions**
- Group repeated likes ("Ana and 3 others liked your post")? (Recommendation: not in v1.)

---

### 9. Musicians wanted
**Size:** M · **Priority:** 🟡 · **Depends on:** 7

**Problem.** Bands already declare `RequiredInstruments`, and members fill slots per instrument. The *open* slots, meaning required instruments with no member, aren't surfaced anywhere. Matching musicians to bands is the most "Musync-specific" value the app can offer.

**Scope: Back**
- `GET /api/bands/open-slots?instrumentId&genreId&pageNumber&pageSize`: bands with at least one open slot, filtered by instrument and genre. Defaults to your favourite instruments and genres.
- Add `OpenSlots` (a list of instruments) to `BandDTO`.

**Scope: Front**
- An "Open slots" filter in search (a `FilterChips` option), listing bands and the instruments they're missing.
- A "Looking for: 🥁 Drums" badge on the band page; the call to action is *Request to join* (7).

**Acceptance criteria**
- [ ] A band shows up only while it has an unfilled required instrument.
- [ ] By default the results match your own instruments.
- [ ] Filling a slot removes it from the results.

---

### 10. Gigs / events
**Size:** L · **Priority:** ⚪ · **Depends on:** — (8 for new-gig notifications)

**Problem.** Bands have no way to announce shows, and fans can't find out where a band is playing.

**Scope: Back**
- `Gig` entity (`BandId`, `Title`, `Venue`, `City`, `StartsAt`, `TicketUrl?`) and `GigAttendee` (`GigId`, `UserId`), plus migrations.
- Band members can create, edit and delete gigs; `GET /api/bands/{id}/gigs` (upcoming, soonest first).
- `GET /api/gigs/feed`: upcoming gigs from bands you follow.
- `POST` / `DELETE /api/gigs/{id}/attend`: RSVP toggle, with an attendee count on the DTO.

**Scope: Front**
- "Upcoming shows" section on the band page; a create/edit gig screen for members.
- Gig card with date, venue, RSVP button, attendee count and ticket link (opens in the browser).
- Optional: an "upcoming gigs" strip at the top of the home feed.
- When 8 exists: a `NewGig` notification to the band's followers.

**Acceptance criteria**
- [ ] Only band members can create, edit or delete a band's gigs.
- [ ] Past gigs don't appear in the upcoming lists.
- [ ] RSVP toggles and the count updates.

**Open questions**
- Free-text venue, or a maps/location picker? (Recommendation: free text for v1.)

---

## Parked ideas

Discussed but not planned yet. Promote one to a full item above when it's picked up.

- **Audio playback:** audio files on `Song` plus a global mini-player (`expo-audio`) that keeps playing across screens. This is the biggest gap for a music app today (`Song` has only `Title`/`TrackNumber`).
- **Direct messages / band group chat:** needs real-time delivery (SignalR).
- **Account management:** password reset by email, change password, delete account.
- **Safety:** block and report users or content.
- **Richer posts:** multiple images, video, short audio clips.
- **Offline cache:** persist the React Query cache so the app opens with content offline.
