'use client'

import { PortableText as PortableTextComponent, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from './image'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || ''}
            width={1200}
            height={675}
            className="rounded-lg"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h2: ({ children }) => <h2 className="mt-10 mb-4 text-2xl font-bold">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 mb-3 text-xl font-semibold">{children}</h3>,
    h4: ({ children }) => <h4 className="mt-6 mb-2 text-lg font-semibold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
}

export function PortableText({ value }: { value: any }) {
  return <PortableTextComponent value={value} components={components} />
}
