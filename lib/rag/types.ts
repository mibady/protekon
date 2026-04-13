export interface VectorMetadata {
  type: "knowledge" | "regulatory" | "document"
  vertical?: string
  source?: string
  standardCode?: string
  clientId?: string
  title?: string
  severity?: string
}

export interface RetrievedChunk {
  id: string
  content: string
  metadata: VectorMetadata
  score: number
}

export interface IndexableDocument {
  id: string
  content: string
  metadata: VectorMetadata
}
