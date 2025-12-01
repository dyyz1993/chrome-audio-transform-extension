export function logError(scope: string, e: any): void {
  const msg = typeof e === 'string' ? e : (e?.message || String(e))
  try { console.error(`[${scope}]`, msg) } catch {}
  try { chrome.storage.local.set({ lastError: { scope, msg, at: Date.now() } }) } catch {}
}

export function logInfo(scope: string, msg: string, data?: any): void {
  try { console.info(`[${scope}]`, msg, data ?? '') } catch {}
  persist(scope, 'info', msg, data)
}

export function logDebug(scope: string, msg: string, data?: any): void {
  const enabled = !!(globalThis as any).__debug_enabled__
  if (!enabled) return
  try { console.debug(`[${scope}]`, msg, data ?? '') } catch {}
  persist(scope, 'debug', msg, data)
}

async function persist(scope: string, level: string, msg: string, data?: any): Promise<void> {
  try {
    const r = await chrome.storage.local.get(['logs'])
    const logs: any[] = Array.isArray(r.logs) ? r.logs : []
    logs.push({ scope, level, msg, data, at: Date.now() })
    if (logs.length > 500) logs.splice(0, logs.length - 500)
    await chrome.storage.local.set({ logs })
  } catch {}
}
