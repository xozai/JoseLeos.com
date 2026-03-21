import { gql } from "@apollo/client";

export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations {
    recommendations(first: 200) {
      nodes {
        slug
        title
        recFields {
          itemUrl
          shortDescription
          affiliateLink
          category
          itemImage {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export const GET_FEATURED_RECOMMENDATIONS = gql`
  query GetFeaturedRecommendations {
    recommendations(first: 6) {
      nodes {
        slug
        title
        recFields {
          itemUrl
          shortDescription
          category
          itemImage {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;
