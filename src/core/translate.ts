import { MediaItem, TranslationItem } from '@contracts/unified'
import { storage } from './storage'
import * as tasks from './tasks'
import { logError, logInfo } from './logger'

/**
 * 提交音频翻译任务：去重、缓存、状态更新
 */
export async function submitTranslation(item: MediaItem, cfg: {
  api: string; language: string; use_itn: boolean; output_timestamp: boolean; device: string;
}): Promise<void> {
  const key = `${item.context.platform}:${item.context.id}:${cfg.language}:${cfg.use_itn}:${cfg.output_timestamp}:${cfg.device}`
  const cached = await storage.getTranslation(key)
  if (cached) return
  if (!tasks.start(key)) return
  try {
    logInfo('translate', `start ${key}`)
    const resp = await fetch((item as any).url)
    const blob = await resp.blob()
    logDebug('translate', 'audio blob size', { size: blob.size })
    const fd = new FormData()
    fd.append('language', cfg.language)
    fd.append('use_itn', String(cfg.use_itn))
    fd.append('output_timestamp', String(cfg.output_timestamp))
    fd.append('device', cfg.device)
    fd.append('audio', new File([blob], `${item.context.id}.mp3`, { type: 'audio/mpeg' }))
    const r = await fetch(cfg.api, { method: 'POST', body: fd })
    const text = await r.text()
    logDebug('translate', 'received text length', { length: text.length })
    await storage.saveTranslation(key, { text, at: Date.now() })
    chrome.runtime?.sendMessage?.({ type: 'translation-updated', payload: { id: item.context.id } })
  } catch (e) {
    logError('translate', e)
    await storage.saveTranslation(key, { error: String(e), at: Date.now() })
  } finally {
    tasks.finish(key)
  }
}
