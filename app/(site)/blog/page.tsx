import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import { apolloClient } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries/posts";
import type { PostListItem } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles, essays, and notes by Jose Leos on design, development, and more.",
};

export default async function BlogPage() {
  let posts: PostListItem[] = [];

  try {
    const res = await apolloClient.query({ query: GET_POSTS, variables: { first: 20 } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res.data as any;
    posts = data?.posts?.nodes ?? [];
  } catch {
    /* show empty state */
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-[--foreground] mb-3">Blog</h1>
        <p className="text-lg text-[--foreground-muted]">
          Thoughts on design, development, and things I&apos;m figuring out.
        </p>
      </header>

      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-[--foreground-muted]">
          <p>No posts yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
