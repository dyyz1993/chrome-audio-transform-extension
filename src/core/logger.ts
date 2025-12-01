/**
 * 轻量日志封装：错误上报摘要
 */
type Level = 'debug' | 'info' | 'error'

let debugEnabled = true

export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled
  ;(globalThis as any).__debug_enabled__ = enabled
}

function shouldDebug(): boolean {
  const g = (globalThis as any).__debug_enabled__
  return g === undefined ? debugEnabled : !!g
}

async function emit(scope: string, level: Level, msg: string, data?: any): Promise<void> {
  try {
    console.log(`[${scope}]`, level, msg, data ?? '')
    const entry = { scope, level, msg, data, at: Date.now() }
    if (level === 'debug' && !shouldDebug()) return
    if (level === 'error') console.error(`[${scope}]`, msg, data ?? '')
    else if (level === 'info') console.info(`[${scope}]`, msg, data ?? '')
    else console.debug(`[${scope}]`, msg, data ?? '')
    const r = await chrome.storage.local.get(['logs'])
    const logs: any[] = Array.isArray(r.logs) ? r.logs : []
    logs.push(entry)
    if (logs.length > 500) logs.splice(0, logs.length - 500)
    await chrome.storage.local.set({ logs })
  } catch {}
}

export function logError(scope: string, e: any): void {
  const msg = typeof e === 'string' ? e : (e?.message || String(e))
  emit(scope, 'error', msg)
  try {
    chrome.storage.local.set({ lastError: { scope, msg, at: Date.now() } })
  } catch {}
}

export function logInfo(scope: string, msg: string, data?: any): void {
  emit(scope, 'info', msg, data)
}

export function logDebug(scope: string, msg: string, data?: any): void {
  emit(scope, 'debug', msg, data)
}
