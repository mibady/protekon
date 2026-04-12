"use server"

import { createClient } from "@/lib/supabase/server"

export interface KnowledgeArticle {
  id: string
  title: string
  topic: string
  category: string
  content: string
  cfr_standard: string | null
  source_publication: string | null
  applies_to_verticals: string[]
  is_california_specific: boolean
  priority: string
  created_at: string
}

export async function getKnowledgeArticles(filters?: {
  category?: string
  vertical?: string
  search?: string
}): Promise<KnowledgeArticle[]> {
  const supabase = await createClient()

  let query = supabase
    .from("osha_knowledge_base")
    .select("*")
    .order("priority", { ascending: true })
    .order("title", { ascending: true })

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }

  if (filters?.vertical) {
    query = query.contains("applies_to_verticals", [filters.vertical])
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,topic.ilike.%${filters.search}%`)
  }

  const { data } = await query.limit(100)
  return (data || []) as KnowledgeArticle[]
}

export async function getKnowledgeCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("osha_knowledge_base")
    .select("category")

  const categories = [...new Set((data || []).map((r) => r.category).filter(Boolean))]
  return categories.sort()
}
