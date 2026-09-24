# Design reference — ACCO Onboarding prototype

This build is the reference implementation of the Claude Design artboard *ACCO Onboarding Final*.
It exists so the production (Vue) team can diff their screens against it, by eye or by script.
The machine-readable twin of this file is served at **`/design-reference.json`** and is
regenerated on every `npm run dev` / `npm run build` by `scripts/design-reference.mjs`.
Tables marked *generated* below are rewritten by that script; edit the script, not the table.

<!-- stamp:start -->
Generated 2026-09-24T10:30:05.765Z from commit `bd4fb6c`.
<!-- stamp:end -->

## 1. Credential-free access

The app uses hash routing, so query flags go **before** the `#`:

| Flag | Values | Example |
|---|---|---|
| `as` | `miguel` (superintendent, seeded data), `dana` (onboarding specialist), `alex` (superintendent, empty workspace) | `/?as=dana#/onboardings` |
| `state` | `empty` | `/?as=miguel&state=empty#/dashboard` |

`?as=` signs the role in without the simulated Entra flow. The sign-in is stored in
`sessionStorage`, so once a tab has it you can drop the flag and navigate normally.
The verification PIN used inside flows is the demo value `482917`.

Other things worth knowing for automation:

- The root `<html>` element carries `data-app-commit`, `data-app-built-at` and, when a state
  flag is set, `data-preview-state`.
- `window.__ACCO_DESIGN__` exposes the same stamp plus the parsed flags.
- Simulated backends (uploads, HCM identity check, PIN verify, email send) run on timers of
  roughly 0.6–2.4 s. Wait for `[data-ds="dialog"]` to disappear rather than sleeping.
- The onboarding flow has a 30-minute session window that starts after the identity check.
  Expiry clears the session, navigates to `/#/onboardings` and adds a "Delayed" row to Reports.
  CI that stops on the extract step for a long time will see this behaviour.

## 2. Test hooks (`data-ds`)

Stable attributes on every design-meaningful element. Class names and DOM shape may change;
these names will not. *Generated:*

<!-- hooks:start -->
| Selector | Uses | Files |
|---|---|---|
| `[data-ds="account-menu"]` | 1 | `src/components/AppShell.tsx` |
| `[data-ds="cta-primary"]` | 1 | `src/ds/Button.tsx` |
| `[data-ds="cta-secondary"]` | 1 | `src/ds/Button.tsx` |
| `[data-ds="dialog"]` | 1 | `src/components/Modal.tsx` |
| `[data-ds="empty-state"]` | 1 | `src/components/EmptyState.tsx` |
| `[data-ds="form-field"]` | 28 | `src/screens/LaborRequestForm.tsx`, `src/screens/onboarding/IdentityCheck.tsx`, `src/screens/onboarding/Sign.tsx` |
| `[data-ds="kiosk-banner"]` | 1 | `src/components/AppShell.tsx` |
| `[data-ds="kpi-tile"]` | 1 | `src/ds/StatCard.tsx` |
| `[data-ds="nav-bar"]` | 1 | `src/ds/NavBar.tsx` |
| `[data-ds="nav-item"]` | 1 | `src/ds/NavBar.tsx` |
| `[data-ds="notification-item"]` | 1 | `src/components/AppShell.tsx` |
| `[data-ds="notifications-popover"]` | 1 | `src/components/AppShell.tsx` |
| `[data-ds="page-title"]` | 9 | `src/screens/Dashboard.tsx`, `src/screens/Emails.tsx`, `src/screens/LaborRequestForm.tsx`, `src/screens/MyProfile.tsx`, `src/screens/OnboardingList.tsx`, `src/screens/ReportRecord.tsx`, `src/screens/Reports.tsx`, `src/screens/RequestDetail.tsx`, `src/screens/onboarding/Onboarding.tsx` |
| `[data-ds="section-card"]` | 28 | `src/screens/Dashboard.tsx`, `src/screens/Emails.tsx`, `src/screens/LaborRequestForm.tsx`, `src/screens/MyProfile.tsx`, `src/screens/OnboardingList.tsx`, `src/screens/ReportRecord.tsx`, `src/screens/Reports.tsx`, `src/screens/RequestDetail.tsx`, `src/screens/onboarding/Extract.tsx`, `src/screens/onboarding/Filed.tsx`, `src/screens/onboarding/IdentityCheck.tsx`, `src/screens/onboarding/Profile.tsx`, `src/screens/onboarding/Sign.tsx` |
| `[data-ds="select"]` | 1 | `src/components/SelectMenu.tsx` |
| `[data-ds="session-timer"]` | 1 | `src/components/SessionTimer.tsx` |
| `[data-ds="sign-in-card"]` | 1 | `src/screens/Login.tsx` |
| `[data-ds="stage-bar"]` | 1 | `src/ds/StageBar.tsx` |
| `[data-ds="status-badge"]` | 1 | `src/components/Pill.tsx` |
| `[data-ds="table-row"]` | 7 | `src/screens/Dashboard.tsx`, `src/screens/Emails.tsx`, `src/screens/OnboardingList.tsx`, `src/screens/Reports.tsx` |
| `[data-ds="toast"]` | 1 | `src/components/AppShell.tsx` |

Modifier attributes: `data-ds-active`, `data-ds-tone`, `data-ds-variant`.
<!-- hooks:end -->

Conventions:

- `page-title` is exactly one `<h1>` per screen.
- `kpi-tile`, `table-row`, `status-badge`, `cta-primary`, `nav-item`, `form-field`,
  `section-card` are the ones the Vue team asked for. `cta-primary` is the design's *action*
  (gold) and *primary* (navy) button variants; everything else is `cta-secondary`, with the
  exact variant in `data-ds-variant`.
