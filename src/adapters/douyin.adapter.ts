import { UnifiedExtractionResult, UnifiedItem, UnifiedContext } from '@contracts/unified'
import { logDebug } from '@content/logger-lite'

/**
 * 从 URL 或 DOM 中提取抖音上下文 ID
 */
export function extractDouyinContextId(doc: Document, url: string): string | null {
  const m = url.match(/\/(\d{8,})/)
  if (m) {
    console.log('[extractDouyinContextId] extracted id from url:', m[1])
    return m[1]
  }
  const el = doc.querySelector('[data-e2e="feed-active-video"]')
  const vid = el?.getAttribute('data-e2e-vid')
  console.log('[extractDouyinContextId] extracted id from DOM:', vid+'')
  return vid || null
}

/**
 * 构建抖音适配器：安装拦截并输出统一结果
 */
export function buildDouyinAdapter(): { handleJson: (reqUrl: string, json: any, xhr: boolean) => UnifiedExtractionResult | null } {
  return {
    handleJson: (reqUrl: string, json: any, xhr: boolean) => {
      // console.log('adapter:douyin', 'handleJson', { reqUrl, json, xhr })
      const looksLikeDouyin = !!(json?.aweme_detail || json?.aweme_list)
      // console.log('adapter:douyin', 'looksLikeDouyin', { looksLikeDouyin })
      if (!looksLikeDouyin) return null
      console.log('adapter:douyin', 'looksLikeDouyin', { looksLikeDouyin })
      pushDouyinCache(reqUrl, json, xhr)
      logDebug('adapter:douyin', 'cached json', { size: __douyin_cache__.length })
      return null
    }
  }
}

/**
 * 维护 Douyin 原始 JSON 的内存缓存，用于延迟抽取
 */
const __douyin_cache__: Array<{ originUrl: string; json: any; xhr: boolean; ts: number }> = []

/**
 * 写入缓存（环形队列，最多 50 条）
 */
function pushDouyinCache(originUrl: string, json: any, xhr: boolean): void {
  __douyin_cache__.push({ originUrl, json, xhr, ts: Date.now() })
  if (__douyin_cache__.length > 50) __douyin_cache__.shift()
}

/**
 * 安全取值：按路径访问对象属性
 */
function get(obj: any, path: string): any {
  try {
    return path.split('.').reduce((o, k) => {
      if (o == null) return o
      if (k === '*') return o
      const m = k.match(/^(\w+)\[(\d+)\]$/)
      if (m) return (o as any)[m[1]]?.[Number(m[2])]
      return (o as any)[k]
    }, obj)
  } catch {
    return undefined
  }
}

/**
 * 在缓存的原始 JSON 中，按 aweme_id 搜索并抽取音视频 URL
 */
export function extractFromCacheById(id: string | number): UnifiedExtractionResult | null {
  const target = String(id)
  for (let i = __douyin_cache__.length - 1; i >= 0; i--) {
    const { originUrl, json } = __douyin_cache__[i]
    const node = findAwemeNode(json, target)
    const r = searchAwemeMediaById([node], target)
    if (!r) continue
    const { audio, video } = r
    if (!audio && !video) continue
    const ctx: UnifiedContext = { id: target, platform: 'douyin', url: location.href }
    const items: UnifiedItem[] = []
    if (audio) items.push({ kind: 'audio', context: ctx, url: audio, source: { matcher: 'aweme', originUrl, path: 'music.play_url.url_list[0]' } })
    if (video) items.push({ kind: 'video', context: ctx, url: video, source: { matcher: 'aweme', originUrl, path: 'video.play_addr_265.url_list[0]' } })
    console.log('adapter:douyin', 'extracted from cache', { id: target, items: items.length })
    return { context: ctx, items }
  }
  return null
}

/**
 * 纯函数：在提供的 JSON 列表中按 aweme_id 抽取音视频
 */
export function searchAwemeMediaById(jsonList: any[], id: string | number): { audio?: string; video?: string } | null {
  const target = String(id)
  for (let i = jsonList.length - 1; i >= 0; i--) {
    const node = findAwemeNode(jsonList[i], target)
    if (!node) continue
    const audio = get(node, 'music.play_url.url_list[0]')
    const video = get(node, 'video.play_addr_265.url_list[0]')
    console.log('adapter:douyin', 'searchAwemeMediaById', { audio, video })
    if (audio || video) return { audio, video }
  }
  return null
}

/**
 * 深度查找：返回包含 aweme_id == id 的条目对象
 */
function findAwemeNode(json: any, id: string): any | null {
  // 直接命中 detail 结构
  if (String(get(json, 'aweme_detail.aweme_id')) === id) return get(json, 'aweme_detail')
  // 列表结构
  const list = get(json, 'aweme_list')
  if (Array.isArray(list)) {
    const item = list.find((x: any) => String(get(x, 'aweme_id')) === id)
    if (item) return item
  }
  // 兜底：全量遍历（宽度优先）
  const queue: any[] = [json]
  while (queue.length) {
    const cur = queue.shift()
    if (!cur || typeof cur !== 'object') continue
    if (String((cur as any).aweme_id) === id) return cur
    for (const k of Object.keys(cur)) {
      const v = (cur as any)[k]
      if (v && typeof v === 'object') queue.push(v)
    }
  }
  return null
}
