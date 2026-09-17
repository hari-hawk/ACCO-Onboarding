# ACCO Onboarding — Frontend UI

React + Vite + TypeScript implementation of the Claude Design artboard
**ACCO Onboarding Final** (labor requests → union emails → document extraction → HCM filing).

The prototype's fixed 1440×900 stage was replaced by a fluid layout with real URL routing.
All visual values come from the ACCO token layer; no hex colours or pixel sizes are invented.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle in dist/
npm run preview    # serve dist/
```

## Demo identities

Sign in with Microsoft Entra ID is simulated. Pick an account:

| Account | Role | Lands on |
|---|---|---|
| Miguel Santos | Superintendent — labor requests, union emails | Dashboard |
| Dana Whitfield | Onboarding specialist — extraction, PIN, filing | Onboardings |
| Alex Porter | Superintendent with an empty workspace | Dashboard (empty states) |

Verification PIN for HCM submissions: `482917` (regenerate from the account menu as Dana).
Identity-check samples: William Stout → new hire, Marcus Okafor → rehire, Prakash Anand → Do Not Hire.
The first void-check upload always fails once so the error branch is visible.

## Structure

```
src/
  styles/        fonts.css · acco-tokens.css · base.css (from the design system) · app.css (layout + hover/focus)
  ds/            Icon · Button · IconButton · Avatar · StatCard · NavBar · StageBar — ported DS primitives
  lib/           types.ts · data.ts (seed data, vocabulary, sample records) · utils.ts
  store/         app.ts (workspace: account, requests, emails, drafts, settings — persisted to sessionStorage)
                 onboarding.ts (one extraction session: docs, stages, PIN, signature, simulated HCM calls)
  components/    AppShell (nav, notifications, account menu, PIN manager) · SelectMenu · Modal · Pill · …
  screens/       Login · Dashboard · LaborRequestForm · RequestDetail · Emails · Reports · MyProfile · OnboardingList
  screens/onboarding/  Onboarding (stage shell) · IdentityCheck · Extract · Profile · Sign · Filed · Modals
```

## Routes

| Path | Screen |
|---|---|
| `/login` | Sign in |
| `/dashboard` | Labor requests & onboarding |
| `/requests/new`, `/drafts/:key`, `/requests/:id/edit` | Labor request form |
| `/requests/:id` | Request detail (email draft, withdraw, transfer, off-platform docs) |
| `/emails` | Union emails (`?sel=<id>` opens one) |
| `/reports` | Reports (role-specific) |
| `/profile` | My profile |
| `/onboardings` | Sessions list |
| `/onboarding` | Active onboarding session (5 stages) |

## Wiring a backend

Every side effect is a store action (`src/store/*.ts`). Replace the `setTimeout`/`setInterval`
simulations in `onboarding.ts` (`simUpload`, `preUpload`, `checkIdentity`, `verifyPin`) and the
seed data in `lib/data.ts` with API calls; screens read only from the stores.

## Deploy to Vercel

Import the GitHub repository in Vercel. It detects Vite automatically:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

No rewrites are needed: the app uses hash routing, so every deep link (for example `/#/onboardings`) resolves from `index.html`. No environment variables are required; all data is mocked in `src/lib/data.ts`.
