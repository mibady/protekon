export const revalidate = 60

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { blogPostsByCategoryQuery, allBlogCategoriesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const categories = await client.fetch(allBlogCategoriesQuery)
  return categories
    .filter((cat: any) => cat.slug?.current)
    .map((cat: any) => ({ slug: cat.slug.current }))
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params

  const [posts, categories] = await Promise.all([
    client.fetch(blogPostsByCategoryQuery, { slug }),
    client.fetch(allBlogCategoriesQuery),
  ])

  const currentCategory = categories.find((c: any) => c.slug?.current === slug)
  const categoryTitle = currentCategory?.title || slug.replace(/-/g, ' ')

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-parchment">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-steel hover:text-void transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>

          <h1 className="mb-2 text-4xl font-bold tracking-tight text-void">{categoryTitle}</h1>
          <p className="mb-8 text-lg text-steel">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>

          {/* Category nav */}
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="rounded-full border border-fog bg-white px-4 py-1.5 text-sm text-steel hover:border-crimson/20 hover:text-crimson transition-colors"
            >
              All
            </Link>
            {categories
              .filter((cat: any) => cat.postCount > 0)
              .map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/blog/category/${cat.slug.current}`}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    cat.slug.current === slug
                      ? 'border-crimson bg-crimson/10 text-crimson font-medium'
                      : 'border-fog bg-white text-steel hover:border-crimson/20 hover:text-crimson'
                  }`}
                >
                  {cat.title} ({cat.postCount})
                </Link>
              ))}
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="group rounded-xl border border-fog bg-white overflow-hidden transition-all hover:border-crimson/20 hover:shadow-lg"
                >
                  {post.coverImage && (
                    <div className="overflow-hidden">
                      <Image
                        src={urlFor(post.coverImage).width(600).height(340).url()}
                        alt={post.title}
                        width={600}
                        height={340}
                        className="w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-3 text-xs text-ash">
                      {post.author && <span>{post.author.name}</span>}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-void group-hover:text-crimson transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-steel line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-fog bg-white p-12 text-center">
              <p className="text-lg text-steel">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
