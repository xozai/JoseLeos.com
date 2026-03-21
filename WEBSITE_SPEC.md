# JoseLeos.com — Personal Website Specification & Build Prompt

## Overview

A personal website serving three distinct purposes:
1. **Portfolio** — showcase professional work, projects, and skills
2. **Blog** — publish articles, insights, and long-form writing
3. **Recommendations** — curated list of tools, books, products, and resources

---

## Architecture Recommendation

### Recommended: Headless WordPress + Next.js (App Router)

This is the best balance of WordPress familiarity and modern web performance.

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ Portfolio│ │   Blog   │ │  Recommendations   │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
│         Static Generation + ISR (fast, SEO-ready)  │
└────────────────────┬────────────────────────────────┘
                     │ GraphQL (WPGraphQL)
┌────────────────────▼────────────────────────────────┐
│              BACKEND (Headless WordPress)            │
│  Posts / Pages / Custom Post Types / ACF Fields     │
│  REST API + WPGraphQL Plugin                        │
└─────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  HOSTING                            │
│  Frontend → Vercel (free tier / Pro)                │
│  WordPress → Hetzner VPS or WP Engine               │
└─────────────────────────────────────────────────────┘
```

**Why headless over traditional WordPress:**
- Page load scores 95+ on Lighthouse (WordPress themes typically score 60-80)
- Full design control without theme constraints
- Decoupled frontend can be rebuilt without touching content
- Next.js App Router enables per-page rendering strategies (SSG, ISR, SSR)

### Alternative Architectures (if you want simpler ops)

| Option | Stack | Best For | Trade-off |
|---|---|---|---|
| **A** (Recommended) | Headless WP + Next.js | Full control + WP familiarity | More initial setup |
| **B** | Astro + Sanity CMS | Blazing fast, great DX | Learn new CMS |
| **C** | Ghost Pro | Blog-first, newsletters built-in | Less portfolio flexibility |
| **D** | Traditional WordPress | Quickest start | Slower, theme-locked |

---

## Technology Stack (Option A — Recommended)

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** next/font (Google Fonts — self-hosted)
- **Image optimization:** next/image

### Backend / CMS
- **CMS:** WordPress (self-hosted, headless)
- **Data fetching:** WPGraphQL plugin + Apollo Client
- **Custom fields:** Advanced Custom Fields (ACF) Pro
- **Media:** WordPress Media Library → served via CDN (Cloudflare or BunnyCDN)

### Infrastructure
- **Frontend hosting:** Vercel
- **WordPress hosting:** Hetzner CX22 VPS (~$4/mo) with Coolify, or WP Engine
- **CDN:** Cloudflare (free tier)
- **Domain:** Cloudflare Registrar
- **SSL:** Auto via Cloudflare / Let's Encrypt
- **Analytics:** Plausible (privacy-first) or Vercel Analytics
- **Forms:** Resend (email) + react-hook-form + zod

---

## Site Structure & Pages

```
joseLeos.com/
├── /                        → Home (hero, featured work, recent posts, picks)
├── /about                   → About me + resume/CV download
├── /portfolio               → Work index
│   └── /portfolio/[slug]    → Individual project case study
├── /blog                    → Blog post index (paginated)
│   └── /blog/[slug]         → Individual post
├── /recommendations         → Curated recommendations index
│   └── /recommendations/[category] → Filtered by category (books, tools, etc.)
├── /contact                 → Contact form
└── /uses                    → Optional: tools & gear I use (popular in dev community)
```

---

## Feature Breakdown

### 1. Portfolio Section
- Project cards with cover image, title, tags, short description
- Individual case study pages: problem → process → outcome
- Tech stack / skills tags with filtering
- External links (live site, GitHub)
- Password-protected projects for client work (WordPress native)
- **Custom Post Type:** `portfolio_project`
- **ACF Fields:** cover_image, role, year, tech_stack[], live_url, github_url, featured (boolean)

### 2. Blog Section
- Full-featured article pages with table of contents
- Syntax highlighting for code blocks (Shiki or Prism)
- Reading time estimate
- Category and tag filtering
- Open Graph / Twitter card meta per post (next-seo or next/metadata)
- RSS feed (`/feed.xml`) — generated from WPGraphQL
- Related posts (by category or tag)
- **WordPress native:** Posts, Categories, Tags

### 3. Recommendations Section
- Curated list of books, tools, apps, courses, podcasts, etc.
- Each item: image, name, description, link, category, rating (optional)
- Filter by category
- Affiliate link support (wrapped URLs)
- **Custom Post Type:** `recommendation`
- **ACF Fields:** item_image, item_url, category, short_description, affiliate_link

### 4. Home Page
- Hero section: name, one-liner, CTA buttons (View Work / Read Blog)
- Featured portfolio pieces (3-4 items marked `featured: true`)
- Latest blog posts (3 most recent)
- Top recommendations / picks of the month
- Skills / technology logos strip

### 5. About Page
- Bio with photo
- Timeline of career highlights
- Skills matrix
- Resume/CV download (PDF)
- Social links

### 6. Contact Page
- Contact form (name, email, subject, message)
- Form submissions → email via Resend API
- Honeypot spam protection
- Social media links

---

## SEO Strategy

- **next/metadata** for all static and dynamic pages
- Dynamic Open Graph image generation (`/api/og`) using `@vercel/og`
- Sitemap auto-generated (`next-sitemap` or App Router sitemap.ts)
- robots.txt
- Structured data (JSON-LD) for blog posts (Article schema) and portfolio (CreativeWork schema)
- Canonical URLs
- Slug-based URLs (no IDs in URLs)

---

## Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | 95+ |
| Lighthouse SEO | 100 |
| Lighthouse Accessibility | 95+ |
| Core Web Vitals LCP | < 2.5s |
| Core Web Vitals CLS | < 0.1 |
| Core Web Vitals INP | < 200ms |

**Achieved via:**
- Static Site Generation (SSG) for portfolio and blog posts
- Incremental Static Regeneration (ISR) with 60s revalidation for fresh content
- next/image for automatic WebP conversion and lazy loading
- Self-hosted fonts via next/font
- Cloudflare CDN caching

---

## Design System

### Tokens to Define
- Color palette: primary, secondary, neutral scale, surface, background
- Typography scale: hero, h1–h4, body, caption, code
- Spacing scale: 4px base grid
- Border radius: sm, md, lg, full
- Shadow levels: none, sm, md, lg

### Themes
- Light and dark mode (CSS custom properties + `next-themes`)
- System preference detection + manual toggle

### Component Library (build from scratch or use as base)
- Button (primary, secondary, ghost, icon)
- Card (portfolio card, blog card, recommendation card)
- Badge / Tag
- Navigation (desktop + mobile hamburger)
- Footer
- CodeBlock (syntax highlighted)
- TOC (table of contents, sticky on desktop)
- Pagination
- FilterBar (for portfolio and recommendations)

---

## WordPress CMS Setup Checklist

```bash
# Plugins to install
- WPGraphQL                    # GraphQL API
- WPGraphQL for ACF            # Expose ACF fields via GraphQL
- Advanced Custom Fields Pro   # Custom fields for CPTs
- Yoast SEO (optional)         # SEO meta (or manage via Next.js)
- Cloudflare (optional)        # CDN integration
- WP Offload Media             # Serve media from S3/BunnyCDN

