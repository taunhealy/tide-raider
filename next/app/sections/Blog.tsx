import { FormattedDate } from "@/app/components/FormattedDate";
import { urlForImage } from "@/app/lib/urlForImage";
import { client } from "@/app/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import Blog from "./HeroBlog";

interface Category {
  title: string;
}

interface Post {
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  description: string;
  categories: Category[];
}

export default Blog;
