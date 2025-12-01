import { hookFetch } from '@content/hooks/fetch-hook'
import { hookXhr } from '@content/hooks/xhr-hook'
import { sendUnified } from '@content/bridge'
import { UnifiedExtractionResult, UnifiedItem, UnifiedContext } from '@contracts/unified'
import { logDebug } from '@core/logger'

/**
 * 从 URL 提取小红书笔记 ID
 */
export function extractXhsIdFromUrl(url: string): string | null {
  const m = url.match(/notes\/(\w+)/)
  return m ? m[1] : null
}

/**
 * 构建小红书适配器：安装拦截并输出统一结果
 */
export function buildXhsAdapter(): {
  hostMatch(host: string): boolean
  installHooks(): void
} {
  return {
    hostMatch: (host: string) => /xiaohongshu\.com$/.test(host),
    installHooks: () => {
      const matchers = [
        { urlRegex: /\/api\/notes\// },
        { urlRegex: /\/api\/images\// },
        { urlRegex: /.*/ } // 默认从所有 URL 中尝试解析 JSON
      ]
      const onJson = (reqUrl: string, json: any) => {
        const looksLikeXhs = !!(json?.note || json?.images)
        if (!looksLikeXhs) return
        const id = extractXhsIdFromUrl(location.href) || json?.note?.id
        if (!id) return
        logDebug('adapter:xhs', 'extracted id', { id })
        const ctx: UnifiedContext = { id, platform: 'xiaohongshu', url: location.href }
        const items: UnifiedItem[] = []
        const imgs = (json?.images || []).map((x: any) => x?.url).filter(Boolean)
        for (const u of imgs) items.push({ kind: 'image', context: ctx, url: u, source: { matcher: 'images', originUrl: reqUrl, path: 'images[*].url' } })
        if (imgs.length) { logDebug('adapter:xhs', 'images', { count: imgs.length }) }
        const text = json?.note?.content
        if (text) items.push({ kind: 'text', context: ctx, text, source: { matcher: 'notes', originUrl: reqUrl, path: 'note.content' } })
        if (text) { logDebug('adapter:xhs', 'text', { length: (text as string).length }) }
        logDebug('adapter:xhs', 'items', { count: items.length })
        const result: UnifiedExtractionResult = { context: ctx, items }
        sendUnified(result)
      }
      hookFetch(matchers, onJson)
      hookXhr(matchers, onJson)
    }
  }
}
