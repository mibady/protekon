export const revalidate = 60

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { blogPostBySlugQuery } from '@/lib/sanity/queries'
import RelatedPosts from '@/components/blog/related-posts'
import BlogPostCTA from '@/components/blog/BlogPostCTA'
import { urlFor } from '@/lib/sanity/image'
import { PortableText } from '@/lib/sanity/portable-text'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await client.fetch(blogPostBySlugQuery, { slug })

  if (!post) {
    notFound()
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-void pt-32 pb-16 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(196,18,48,0.06) 0%, transparent 60%)',
            }}
          />

          <div className="relative mx-auto max-w-3xl px-6">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-2 text-sm text-steel hover:text-brand-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {post.categories && post.categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.categories.map((cat: any) => (
                  <span
                    key={cat.slug?.current || cat.title}
                    className="border border-crimson/40 bg-crimson/10 px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-[2px] text-crimson"
                  >
                    {cat.title}
                  </span>
                ))}
              </div>
            )}
            <h1 className="font-display text-4xl font-bold tracking-tight text-brand-white lg:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-lg text-steel">{post.excerpt}</p>
            )}
            <div className="mt-6 flex items-center gap-4">
              {post.author?.image && (
                <Image
                  src={urlFor(post.author.image).width(48).height(48).url()}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                {post.author && (
                  <p className="font-medium text-brand-white">{post.author.name}</p>
                )}
                {post.publishedAt && (
                  <p className="text-sm text-ash flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Cover Image bridge */}
        {post.coverImage && (
          <section className="bg-parchment">
            <div className="mx-auto max-w-4xl px-6 -mt-8">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={urlFor(post.coverImage).width(1200).height(630).url()}
                  alt={post.title}
                  width={1200}
                  height={630}
                  className="w-full object-cover"
                  priority
                />
              </div>
            </div>
          </section>
        )}

        {/* Article body */}
        <section className="bg-parchment py-16">
          <div className="mx-auto max-w-3xl px-6">
            {/* Body Content */}
            {post.body && (
              <article className="prose prose-lg max-w-none text-void/90">
                <PortableText value={post.body} />
              </article>
            )}

            <BlogPostCTA />

            {/* Related Posts */}
            <RelatedPosts
              currentId={post._id}
              domain={post.regulatoryDomain}
              categoryIds={post.categories?.map((c: any) => c._id) || []}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
