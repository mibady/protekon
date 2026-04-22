import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight, Search } from 'lucide-react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { client } from '@/lib/sanity/client'
import { allBlogPostsQuery, allBlogCategoriesQuery } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { format } from 'date-fns'
import BlogFilters from './blog-filters'

export const revalidate = 60

export const metadata = {
  title: 'Compliance Intelligence Blog | PROTEKON',
  description: 'Cal/OSHA enforcement data, SB 553 guidance, industry compliance insights, and penalty analysis for California employers.',
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    client.fetch(allBlogPostsQuery),
    client.fetch(allBlogCategoriesQuery),
  ])

  // Separate featured (pillars) from the rest
  const pillarPosts = posts?.filter((p: any) => p.contentTier === 'pillar') || []
  const featuredPost = pillarPosts[0]
  const remainingPillars = pillarPosts.slice(1, 4)
  const allOtherPosts = posts?.filter((p: any) => p.contentTier !== 'pillar') || []

  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {/* ── Hero Section ── */}
        <section className="relative bg-void pt-32 pb-20 overflow-hidden">
          {/* Grid texture overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Crimson glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(196,18,48,0.06) 0%, transparent 60%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-6">
            <p className="eyebrow mb-4">Compliance Intelligence</p>
            <h1 className="font-display text-5xl font-bold tracking-tight text-brand-white lg:text-6xl">
              The Protekon Blog
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-steel">
              Enforcement data, regulatory analysis, and compliance strategy for California's
              high-risk industries. Real intelligence from real OSHA data.
            </p>

            {/* Category pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              <Link
                href="/blog"
                className="border border-brand-white/15 bg-brand-white/5 px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[3px] text-brand-white transition-all hover:border-gold/40 hover:text-gold"
              >
                All Posts
              </Link>
              {categories
                ?.filter((cat: any) => cat.postCount > 0)
                .slice(0, 8)
                .map((cat: any) => (
                  <Link
                    key={cat._id}
                    href={`/blog/category/${cat.slug.current}`}
                    className="border border-brand-white/10 px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[2px] text-steel transition-all hover:border-crimson/40 hover:text-crimson"
                  >
                    {cat.title}
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* ── Featured Post (Hero Card) ── */}
        {featuredPost && (
          <section className="bg-midnight py-16">
            <div className="mx-auto max-w-6xl px-6">
              <p className="eyebrow-gold mb-6">Featured Guide</p>
              <Link
                href={`/blog/${featuredPost.slug.current}`}
                className="group grid gap-8 md:grid-cols-2"
              >
                {featuredPost.coverImage && (
                  <div className="overflow-hidden">
                    <Image
                      src={urlFor(featuredPost.coverImage).width(800).height(450).url()}
                      alt={featuredPost.title}
                      width={800}
                      height={450}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:brightness-110"
                      priority
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  {featuredPost.categories?.[0] && (
                    <span className="mb-3 inline-block w-fit border-l-[3px] border-crimson pl-3 font-display text-[10px] font-semibold uppercase tracking-[3px] text-crimson">
                      {featuredPost.categories[0].title}
                    </span>
                  )}
                  <h2 className="font-display text-3xl font-bold text-brand-white transition-colors group-hover:text-gold lg:text-4xl">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="mt-4 text-steel line-clamp-3">{featuredPost.excerpt}</p>
                  )}
                  <div className="mt-6 flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[3px] text-crimson">
                    Read Full Guide <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ── Pillar Guides Row ── */}
        {remainingPillars.length > 0 && (
          <section className="bg-void py-16">
            <div className="mx-auto max-w-6xl px-6">
              <p className="eyebrow mb-6">Essential Compliance Guides</p>
              <div className="grid gap-6 md:grid-cols-3">
                {remainingPillars.map((post: any) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug.current}`}
                    className="group relative border border-brand-white/[0.06] bg-midnight transition-all hover:border-gold/20"
                  >
                    <div className="absolute left-0 top-0 h-[3px] w-full bg-crimson" />
                    {post.coverImage && (
                      <div className="overflow-hidden">
                        <Image
                          src={urlFor(post.coverImage).width(500).height(280).url()}
                          alt={post.title}
                          width={500}
                          height={280}
                          className="w-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      {post.categories?.[0] && (
                        <span className="mb-2 block font-display text-[9px] font-semibold uppercase tracking-[3px] text-crimson">
                          {post.categories[0].title}
                        </span>
                      )}
                      <h3 className="font-display text-lg font-bold text-brand-white transition-colors group-hover:text-gold">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-steel line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Topic Clusters ── */}
        <section className="border-t border-brand-white/[0.06] bg-void py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[
                { label: 'SB 553', href: '/blog/category/sb-553-compliance', count: posts?.filter((p: any) => p.regulatoryDomain === 'sb-553').length || 0 },
                { label: 'Cal/OSHA', href: '/blog/category/cal-osha-enforcement', count: posts?.filter((p: any) => p.regulatoryDomain === 'cal-osha').length || 0 },
                { label: 'HIPAA', href: '/blog/category/healthcare-hipaa', count: posts?.filter((p: any) => p.regulatoryDomain === 'hipaa').length || 0 },
                { label: 'Federal OSHA', href: '/blog/category/federal-osha', count: posts?.filter((p: any) => p.regulatoryDomain === 'federal-osha').length || 0 },
                { label: 'State Guides', href: '/blog/category/state-compliance-guides', count: posts?.filter((p: any) => p.contentTier === 'state-guide').length || 0 },
                { label: 'Penalties', href: '/blog/category/penalty-analysis', count: posts?.filter((p: any) => p.keywordCluster === 'fine-panic').length || 0 },
              ].map((topic) => (
                <Link
                  key={topic.label}
                  href={topic.href}
                  className="group flex items-center justify-between border border-brand-white/[0.06] bg-midnight/50 px-4 py-3 transition-all hover:border-crimson/30"
                >
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[2px] text-brand-white group-hover:text-crimson">
                    {topic.label}
                  </span>
                  <span className="font-mono text-xs text-steel">{topic.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── All Articles Grid ── */}
        <section className="bg-parchment py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="eyebrow mb-2" style={{ color: '#C41230' }}>All Articles</p>
                <h2 className="font-display text-3xl font-bold text-void">
                  Latest Compliance Intelligence
                </h2>
              </div>
              <span className="font-mono text-sm text-steel">{allOtherPosts.length} articles</span>
            </div>

            {/* Client-side filters */}
            <BlogFilters posts={allOtherPosts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
