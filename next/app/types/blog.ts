export interface Post {
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  description: string;
  categories?: { title: string }[];
} 