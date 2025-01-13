import { FormattedDate } from '@/app/components/FormattedDate';
import { urlForImage } from '@/app/lib/urlForImage';
import { client } from '@/app/lib/sanity';

interface Category {
  title: string;
}

interface Post {
  title: string;
  slug: { current: string };
  mainImage: any; // You might want to type this more specifically based on your Sanity schema
  publishedAt: string;
  description: string;
  categories: Category[];
}

async function Blog() {
  // Fetch posts from Sanity
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      title,
      slug,
      mainImage,
      publishedAt,
      description,
      categories[]->
    }
  `);

  return (
    <section className="blog-section py-[94px] bg-gray-50">
      <div className="blog-content-container px-[81px]">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-2 text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Insights, updates, and stories from our team
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: Post) => (
            <article key={post.slug.current} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
              <a href={`/blog/${post.slug.current}/`} className="block">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  {post.mainImage && (
                    <img
                      src={urlForImage(post.mainImage).width(600).height(400).url()}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                {/* Content Container */}
                <div className="p-6">
                  {/* Date */}
                  <div className="text-sm text-gray-500 mb-2">
                    <FormattedDate date={new Date(post.publishedAt)} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {post.title}
                  </h3>

                  {/* Categories */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {post.categories.map((category: Category) => (
                        <span key={category.title} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {category.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2">
                    {post.description}
                  </p>

                  {/* Read More Link */}
                  <div className="mt-4 flex items-center text-blue-600 font-medium">
                    Read More
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            View All Posts
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
      <div className="blog-nav-container">
        <div className="blog-nav-item">
          <h3>All</h3>
        </div>
      </div>
    </section>
  );
}

export default Blog;