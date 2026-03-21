// ─── Media ───────────────────────────────────────────────
export interface WPImage {
  sourceUrl: string;
  altText: string;
  width?: number;
  height?: number;
}

// ─── Blog Posts ──────────────────────────────────────────
export interface PostListItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  categories: { nodes: { name: string; slug: string }[] };
  featuredImage: { node: WPImage } | null;
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
}

// ─── Portfolio Projects ───────────────────────────────────
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
  };
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
  };
}

// ─── Recommendations ─────────────────────────────────────
export type RecCategory = "books" | "tools" | "apps" | "courses" | "podcasts" | "gear";

export interface RecommendationItem {
  slug: string;
  title: string;
  recFields: {
    itemUrl: string;
    itemImage: WPImage | null;
    shortDescription: string;
    affiliateLink?: string;
    category: RecCategory;
  };
}

// ─── Pagination ──────────────────────────────────────────
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
