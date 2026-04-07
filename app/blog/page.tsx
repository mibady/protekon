import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { allBlogPostsQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { format } from 'date-fns'

export const metadata = {
  title: 'Blog | Protekon',
  description: 'Compliance insights, regulatory updates, and best practices for California businesses.',
}

export default async function BlogPage() {
  const posts = await client.fetch(allBlogPostsQuery)

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-parchment">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-void">Blog</h1>
          <p className="mb-12 text-lg text-steel">
            Compliance insights, regulatory updates, and best practices.
          </p>

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
                    {post.categories && post.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.categories.map((cat: any) => (
                          <span
                            key={cat.slug?.current || cat.title}
                            className="rounded-full bg-fog px-2 py-0.5 text-xs text-steel"
                          >
                            {cat.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-fog bg-white p-12 text-center">
              <p className="text-lg text-steel">No blog posts published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
