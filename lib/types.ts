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
  };
  acfVisibility?: { visibility?: Visibility };
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
  acfVisibility?: { visibility?: Visibility };
}

// ─── Pagination ──────────────────────────────────────────
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
