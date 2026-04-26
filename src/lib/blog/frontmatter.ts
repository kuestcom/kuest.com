import { z } from 'zod'

export const blogFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.object({
    name: z.string().trim().min(1),
    url: z.string().trim().url().optional(),
    avatar: z.string().trim().min(1).optional(),
  }),
  cover: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
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
