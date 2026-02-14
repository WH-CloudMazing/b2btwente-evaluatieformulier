# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

B2B Twente guest evaluation form — a single-page Dutch-language form where event guests provide feedback and contact details. Submissions are emailed via Brevo API to the organization.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (Next.js core-web-vitals + typescript rules)
```

No test framework is configured.

## Architecture

Next.js 16 App Router with a single page and one API route:

- **`src/app/page.tsx`** — Server component. Renders layout with Header, EvaluatieFormulier, and Footer.
- **`src/components/EvaluatieFormulier.tsx`** — Client component. Fetches `/dates.json` on mount, filters past dates client-side, renders the full form with validation. Shows `SuccessMessage` after submit. Hides date selector when no dates are available.
- **`public/dates.json`** — Event dates file. Update every 6 months with dates from https://b2btwente.nl/bijeenkomsten. Parsed client-side so past dates are filtered per visit (no rebuild needed).
- **`src/app/api/submit/route.ts`** — POST handler. In-memory rate limiter (5/min/IP), input validation, calls `sendEmail()`.
- **`src/lib/email.ts`** — Builds HTML email and sends via Brevo REST API (`https://api.brevo.com/v3/smtp/email`). Supports optional BCC.

## Key Patterns

- **Tailwind CSS v4** via `@tailwindcss/postcss`. Theme tokens defined in `src/app/globals.css` using `@theme inline` (not `tailwind.config`).
- **Brand colors**: primary `#FF9800` (orange), error `#EB4127`, success `#3ADB76`, text `#424242`.
- **Font**: Roboto via `next/font/google`, exposed as `--font-roboto` CSS variable.
- **All UI text is Dutch.** Error messages, labels, and email content are in Dutch.
- **Form fields**: contactBron, interesse (radio: gast/lid/geen/suggestie), verbetersuggestie (conditional), naam, functie, onderneming, vestigingsplaats, telefoonnummer, email, datum.
- **Validation runs both client-side** (in `EvaluatieFormulier`) **and server-side** (in `route.ts`). Both must be kept in sync.
- **Security headers** configured in `next.config.ts` (CSP, HSTS, X-Frame-Options, etc.).

## Environment Variables

See `.env.example`. Required for email delivery:

| Variable | Purpose |
|---|---|
| `BREVO_API_KEY` | Brevo (Sendinblue) API key |
| `MAIL_FROM` | Sender email address |
| `MAIL_FROM_NAME` | Sender display name |
| `MAILTO` | Recipient email address |
| `MAIL_BCC_ENABLED` | Enable BCC (`true`/`false`) |
| `MAIL_BCC` | BCC email address |

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
