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

export const GET_POSTS_BY_CATEGORY = gql`
  query GetPostsByCategory($categoryName: String!, $first: Int = 4) {
    posts(first: $first, where: { categoryName: $categoryName }) {
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

export const GET_ALL_POST_SLUGS = gql`
  query GetAllPostSlugs {
    posts(first: 1000) {
      nodes { slug }
    }
  }
`;

export const GET_POST_SLUGS_WITH_DATES = gql`
  query GetPostSlugsWithDates {
    posts(first: 1000) {
      nodes { slug modified }
    }
  }
`;

export const GET_POSTS_BY_TAG = gql`
  query GetPostsByTag($tagSlug: String!, $first: Int = 20, $after: String) {
    posts(first: $first, after: $after, where: { tag: $tagSlug }) {
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
        tags {
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

export const GET_ALL_CATEGORY_SLUGS = gql`
  query GetAllCategorySlugs {
    categories(first: 200) {
      nodes { slug name count }
    }
  }
`;

export const GET_ALL_TAG_SLUGS = gql`
  query GetAllTagSlugs {
    tags(first: 500) {
      nodes { slug name count }
    }
  }
`;

export const GET_POSTS_BY_CATEGORY_PAGINATED = gql`
  query GetPostsByCategoryPaginated($categoryName: String!, $first: Int = 20, $after: String) {
    posts(first: $first, after: $after, where: { categoryName: $categoryName }) {
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
