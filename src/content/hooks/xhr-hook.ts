/**
 * 重写 XMLHttpRequest.open/send，只读监听响应；匹配规则后解析 JSON 并回调
 */
export function hookXhr(
  matchers: { urlRegex: RegExp }[],
  onJson: (url: string, json: any) => void
): void {
  const OrigXHR = window.XMLHttpRequest
  class WrappedXHR extends OrigXHR {
    private _url: string | null = null
    open(method: string, url: string, async?: boolean, user?: string, password?: string): void {
      this._url = url
      try { (window as any).console?.debug?.('[hook:xhr] open', { method, url }) } catch {}
      super.open(method, url, async ?? true, user as any, password as any)
    }
    send(body?: Document | BodyInit | null): void {
      this.addEventListener('load', () => {
        try {
          const url = this._url || ''
          if (matchers.some(m => m.urlRegex.test(url))) {
            try { (window as any).console?.debug?.('[hook:xhr] matched', { url, status: (this as any).status }) } catch {}
            const text = this.responseText
            try {
              const json = JSON.parse(text)
              onJson(url, json)
            } catch (e) {
              try { (window as any).console?.error?.('[hook:xhr] parse error', e) } catch {}
            }
          }
        } catch {}
      })
      super.send(body as any)
    }
  }
  // @ts-expect-error 替换全局 XHR 构造函数
  window.XMLHttpRequest = WrappedXHR
}
