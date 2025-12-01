/**
 * 重写 window.fetch，只读监听响应；匹配规则后解析 JSON 并回调
 */
export function hookFetch(
  matchers: { urlRegex: RegExp }[],
  onJson: (url: string, json: any) => void
): void {
  const orig = window.fetch
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const t0 = performance.now()
    const resp = await orig(input as any, init)
    try {
      const url = typeof input === 'string' ? input : (input as Request).toString()
      if (matchers.some(m => m.urlRegex.test(url))) {
        const t1 = performance.now()
        try { (await import('../../core/logger')).logDebug('hook:fetch', 'matched', { url, status: resp.status, dt: (t1 - t0).toFixed(1) }) } catch {}
        const clone = resp.clone()
        const text = await clone.text()
        try {
          const json = JSON.parse(text)
          try { (await import('../../core/logger')).logDebug('hook:fetch', 'parsed', { url, size: text.length }) } catch {}
          onJson(url, json)
        } catch (e) {
          try { (await import('../../core/logger')).logError('hook:fetch', e) } catch {}
        }
      }
    } catch {}
    return resp
  }
}
