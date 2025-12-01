import { setDebugEnabled, logInfo } from '@core/logger'

/**
 * 初始化内容脚本的调试开关，并打印启动日志
 */
export async function initContentDebug(): Promise<void> {
  try {
    const r = await chrome.storage.local.get(['settings'])
    const enabled = !!r.settings?.debug
    setDebugEnabled(enabled)
    logInfo('content:loader', 'debug init', { enabled })
  } catch {}
}
