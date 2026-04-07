import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { resourceBySlugQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { PortableText } from '@/lib/sanity/portable-text'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = await client.fetch(resourceBySlugQuery, { slug })
  if (!resource) {
    return { title: 'Resource Not Found | PROTEKON' }
  }
  return {
    title: resource.title,
    description: resource.excerpt || 'California compliance resource from PROTEKON.',
  }
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const resource = await client.fetch(resourceBySlugQuery, { slug })

  if (!resource) {
    notFound()
  }

  const typeLabels: Record<string, string> = {
    guide: 'Guide',
    template: 'Template',
    webinar: 'Webinar',
    article: 'Article',
    checklist: 'Checklist',
    whitepaper: 'Whitepaper',
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-parchment">
        <div className="mx-auto max-w-3xl px-6 py-24">
          {/* Breadcrumb */}
          <Link
            href="/resources"
            className="mb-8 inline-flex items-center gap-2 text-sm text-steel hover:text-void transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>

          {/* Header */}
          <div className="mb-8">
            {resource.resourceType && (
              <span className="mb-3 inline-block rounded-full bg-crimson/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crimson">
                {typeLabels[resource.resourceType] || resource.resourceType}
              </span>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-void lg:text-5xl">
              {resource.title}
            </h1>
            {resource.excerpt && (
              <p className="mt-4 text-lg text-steel">{resource.excerpt}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ash">
              {resource.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(resource.publishedAt), 'MMM d, yyyy')}
                </span>
              )}
              {resource.industries && resource.industries.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  {resource.industries.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {resource.coverImage && (
            <div className="mb-10 overflow-hidden rounded-xl">
              <Image
                src={urlFor(resource.coverImage).width(1200).height(630).url()}
                alt={resource.title}
                width={1200}
                height={630}
                className="w-full object-cover"
                priority
              />
            </div>
          )}

          {/* Download Link */}
          {resource.downloadUrl && (
            <div className="mb-10 rounded-lg border border-gold/20 bg-gold/5 p-6">
              <p className="mb-3 font-semibold text-void">Download this resource</p>
              <a
                href={resource.downloadUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-crimson px-5 py-2.5 text-sm font-semibold text-white hover:bg-crimson/90 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </div>
          )}

          {/* Body Content */}
          {resource.body && (
            <article className="prose prose-lg max-w-none text-void/90">
              <PortableText value={resource.body} />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
