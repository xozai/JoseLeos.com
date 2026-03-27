/**
 * ─── WordPress ACF Field Group: "Recommendation Fields" ───────────────────────
 * Applied to post type: portfolio_recommendation
 *
 * Create these fields in WP → ACF → Field Groups:
 *
 *  Field name       ACF type       Notes
 *  ──────────────────────────────────────────────────────────────────────
 *  category         Text           e.g. "Books", "Music", "Restaurants",
 *                                  "Tech", "Software", "Travel", "Services"
 *  subcategory      Text           Optional. e.g. "Fiction", "Fine Dining"
 *  rating           Number         1–10 int (displayed as /5, 0.5 steps).
 *                                  Store as integer; divide by 2 to render.
 *  price_range      Select         Choices: Free | $ | $$ | $$$ | $$$$
 *  pros             Repeater       Sub-field: pro (Text)
 *  cons             Repeater       Sub-field: con (Text)
 *  website_url      URL            Official product/service website
 *  purchase_url     URL            Where to buy (Amazon, App Store, etc.)
 *  affiliate_link   URL            Monetised link; used instead of purchase_url
 *  item_url         URL            Legacy field — keep for backwards compat
 *  item_image       Image          Returns: sourceUrl, altText
 *  featured         True/False     Pin to top of listing
 *  verdict          Textarea       One-paragraph bottom-line take
 *  last_reviewed    Date Picker    When the review was last updated (YYYY-MM-DD)
 *  short_description Text         One-line summary used in compact tiles
 * ──────────────────────────────────────────────────────────────────────
 *
 * GraphQL field names use camelCase (ACF auto-converts snake_case → camelCase).
 */

import { gql } from "@apollo/client";

// ─── Fragment shared by list + detail ────────────────────────────────────────
const REC_FIELDS_FRAGMENT = `
  slug
  title
  excerpt
  date
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
  recFields {
    itemUrl
    shortDescription
    affiliateLink
    category
    subcategory
    rating
    priceRange
    verdict
    featured
    lastReviewed
    websiteUrl
    purchaseUrl
    pros
    cons
    itemImage {
      sourceUrl
      altText
    }
  }
  acfVisibility {
    visibility
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Full listing — supports optional category filter */
export const GET_ALL_RECOMMENDATIONS = gql`
  query GetAllRecommendations($first: Int, $category: String) {
    recommendations(first: $first, where: { categoryName: $category }) {
      nodes {
        ${REC_FIELDS_FRAGMENT}
      }
    }
  }
`;

/** Used by the homepage "Things I Recommend" grid (legacy name kept for compat) */
export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations {
    recommendations(first: 200) {
      nodes {
        ${REC_FIELDS_FRAGMENT}
      }
    }
  }
`;

/** Six most recent for the homepage featured tile row */
export const GET_FEATURED_RECOMMENDATIONS = gql`
  query GetFeaturedRecommendations {
    recommendations(first: 6) {
      nodes {
        ${REC_FIELDS_FRAGMENT}
      }
    }
  }
`;

/** Three most recently updated for the "Recently Reviewed" homepage widget */
export const GET_LATEST_RECOMMENDATIONS = gql`
  query GetLatestRecommendations {
    recommendations(first: 3) {
      nodes {
        slug
        title
        date
        recFields {
          category
          rating
          verdict
          priceRange
          featured
          itemImage {
            sourceUrl
            altText
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        acfVisibility {
          visibility
        }
      }
    }
  }
`;

/** Full detail for the [slug] page */
export const GET_RECOMMENDATION_BY_SLUG = gql`
  query GetRecommendationBySlug($slug: ID!) {
    recommendation(id: $slug, idType: SLUG) {
      ${REC_FIELDS_FRAGMENT}
      content
    }
  }
`;

/** Minimal list for generateStaticParams and sitemap */
export const GET_ALL_RECOMMENDATION_SLUGS = gql`
  query GetAllRecommendationSlugs {
    recommendations(first: 500) {
      nodes {
        slug
        modified
      }
    }
  }
`;
