// ─── Media ───────────────────────────────────────────────
export interface WPImage {
  sourceUrl: string;
  altText: string;
  width?: number;
  height?: number;
}

// ─── Visibility ───────────────────────────────────────────
export type Visibility = "public" | "members" | "private";

// ─── Blog Posts ──────────────────────────────────────────
export interface PostListItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  categories: { nodes: { name: string; slug: string }[] };
  featuredImage: { node: WPImage } | null;
  acfVisibility?: { visibility?: Visibility };
}

export interface PostFull extends PostListItem {
  content: string;
  tags: { nodes: { name: string; slug: string }[] };
  author: { node: { name: string; avatar: { url: string } } };
  seo?: {
    title: string;
    metaDesc: string;
    opengraphImage: WPImage | null;
  };
  acfVisibility?: { visibility?: Visibility };
}

// ─── Portfolio Projects ───────────────────────────────────
export type ProjectStatus = "completed" | "in-progress" | "paused" | "archived";

export interface ProjectCollaborator {
  name: string;
  url?: string;
}

export interface ProjectListItem {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: { node: WPImage } | null;
  projectFields: {
    role: string;
    year: string;
    techStack: string[];
    featured: boolean;
    projectStatus: ProjectStatus | null;
    projectStartDate: string | null;
    projectEndDate: string | null;
    projectCategory: string | null;
    projectImpact: string | null;
  };
  acfVisibility?: { visibility?: Visibility };
}

export interface ProjectFull extends ProjectListItem {
  content: string;
  projectFields: {
    role: string;
    year: string;
    techStack: string[];
    liveUrl: string;
    githubUrl: string;
    featured: boolean;
    projectStatus: ProjectStatus | null;
    projectStartDate: string | null;
    projectEndDate: string | null;
    projectCategory: string | null;
    projectImpact: string | null;
    projectCollaborators: ProjectCollaborator[] | null;
    projectGallery: { sourceUrl: string; altText: string }[] | null;
  };
  acfVisibility?: { visibility?: Visibility };
}

// ─── Recommendations ─────────────────────────────────────
export type RecCategory = "books" | "tools" | "apps" | "courses" | "podcasts" | "gear";

/** Lightweight shape used in homepage tiles and search results */
export interface RecommendationItem {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  recFields: {
    itemUrl: string;
    itemImage: WPImage | null;
    shortDescription: string;
    affiliateLink?: string;
    category: string;
    subcategory?: string;
    rating?: number;        // 1-10 int → displayed as /5 with 0.5 steps
    priceRange?: string;    // "Free" | "$" | "$$" | "$$$" | "$$$$"
    verdict?: string;
    featured?: boolean;
    lastReviewed?: string;
    websiteUrl?: string;
    purchaseUrl?: string;
    pros?: string[];
    cons?: string[];
  };
  featuredImage?: { node: WPImage } | null;
  acfVisibility?: { visibility?: Visibility };
}

/** Full shape used on the /recommendations/[slug] detail page */
export interface RecommendationFull extends RecommendationItem {
  content?: string;
  categories?: { nodes: { name: string; slug: string }[] };
}

// ─── Pagination ──────────────────────────────────────────
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
