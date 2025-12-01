import { hookFetch } from '@content/hooks/fetch-hook'
import { hookXhr } from '@content/hooks/xhr-hook'
import { sendUnified } from '@content/bridge'
import { UnifiedExtractionResult, UnifiedItem, UnifiedContext } from '@contracts/unified'
import { logDebug } from '@core/logger'

/**
 * 从 URL 或 DOM 中提取抖音上下文 ID
 */
export function extractDouyinContextId(doc: Document, url: string): string | null {
  const m = url.match(/\/(\d{8,})/)
  if (m) return m[1]
  const el = doc.querySelector('[data-e2e="feed-active-video"]')
  const vid = el?.getAttribute('data-e2e-vid')
  return vid || null
}

/**
 * 构建抖音适配器：安装拦截并输出统一结果
 */
export function buildDouyinAdapter(): {
  hostMatch(host: string): boolean
  installHooks(): void
} {
  return {
    hostMatch: (host: string) => /douyin\.com$|iesdouyin\.com$/.test(host),
    installHooks: () => {
      const matchers = [
        { urlRegex: /aweme\/v1\// },
        { urlRegex: /aweme\/post\// },
        { urlRegex: /.*/ } // 默认从所有 URL 中尝试解析 JSON
      ]
      const onJson = (reqUrl: string, json: any) => {
        const looksLikeDouyin = !!(json?.aweme_id || (json?.video && json?.music))
        if (!looksLikeDouyin) return
        const id = json?.aweme_id || extractDouyinContextId(document, location.href)
        if (!id) return
        logDebug('adapter:douyin', 'extracted id', { id })
        const ctx: UnifiedContext = { id, platform: 'douyin', url: location.href }
        const items: UnifiedItem[] = []
        const audio = json?.music?.play_url?.url_list?.[0]
        if (audio) {
          items.push({ kind: 'audio', context: ctx, url: audio, source: { matcher: 'aweme', originUrl: reqUrl, path: 'music.play_url.url_list[0]' } })
          logDebug('adapter:douyin', 'audio', { url: audio })
        }
        const br = json?.video?.bit_rate || []
        const v = br.find((b: any) => b?.play_addr?.url_list?.[0])?.play_addr?.url_list?.[0]
        if (v) {
          items.push({ kind: 'video', context: ctx, url: v, source: { matcher: 'aweme', originUrl: reqUrl, path: 'video.bit_rate[*].play_addr.url_list[0]' } })
          logDebug('adapter:douyin', 'video', { url: v })
        }
        logDebug('adapter:douyin', 'items', { count: items.length })
        const result: UnifiedExtractionResult = { context: ctx, items }
        sendUnified(result)
      }
      hookFetch(matchers, onJson)
      hookXhr(matchers, onJson)
    }
  }
}
