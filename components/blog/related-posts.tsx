import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/lib/sanity/client'
import { relatedPostsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

interface RelatedPostsProps {
  currentId: string
  domain?: string
  categoryIds?: string[]
}

export default async function RelatedPosts({ currentId, domain, categoryIds = [] }: RelatedPostsProps) {
  const posts = await client.fetch(relatedPostsQuery, {
    currentId,
    domain: domain || '',
    categoryIds,
  })

  if (!posts || posts.length === 0) return null

  return (
    <section className="mt-16 border-t border-fog pt-12">
      <h2 className="mb-8 text-2xl font-bold text-void">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post: any) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            className="group flex gap-4 rounded-lg border border-fog bg-white p-4 transition-all hover:border-crimson/20 hover:shadow-md"
          >
            {post.coverImage && (
              <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={urlFor(post.coverImage).width(224).height(160).url()}
                  alt={post.title}
                  width={224}
                  height={160}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-void group-hover:text-crimson transition-colors line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1 text-sm text-steel line-clamp-2">{post.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