# Custom Post Types to register (via functions.php or CPT UI plugin)
- portfolio_project
- recommendation
```

---

## Content Model (GraphQL Queries)

### Portfolio Projects
```graphql
query GetProjects {
  portfolioProjects(first: 100) {
    nodes {
      slug
      title
      excerpt
      featuredImage { node { sourceUrl altText } }
      projectFields {
        role
        year
        techStack
        liveUrl
        githubUrl
        featured
      }
    }
  }
}
```

### Blog Posts
```graphql
query GetPosts($after: String) {
  posts(first: 10, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      slug
      title
      excerpt
      date
      readingTime
      categories { nodes { name slug } }
      featuredImage { node { sourceUrl altText } }
    }
  }
}
```

### Recommendations
```graphql
query GetRecommendations($category: String) {
  recommendations(where: { taxQuery: { taxArray: [{ taxonomy: RECCAT, field: SLUG, terms: [$category] }] } }) {
    nodes {
      slug
      title
      recFields {
        itemUrl
        itemImage { sourceUrl }
        shortDescription
        affiliateLink
      }
    }
  }
}
```

---

## Build Prompt (for AI-assisted Development)

Use the following prompt when starting implementation with an AI coding assistant:

---

```
You are building a personal website for Jose Leos (joseLeos.com) using:
- Next.js 15 with App Router and TypeScript
- Tailwind CSS v4 for styling
- Headless WordPress as the CMS, queried via WPGraphQL (GraphQL)
- Vercel for hosting

