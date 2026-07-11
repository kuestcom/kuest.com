import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";

interface MdxModule {
  default: ComponentType<{ components?: MDXComponents }>;
}

const modules = import.meta.glob("/content/blog/**/*.mdx", { eager: true }) as Record<
  string,
  MdxModule
>;

export function getPostContent(locale: string, contentSlug: string) {
  return modules[`/content/blog/${locale}/${contentSlug}.mdx`]?.default ?? null;
}
