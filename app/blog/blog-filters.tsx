'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { urlFor } from '@/lib/sanity/image'
import { format } from 'date-fns'

const CONTENT_TIERS = [
  { value: 'all', label: 'All' },
  { value: 'cluster', label: 'Deep Dives' },
  { value: 'vertical', label: 'Industry' },
  { value: 'data-briefing', label: 'Enforcement Data' },
  { value: 'state-guide', label: 'State Guides' },
  { value: 'comparison', label: 'Comparisons' },
  { value: 'how-to', label: 'How-To' },
  { value: 'checklist-article', label: 'Checklists' },
]

interface BlogFiltersProps {
  posts: any[]
}

export default function BlogFilters({ posts }: BlogFiltersProps) {
  const [activeTier, setActiveTier] = useState('all')

  const filtered = posts.filter((post: any) => {
    return activeTier === 'all' || post.contentTier === activeTier
  })

  return (
    <>
      {/* Tier tabs */}
      <div className="mb-10 flex flex-wrap gap-2">
        {CONTENT_TIERS.map((tier) => (
          <button
            key={tier.value}
            onClick={() => setActiveTier(tier.value)}
            className={`px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[2px] transition-all ${
              activeTier === tier.value
                ? 'bg-void text-brand-white'
                : 'border border-void/10 text-steel hover:border-void/30 hover:text-void'
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mb-6 font-mono text-sm text-steel">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        {activeTier !== 'all' && ` in ${CONTENT_TIERS.find((t) => t.value === activeTier)?.label}`}
      </p>

      {/* Article grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post: any) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            className="group relative overflow-hidden border border-void/[0.08] bg-white transition-all hover:border-crimson/20 hover:shadow-lg"
          >
            <div className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-crimson to-crimson/40" />
            {post.coverImage && (
              <div className="overflow-hidden">
                <Image
                  src={urlFor(post.coverImage).width(600).height(340).url()}
                  alt={post.title}
                  width={600}
                  height={340}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-ash">
                  {post.author && (
                    <span className="font-medium">{post.author.name}</span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                {post.contentTier && (
                  <span className="font-display text-[9px] font-semibold uppercase tracking-[2px] text-gold">
                    {post.contentTier === 'data-briefing' ? 'Data' : post.contentTier}
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold text-void transition-colors group-hover:text-crimson">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 text-sm text-steel line-clamp-2">{post.excerpt}</p>
              )}
              {post.categories && post.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.categories.slice(0, 2).map((cat: any) => (
                    <span
                      key={cat.slug?.current || cat.title}
                      className="border border-void/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-steel"
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

      {filtered.length === 0 && (
        <div className="border border-void/[0.08] bg-white p-12 text-center">
          <p className="font-display text-lg text-steel">
            No articles match your filters. Try a different combination.
          </p>
        </div>
      )}
    </>
  )
}
