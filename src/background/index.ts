import { orchestrate } from '@core/orchestrator'
import { storage } from '@core/storage'
import { logDebug, setDebugEnabled, logInfo } from '@core/logger'
import { submitTranslation } from '@core/translate'
async function ensureOffscreen() {
  const has = await chrome.offscreen.hasDocument?.()
  if (!has) {
    await chrome.offscreen.createDocument({
      url: 'src/offscreen/index.html',
      reasons: ['DOM_SCRAPING'],
      justification: 'Run long-lived translation requests without service worker termination'
    })
  }
}

/**
 * 后台入口：处理统一结果、翻译触发与与 Popover 通信
 */
// 启动时读取设置并初始化调试开关
chrome.storage.local.get(['settings']).then(r => {
  const enabled = r.settings?.debug ?? true
  setDebugEnabled(enabled)
  // 初始化翻译配置到同步缓存，供后台与编排快速读取
  storage.setTranslationConfigSync(r.settings?.translation || null)
  logInfo('bg', 'boot', { debug: enabled, hasTransCfg: !!r.settings?.translation })
})

chrome.runtime.onMessage.addListener((msg, sender, _sendResponse) => {
  if (msg?.type === 'unified') {
    logDebug('bg', 'received unified', { from: sender?.tab?.id })
    void orchestrate(msg.payload)
    return true
  }
  if (msg?.type === 'ensure-translation') {
    const { context } = msg.payload
    logDebug('bg', 'ensure-translation', { id: context.id, platform: context.platform })
    ;(async () => {
      const ex = await storage.getExtraction(context.platform, context.id)
      const audio = ex?.items?.find((i: any) => i.kind === 'audio')
      const cfg = storage.getTranslationConfigSync()
      if (audio && cfg?.api) {
        try {
          await ensureOffscreen()
          await chrome.runtime.sendMessage({ type: 'offscreen-translate', payload: { audio, cfg } })
        } catch {
          await submitTranslation(audio, cfg)
        }
      }
      else logDebug('bg', 'no audio or api missing', { hasAudio: !!audio, api: cfg?.api })
    })()
    return true
  }
  if (msg?.type === 'popup-open') {
    ;(async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        const tab = tabs?.[0]
        if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'popup-open' })
      } catch {}
    })()
    return true
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    const hosts = ['douyin.com', 'iesdouyin.com', 'xiaohongshu.com']
    const rules = hosts.map(h => ({
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: h },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowAction({})],
    }))
    chrome.declarativeContent.onPageChanged.addRules(rules)
  })
})
