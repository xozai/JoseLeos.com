# JoseLeos.com

*Personal portfolio, blog, and recommendations site for Jose Leos.*

## Overview

JoseLeos.com is a full-stack personal site built with Next.js 16 (App Router) and a headless WordPress backend served via WPGraphQL. It combines a project portfolio, a long-form blog, and a curated recommendations section with a three-tier access control system that gates content for public visitors, authenticated members, and the site owner. All content is managed in WordPress with ACF custom fields; the Next.js frontend fetches it at build and request time via Apollo Client.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| CMS | WordPress + WPGraphQL + Advanced Custom Fields |
| Auth | NextAuth v5 beta — magic-link email via Resend |
| Database | Vercel Postgres (NextAuth session storage) |
| Cache | Vercel KV (Upstash Redis) — view counts, rate limiting |
| Email | Resend — magic-link auth, newsletter, contact form |
| Deployment | Vercel |

## Project Structure

```
JoseLeos.com/
├── .github/
│   └── workflows/
│       ├── pr-title.yml      # Conventional Commits PR title linting
│       └── release-please.yml# Automated SemVer releases
├── app/
│   ├── (auth)/               # Login, verify, error pages
│   ├── (site)/               # Public-facing site
│   │   ├── page.tsx          # Homepage
│   │   ├── about/
│   │   ├── account/          # Member account page
│   │   ├── blog/             # Blog list + [slug] detail + category/tag filters
│   │   ├── booking/          # Scheduling / booking page
│   │   ├── contact/
│   │   ├── dashboard/        # Owner-only admin dashboard
│   │   ├── newsletter/
│   │   ├── now/              # /now page (current focus)
│   │   ├── portfolio/        # Portfolio list + [slug] detail
│   │   ├── react/            # Reactions API route
│   │   ├── recommendations/  # Recommendations list + [slug] detail + RSS feed
│   │   ├── resume/
│   │   ├── speaking/
│   │   ├── subscribe/
│   │   └── uses/
│   ├── api/                  # Route handlers
│   │   ├── contact/          # Contact form submission
│   │   ├── og/               # Open Graph image generation
│   │   ├── react/            # Post reactions (KV-backed)
│   │   ├── revalidate/       # On-demand ISR cache purge
│   │   ├── save/             # Save/bookmark endpoint
│   │   ├── subscribe/        # Newsletter subscription
│   │   └── views/            # Page view counter (KV-backed)
│   ├── feed.xml/             # Site-wide RSS feed
│   ├── globals.css           # Design tokens, Tailwind theme
│   └── layout.tsx            # Root layout (Nav, Footer, Providers)
├── components/
│   ├── blog/                 # PostCard, NewsletterCTA, BlogPagination
│   ├── calendly/             # Booking/scheduling widget
│   ├── home/                 # Hero
│   ├── instagram/            # InstagramFeed
│   ├── layout/               # NavClient, Footer
│   ├── portfolio/            # ProjectCard, PortfolioGrid, CategoryFilterBar
│   ├── recommendations/      # RecCard, StarRating, PriceRange
│   └── ui/                   # Button, Badge, FadeIn, GatedCard, SearchOverlay, ThemeToggle
├── lib/
│   ├── graphql/
│   │   ├── client.ts         # Apollo Client instance
│   │   └── queries/          # WPGraphQL query definitions (posts, projects, recommendations)
│   ├── access.ts             # Visibility filtering helpers
│   ├── image.ts              # Shared blur placeholder props
│   ├── instagram.ts          # Instagram Basic Display API client
│   ├── rate-limit.ts         # KV-backed rate limiter
│   ├── site.ts               # SITE_URL, SITE_NAME constants
│   ├── types.ts              # Shared TypeScript interfaces
│   └── utils.ts              # formatDate, cn (classnames)
├── auth.ts                   # NextAuth v5 configuration
├── proxy.ts                  # Route-protection middleware
├── CHANGELOG.md
├── CONTRIBUTING.md
├── next.config.ts
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- A running WordPress instance with WPGraphQL and ACF plugins installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/joseleos/JoseLeos.com.git
   cd JoseLeos.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in the required values in `.env.local` (see [Environment Variables](#environment-variables)).

5. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:4000](http://localhost:4000) in your browser.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical base URL used in OG tags and share links (e.g. `https://joseleos.com`) |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Yes | WPGraphQL endpoint on your WordPress instance (e.g. `https://cms.joseleos.com/graphql`) |
| `NEXT_PUBLIC_WP_MEDIA_HOSTNAME` | Yes | Hostname of your WordPress media server, added to the Next.js Image allowlist |
| `NEXT_PUBLIC_TWITTER_HANDLE` | No | Twitter/X handle shown in OG tags and footer (e.g. `@joseleos`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Plausible Analytics domain (e.g. `joseleos.com`) — omit to disable analytics |
| `AUTH_SECRET` | Yes | Random string used to sign NextAuth JWTs and cookies (`openssl rand -base64 32`) |
| `AUTH_URL` | Yes | Base URL for NextAuth callbacks (set to your production URL on Vercel) |
| `AUTH_RESEND_KEY` | Yes | Resend API key used by NextAuth to send magic-link emails |
| `AUTH_EMAIL_FROM` | No | Sender address for auth emails (defaults to `Jose Leos <auth@joseleos.com>`) |
| `OWNER_EMAIL` | Yes | Email address granted owner-level access (`isOwner = true` in session) |
| `POSTGRES_URL` | Yes | PostgreSQL connection string for NextAuth session and user storage |
| `KV_REST_API_URL` | Yes | Vercel KV (Upstash Redis) REST endpoint for view counts and rate limiting |
| `KV_REST_API_TOKEN` | Yes | Authentication token for the KV REST API |
| `RESEND_API_KEY` | Yes | Resend API key for newsletter subscriptions and contact form emails |
| `RESEND_AUDIENCE_ID` | Yes | Resend audience ID where newsletter subscribers are stored |
| `CONTACT_EMAIL_TO` | Yes | Recipient address for contact form submissions |
| `HUBSPOT_ACCESS_TOKEN` | No | HubSpot private app token for syncing newsletter subscribers to a CRM list |
| `HUBSPOT_NEWSLETTER_LIST_ID` | No | Numeric ID of the HubSpot static list for newsletter subscribers |
| `INSTAGRAM_ACCESS_TOKEN` | No | Long-lived Instagram Basic Display API token (expires every 60 days) |
| `INSTAGRAM_USER_ID` | No | Numeric Instagram user ID associated with the access token |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (reserved for future OAuth provider support) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID (reserved for future OAuth provider support) |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |

## Architecture

### Content Model (WordPress/WPGraphQL)

All content is authored in WordPress and exposed via WPGraphQL. Three custom post types are used:

- **Portfolio Projects** — registered as `portfolioProject`. ACF fields include `role`, `year`, `techStack`, `projectStatus` (`completed` | `in-progress` | `paused` | `archived`), `projectCategory`, `liveUrl`, `githubUrl`, `projectGallery`, and `projectCollaborators`.
- **Posts** — standard WordPress posts used for the blog. Fields include `title`, `excerpt`, `content`, `date`, `categories`, `tags`, and a `readingTime` ACF field.
- **Recommendations** — custom post type for curated item reviews. ACF fields include `category`, `subcategory`, `rating` (1–10 integer displayed as a /5 star scale), `priceRange`, `verdict`, `shortDescription`, `itemUrl`, `affiliateLink`, `pros`, and `cons`.

All three post types share an `acfVisibility` field group that controls access tier.

### Access Control

Content visibility is controlled by an `acfVisibility.visibility` ACF field set per post. Three tiers are supported:

- **`public`** — visible to all visitors, including unauthenticated users.
- **`members`** — visible only to signed-in users. Anonymous visitors see a `GatedCard` teaser placeholder in place of the real card, prompting them to sign in.
- **`private`** — visible only to the owner (the account whose email matches `OWNER_EMAIL`). Used for draft-like content that should not be visible even to members.

Filtering is applied server-side in each page's data-fetching function via the `filterByAccess` helper in `lib/access.ts`, which reads the current NextAuth session.

### Authentication

NextAuth v5 is configured in `auth.ts` with a single Resend magic-link provider. When a user enters their email on `/login`, NextAuth sends a sign-in link via the Resend API. Clicking the link creates a session stored in Vercel Postgres via `@auth/pg-adapter`.

The `session` callback attaches an `isOwner` boolean to the session user object by comparing `session.user.email` to the `OWNER_EMAIL` environment variable. `isOwner: true` unlocks the `/dashboard` route and `private`-visibility content. The middleware in `proxy.ts` redirects unauthenticated requests to `/dashboard` and `/account` back to `/login`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server on port 4000 with Turbopack |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run test:e2e` | Run the Playwright end-to-end test suite |
| `npm run test:e2e:ui` | Run Playwright tests with the interactive UI mode |
| `npm run test:e2e:report` | Open the most recent Playwright HTML test report |

## Deployment

1. **Push to GitHub.** Ensure your branch is up to date on GitHub.

2. **Import the project on Vercel.** Go to [vercel.com/new](https://vercel.com/new), select the repository, and choose the Next.js framework preset.

3. **Set environment variables.** In the Vercel project settings under *Environment Variables*, add every `Yes`-required variable from the table above. Vercel Postgres and Vercel KV can be provisioned directly from the Vercel dashboard and will inject their connection variables automatically.

4. **Connect a custom domain.** In *Settings → Domains*, add your domain and follow the DNS instructions. Update `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to match the production domain.

5. **ISR revalidation.** Most pages use `export const revalidate = 60`, so content refreshes from WordPress within 60 seconds of a change. For immediate cache purges, call the `/api/revalidate` endpoint with the appropriate secret from a WordPress publish hook.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions and the release process. All PRs must use [Conventional Commits](https://www.conventionalcommits.org/) in the title. Releases are automated via [release-please](https://github.com/googleapis/release-please) — see [CHANGELOG.md](./CHANGELOG.md) for the version history.

## License

This project is licensed under the [MIT License](LICENSE). Source code only — written content, images, and personal work remain the property of Jose Leos.