The site has three main sections:
1. Portfolio — showcase professional projects
2. Blog — long-form articles
3. Recommendations — curated resource lists

### Project Structure
/app
  /(site)
    /layout.tsx              — shared layout: nav + footer
    /page.tsx                — home page
    /about/page.tsx
    /portfolio/page.tsx
    /portfolio/[slug]/page.tsx
    /blog/page.tsx
    /blog/[slug]/page.tsx
    /recommendations/page.tsx
    /recommendations/[category]/page.tsx
    /contact/page.tsx
  /api
    /og/route.tsx            — dynamic OG image
    /revalidate/route.ts     — ISR webhook from WordPress
/components
  /ui                        — base components (Button, Card, Badge, etc.)
  /layout                    — Nav, Footer, MobileMenu
  /portfolio                 — ProjectCard, ProjectGrid, CaseStudy
  /blog                      — PostCard, PostGrid, TOC, CodeBlock
  /recommendations           — RecCard, RecGrid, CategoryFilter
  /home                      — Hero, FeaturedWork, LatestPosts, TopPicks
/lib
  /graphql
    /client.ts               — Apollo Client setup
    /queries/
      posts.ts
      projects.ts
      recommendations.ts
  /utils.ts
  /types.ts
/styles
  /globals.css               — Tailwind base + CSS custom properties

### Key Requirements
- All portfolio and blog pages use generateStaticParams for SSG
- ISR revalidation every 60 seconds (revalidate = 60)
- WordPress webhook hits /api/revalidate to trigger on-demand ISR when content is published
- Dark mode via next-themes with system default
- Contact form posts to /api/contact which sends email via Resend
- Sitemap at /sitemap.xml generated via App Router sitemap.ts
- Dynamic OG images at /api/og?title=...&type=blog|portfolio
- All images via next/image with proper sizes and priority on above-fold images
- Structured data (JSON-LD) injected in layout for blog posts and portfolio pages

### Coding Standards
- TypeScript strict mode
- Functional components only, no class components
- Server Components by default; only add 'use client' when interactivity is needed
- Co-locate types with their files; export shared types from /lib/types.ts
- No inline styles; use Tailwind utility classes
- Fetch all data server-side in Server Components (no client-side fetching for content)

Start by scaffolding the project with: npx create-next-app@latest joseLeos.com --typescript --tailwind --app --src-dir=false --import-alias="@/*"
Then set up the GraphQL client in /lib/graphql/client.ts pointing to the WordPress GraphQL endpoint at NEXT_PUBLIC_WORDPRESS_URL/graphql.
```

---

---

## E-commerce (Optional Future Addition)

If you want to sell products or services later:
- **Digital products:** Lemon Squeezy (hosted, no WooCommerce needed) — embed buy buttons
- **Services/consulting:** Cal.com for scheduling + Stripe for payments
- **Physical prints:** Printful + WooCommerce (or Etsy embed)

Avoid WooCommerce on headless unless absolutely necessary — it adds significant complexity.

---

## Recommended Launch Checklist

- [ ] Domain configured on Cloudflare with proxied A record
- [ ] WordPress installed on VPS, accessible only via subdomain (e.g., `cms.joseLeos.com`)
- [ ] WPGraphQL + ACF plugins installed and configured
- [ ] Custom Post Types registered: `portfolio_project`, `recommendation`
- [ ] Next.js project deployed to Vercel with env vars set
- [ ] `NEXT_PUBLIC_WORDPRESS_URL`, `RESEND_API_KEY`, `ISR_REVALIDATE_SECRET` in Vercel env
- [ ] Contact form tested end-to-end
- [ ] Lighthouse scores verified (target 95+ performance)
- [ ] Google Search Console verified
- [ ] Plausible / Vercel Analytics connected
- [ ] OG images tested with opengraph.xyz
- [ ] RSS feed validated at validator.w3.org/feed/
- [ ] robots.txt and sitemap.xml verified
