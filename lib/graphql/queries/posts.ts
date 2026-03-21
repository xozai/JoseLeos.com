import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        title
        excerpt
        date
        categories {
          nodes { name slug }
        }
        featuredImage {
          node { sourceUrl altText }
        }
        acfVisibility {
          visibility
        }
      }
    }
  }
`;

export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      slug
      title
      content
      excerpt
      date
      categories {
        nodes { name slug }
      }
      tags {
        nodes { name slug }
      }
      featuredImage {
        node { sourceUrl altText width height }
      }
      author {
        node {
          name
          avatar { url }
        }
      }
      acfVisibility {
        visibility
      }
    }
  }
`;

export const GET_ALL_POST_SLUGS = gql`
  query GetAllPostSlugs {
    posts(first: 1000) {
      nodes { slug }
    }
  }
`;
