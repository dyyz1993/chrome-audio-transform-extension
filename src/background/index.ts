import { orchestrate } from '@core/orchestrator'
import { storage } from '@core/storage'
import { submitTranslation } from '@core/translate'
import { logDebug } from '@core/logger'

/**
 * 后台入口：处理统一结果、翻译触发与与 Popover 通信
 */
chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg?.type === 'unified') {
    logDebug('bg', 'received unified', { from: sender?.tab?.id })
    await orchestrate(msg.payload)
    return true
  }
  if (msg?.type === 'ensure-translation') {
    const { context } = msg.payload
    logDebug('bg', 'ensure-translation', { id: context.id, platform: context.platform })
    const ex = await storage.getExtraction(context.platform, context.id)
    const audio = ex?.items?.find((i: any) => i.kind === 'audio')
    const cfg = storage.getTranslationConfigSync()
    if (audio && cfg?.api) await submitTranslation(audio, cfg)
    else logDebug('bg', 'no audio or api missing', { hasAudio: !!audio, api: cfg?.api })
    return true
  }
})
