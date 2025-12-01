/**
 * 封装 chrome.storage.local：设置、提取结果、翻译缓存
 */
export const storage = {
  async getSettings<T = any>(): Promise<T> {
    const r = await chrome.storage.local.get(['settings'])
    try { (await import('./logger')).logDebug('core:storage', 'getSettings', r.settings) } catch {}
    return (r.settings || {}) as T
  },
  async saveSettings(settings: any): Promise<void> {
    await chrome.storage.local.set({ settings })
    try { (await import('./logger')).logDebug('core:storage', 'saveSettings', settings) } catch {}
  },
  async mergeExtraction(r: any): Promise<void> {
    const key = `extraction:${r.context.platform}:${r.context.id}`
    const cur = await chrome.storage.local.get([key])
    const prev = cur[key] || { context: r.context, items: [] }
    const merged = { context: r.context, items: mergeItems(prev.items, r.items) }
    await chrome.storage.local.set({ [key]: merged, lastContextId: r.context.id })
    try { (await import('./logger')).logDebug('core:storage', 'mergeExtraction', { key, items: merged.items.length }) } catch {}
  },
  async getExtraction(platform: string, id: string): Promise<any | null> {
    const key = `extraction:${platform}:${id}`
    const cur = await chrome.storage.local.get([key])
    try { (await import('./logger')).logDebug('core:storage', 'getExtraction', { key, exist: !!cur[key] }) } catch {}
    return cur[key] || null
  },
  async saveTranslation(key: string, data: any): Promise<void> {
    await chrome.storage.local.set({ [`translation:${key}`]: data })
    try { (await import('./logger')).logDebug('core:storage', 'saveTranslation', { key }) } catch {}
  },
  async getTranslation(key: string): Promise<any | null> {
    const r = await chrome.storage.local.get([`translation:${key}`])
    try { (await import('./logger')).logDebug('core:storage', 'getTranslation', { key, exist: !!r[`translation:${key}`] }) } catch {}
    return r[`translation:${key}`] || null
  },
  getTranslationConfigSync(): any {
    // 简易同步缓存（由设置页写入时同时更新）
    // @ts-expect-error 临时全局缓存
    return window.__translation_cfg__
  },
  setTranslationConfigSync(cfg: any): void {
    // @ts-expect-error 临时全局缓存
    window.__translation_cfg__ = cfg
  }
}

/**
 * 合并条目：按 kind+url/text 去重，保留最新
 */
function mergeItems(prev: any[], next: any[]): any[] {
  const keyOf = (x: any) => x.kind + ':' + (x.url || x.text || '')
  const map = new Map<string, any>()
  for (const i of prev) map.set(keyOf(i), i)
  for (const i of next) map.set(keyOf(i), i)
  return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}
