import { z } from 'zod'

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.object({
    name: z.string().min(1),
    url: z.string().url().optional(),
    avatar: z.string().optional(),
  }),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
})

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>

export function parseFrontmatter(slug: string, locale: string, raw: unknown): BlogFrontmatter {
  const result = blogFrontmatterSchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid frontmatter in content/blog/${locale}/${slug}.mdx — ${issues}`)
  }
  return result.data
}
