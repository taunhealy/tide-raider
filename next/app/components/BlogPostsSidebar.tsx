import { urlForImage } from '@/app/lib/urlForImage';
import { client } from '@/app/lib/sanity';
import { FormattedDate } from './FormattedDate';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

interface Post {
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  description: string;
  categories: { title: string }[];
}

interface BlogPostsSidebarProps {
  posts: Post[];
}

export default function BlogPostsSidebar({ posts }: BlogPostsSidebarProps) {
  // Filter posts with Travel category
  const travelPosts = posts.filter(post => 
    post.categories?.some(category => category.title === 'Travel')
  );

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold text-gray-800 ${inter.className}`}>
          Travel Posts
        </h3>
        <Link href="/blog?category=Travel" className="text-sm text-[var(--color-text-secondary)] hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-6">
        {travelPosts.slice(0, 3).map((post) => (
          <Link 
            key={post.slug.current} 
            href={`/blog/${post.slug.current}`}
            className="group block"
          >
            <article className="flex gap-4">
              {post.mainImage && (
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={urlForImage(post.mainImage).width(80).height(80).url()}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-1 truncate group-hover:text-[var(--color-text-secondary)] transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {post.description}
                </p>
                <div className="mt-1 text-xs text-gray-400">
                  <FormattedDate date={new Date(post.publishedAt)} />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
} 