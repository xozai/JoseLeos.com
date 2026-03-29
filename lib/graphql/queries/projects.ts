import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects {
    portfolioProjects(first: 100) {
      nodes {
        slug
        title
        excerpt
        featuredImage {
          node { sourceUrl altText }
        }
        projectFields {
          role
          year
          techStack
          featured
          projectStatus
          projectStartDate
          projectEndDate
          projectCategory
          projectImpact
        }
        acfVisibility {
          visibility
        }
      }
    }
  }
`;

export const GET_FEATURED_PROJECTS = gql`
  query GetFeaturedProjects {
    portfolioProjects(first: 100, where: { metaQuery: { metaArray: [{ key: "featured", value: "1" }] } }) {
      nodes {
        slug
        title
        excerpt
        featuredImage {
          node { sourceUrl altText }
        }
        projectFields {
          role
          year
          techStack
          featured
          projectStatus
          projectStartDate
          projectEndDate
          projectCategory
          projectImpact
        }
        acfVisibility {
          visibility
        }
      }
    }
  }
`;

export const GET_PROJECT_BY_SLUG = gql`
  query GetProjectBySlug($slug: ID!) {
    portfolioProject(id: $slug, idType: SLUG) {
      slug
      title
      content
      excerpt
      featuredImage {
        node { sourceUrl altText width height }
      }
      projectFields {
        role
        year
        techStack
        liveUrl
        githubUrl
        featured
        projectStatus
        projectStartDate
        projectEndDate
        projectCategory
        projectImpact
        projectCollaborators {
          collabName
          collabUrl
        }
        projectGallery {
          sourceUrl
          altText
        }
      }
      acfVisibility {
        visibility
      }
    }
  }
`;

export const GET_ALL_PROJECT_SLUGS = gql`
  query GetAllProjectSlugs {
    portfolioProjects(first: 1000) {
      nodes {
        slug
        projectFields { projectStatus }
      }
    }
  }
`;

export const GET_PROJECT_SLUGS_WITH_DATES = gql`
  query GetProjectSlugsWithDates {
    portfolioProjects(first: 1000) {
      nodes {
        slug
        modified
        projectFields { projectStatus }
      }
    }
  }
`;
