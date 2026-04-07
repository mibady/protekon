import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { blogPostBySlugQuery } from '@/lib/sanity/queries'
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
      <main className="min-h-screen bg-parchment">
        <div className="mx-auto max-w-3xl px-6 py-24">
          {/* Breadcrumb */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-steel hover:text-void transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            {post.categories && post.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.categories.map((cat: any) => (
                  <span
                    key={cat.slug?.current || cat.title}
                    className="rounded-full bg-crimson/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crimson"
                  >
                    {cat.title}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-void lg:text-5xl">
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
                  <p className="font-medium text-void">{post.author.name}</p>
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

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-10 overflow-hidden rounded-xl">
              <Image
                src={urlFor(post.coverImage).width(1200).height(630).url()}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full object-cover"
                priority
              />
            </div>
          )}

          {/* Body Content */}
          {post.body && (
            <article className="prose prose-lg max-w-none text-void/90">
              <PortableText value={post.body} />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
