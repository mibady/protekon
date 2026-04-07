import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { allResourcesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Compliance Articles, Guides & Templates',
  description:
    'Browse the full PROTEKON resource library — SB 553 guides, Cal/OSHA templates, incident response checklists, and compliance articles for California employers.',
  alternates: { canonical: '/resources/articles' },
  openGraph: {
    title: 'Compliance Articles, Guides & Templates | PROTEKON',
    description:
      'Browse the full PROTEKON resource library — compliance guides, templates, and articles for California employers.',
    url: '/resources/articles',
    type: 'website',
  },
}

export default async function ArticlesPage() {
  const resources = await client.fetch(allResourcesQuery)

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
        <div className="mx-auto max-w-6xl px-6 py-24">
          {/* Header */}
          <Link
            href="/resources"
            className="mb-8 inline-flex items-center gap-2 text-sm text-steel hover:text-void transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>

          <h1 className="mb-2 text-4xl font-bold tracking-tight text-void">All Resources</h1>
          <p className="mb-12 text-lg text-steel">
            Compliance guides, templates, and articles to keep your business safe and compliant.
          </p>

          {/* Resource Grid */}
          {resources && resources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource: any) => (
                <Link
                  key={resource._id}
                  href={`/resources/${resource.slug.current}`}
                  className="group rounded-xl border border-fog bg-white p-6 transition-all hover:border-crimson/20 hover:shadow-lg"
                >
                  {resource.coverImage && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={urlFor(resource.coverImage).width(600).height(340).url()}
                        alt={resource.title}
                        width={600}
                        height={340}
                        className="w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-crimson/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-crimson">
                      {typeLabels[resource.resourceType] || resource.resourceType}
                    </span>
                    {resource.publishedAt && (
                      <span className="text-xs text-ash flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(resource.publishedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-void group-hover:text-crimson transition-colors">
                    {resource.title}
                  </h2>
                  {resource.excerpt && (
                    <p className="mt-2 text-sm text-steel line-clamp-2">{resource.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-fog bg-white p-12 text-center">
              <p className="text-lg text-steel">No resources published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
