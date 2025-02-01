import { client } from "@/app/lib/sanity";
import { groq } from "next-sanity";
import HeroBlogSection from "@/app/sections/HeroBlog";
// ... import other blog sections as needed

// Hardcoded section structure
const BLOG_SECTIONS = [
  { type: "heroBlog", component: HeroBlogSection },
  // Add other sections in the exact order you want them to appear
  // { type: "blogList", component: BlogListSection },
  // { type: "newsletter", component: NewsletterSection },
];

// Query only for section content, not structure
async function getBlogPage() {
  return client.fetch(groq`{
    "heroBlog": {
      "posts": *[_type == "post"] | order(publishedAt desc) [0...5] {
        _id,
        title,
        slug,
        mainImage,
        publishedAt,
        description,
        location,
        template->{
          name
        },
        categories[]-> {
          _id,
          title,
          slug,
          description
        },
        tags[]-> {
          _id,
          title,
          slug,
          description
        },
        sidebarWidgets[] {
          type,
          order,
          config
        }
      },
      "allCategories": *[_type == "postCategory"] | order(order asc) {
        _id,
        title,
        slug,
        description,
        order
      }
    }
  }`);
}

export default async function BlogPage() {
  const content = await getBlogPage();

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <main>
      {BLOG_SECTIONS.map(({ type, component: Section }) => (
        <Section key={type} data={content[type]} />
      ))}
    </main>
  );
}
