export type MediaKind = 'video' | 'image' | 'text' | 'audio' | 'translation'

export interface UnifiedContext {
  id: string
  platform: 'douyin' | 'xiaohongshu'
  url: string
}

export interface BaseItem {
  kind: MediaKind
  context: UnifiedContext
  source: {
    matcher: string
    originUrl?: string
    path?: string
  }
  createdAt?: number
}

export interface VideoItem extends BaseItem {
  kind: 'video'
  url: string
  meta?: { bitrate?: number; resolution?: string }
}

export interface ImageItem extends BaseItem {
  kind: 'image'
  url: string
  meta?: { width?: number; height?: number; format?: string }
}

export interface TextItem extends BaseItem {
  kind: 'text'
  text: string
}

export interface AudioItem extends BaseItem {
  kind: 'audio'
  url: string
  meta?: { duration?: number; format?: string }
}

export type TranslationStatus = 'pending' | 'translating' | 'done' | 'error'

export interface TranslationItem extends BaseItem {
  kind: 'translation'
  audioRefId: string
  status: TranslationStatus
  language?: string
  text?: string
  error?: string
}

export type UnifiedItem = VideoItem | ImageItem | TextItem | AudioItem | TranslationItem

export interface UnifiedExtractionResult {
  context: UnifiedContext
  items: UnifiedItem[]
}

/**
 * 合同校验：保证各平台适配器输出满足统一结构
 */
export function assertUnified(result: UnifiedExtractionResult): void {
  if (!result?.context?.id || !result?.context?.platform || !result?.context?.url) {
    throw new Error('Invalid context in UnifiedExtractionResult')
  }
  const kinds = new Set(['video', 'image', 'text', 'audio', 'translation'])
  for (const item of result.items) {
    if (!kinds.has(item.kind)) throw new Error('Unknown kind: ' + (item as any).kind)
    if (item.kind === 'video' || item.kind === 'image' || item.kind === 'audio') {
      if (!(item as any).url) throw new Error('Missing url for media item')
    }
    if (item.kind === 'text') {
      if (!(item as any).text) throw new Error('Missing text for text item')
    }
    if (item.kind === 'translation') {
      const t = item as TranslationItem
      if (!t.audioRefId || !t.status) throw new Error('Invalid translation item')
    }
  }
}