- `status-badge` carries `data-ds-tone` (`ok`, `warn`, `bad`, `navy`, `muted`, …) when the
  badge uses a semantic tone; status maps with bespoke colours still get the badge hook.
- `nav-item` marks the active tab with `data-ds-active="true"`.
- `table-row` rows on Reports are `<button>`s (they open the record); on Dashboard and Emails
  they are `<div role="row">`.

## 3. Screen states

*Generated:*

<!-- states:start -->
| State | Status | Example | Notes |
|---|---|---|---|
| empty | **final** | `/?as=alex#/dashboard` | Alex is the seeded empty workspace; ?state=empty forces empty lists for any role. |
| loading | **not-started** |  | Skeleton "Paper" placeholders exist only inside the onboarding extract step; no page-level loading design. |
| error | **not-started** |  | No error/offline state was designed. Simulated backends never fail except the scripted identity outcomes. |
| mobile | **in-progress** |  | Artboard is 1440×900. The build is fluid down to ~360px, but narrow layouts are engineering judgement, not design. |
<!-- states:end -->

## 4. Per-screen status

`final` = matches the artboard and the reviewed prototype exports. `in-progress` = built but
knowingly diverging. `not-started` = no design exists, do not copy. *Generated:*

<!-- screens:start -->
| Route | Screen | Status | Roles | Notes |
|---|---|---|---|---|
| `/login` | Login | **final** | miguel, dana, alex | Entra sign-in is simulated; any listed demo identity signs in. |
| `/` | Landing redirect | **final** | miguel, dana, alex | Redirects to /dashboard (superintendents) or /onboardings (specialist). |
| `/dashboard` | Dashboard | **final** | miguel, alex | "Next on requests" guidance block hidden by flag (SHOW_NEXT_STEP_GUIDANCE). |
| `/requests/new` | LaborRequestForm | **final** | miguel, alex | Classification footer note hidden by flag; start date uses the custom DateTimePicker. |
| `/requests/:id` | RequestDetail | **final** | miguel, alex | "What happens next" guidance block hidden by flag. |
| `/requests/:id/edit` | LaborRequestForm | **final** | miguel, alex |  |
| `/drafts/:key` | LaborRequestForm | **final** | miguel, alex |  |
| `/emails` | Emails | **final** | miguel, alex |  |
| `/reports` | Reports | **final** | miguel, dana, alex | Rows open /reports/record/:ref. Expired 30-minute sessions appear as "Delayed". |
| `/reports/record/:ref` | ReportRecord | **final** | miguel, dana, alex |  |
| `/profile` | MyProfile | **final** | miguel, dana, alex |  |
| `/onboardings` | OnboardingList | **final** | dana | Superintendents are redirected; the list is specialist-only by design. |
| `/onboarding` | Onboarding | **final** | miguel, dana, alex | Stages: identity → extract → profile → sign → filed. 30-minute session timer starts after identity check. |
<!-- screens:end -->

## 5. Version stamp

Each deploy stamps the short commit SHA and build time into the page (`<html data-app-commit>`),
the global, and `/design-reference.json` (`commit`, `builtAt`). On Vercel the SHA comes from
`VERCEL_GIT_COMMIT_SHA`; locally from `git rev-parse`. Compare the JSON `commit` with the
GitHub `main` head to know whether you are looking at the latest reference.

## 6. Intentional constraints (do not treat as bugs)

- **Hash routing.** Chosen so the static build runs from any path (Vercel, the claude.ai
  artifact, a local file). Production can use history routing; route names are what matter.
- **Fluid layout instead of the 1440×900 stage.** The artboard is a fixed canvas. The build is
  fluid and wraps below ~1100px; anything narrower than the artboard is engineering judgement.
- **Hidden guidance blocks.** "Next on requests" (dashboard), "What happens next" (request
  detail) and the classification footer note (request form) are hidden by
  `SHOW_NEXT_STEP_GUIDANCE = false` in `src/lib/flags.ts` per ACCO review. The markup is kept
  so they can be restored. All other disclaimers remain.
- **Simulated backends and seeded data.** No network calls. Demo identities, union emails,
  sessions and report metrics are constants in `src/lib/data.ts`. Numbers on KPI tiles are
  illustrative, not a data contract.
- **Session persistence is per tab.** Workspace and onboarding state live in `sessionStorage`
  (`acco-onboarding-workspace`, `acco-onboarding-session`). A new tab starts clean.
- **Static session labels.** Rows in the onboarding list say things like "Queued — moved by
  M. Santos" as fixed copy; production derives these from state.
- **Scripted identity outcomes.** The HCM identity check returns new-hire / existing-worker /
  Do-Not-Hire based on the sample chosen, not on the uploaded file.
- **Icons.** lucide-react through an explicit registry (`src/ds/Icon.tsx`); names match the
  design's icon names, including the aliases `loader-2` and `unlock`.
- **Fonts.** Inter via Google Fonts, SF Mono from bundled OTFs. Production may substitute a
  licensed mono; keep the metric-compatible fallback stack in `src/styles/fonts.css`.
- **Tokens.** `src/styles/acco-tokens.css` is the single source (count reported in the JSON).
  Do not re-type them; copy the file.
- **Accessibility fixes are part of the design.** Heading order, landmarks, grid roles on
  custom tables, focus trapping in dialogs, the skip link and live regions were added after an
  axe-core audit and are intended to carry over.
