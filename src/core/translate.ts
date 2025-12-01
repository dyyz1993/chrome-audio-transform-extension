import { AudioItem, TranslationItem } from '@contracts/unified'
import { storage } from './storage'
import * as tasks from './tasks'
import { logDebug, logError, logInfo } from './logger'

/**
 * 提交音频翻译任务：去重、缓存、状态更新
 */
export async function submitTranslation(item: AudioItem, cfg: {
  api: string; language: string; use_itn: boolean; output_timestamp: boolean; device: string;
}): Promise<void> {
  const key = `${item.context.platform}:${item.context.id}:${cfg.language}:${cfg.use_itn}:${cfg.output_timestamp}:${cfg.device}`
  const cached = await storage.getTranslation(key)
  if (cached) return
  if (!tasks.start(key)) return
  try {
    logInfo('translate', `start ${key}`)
    await storage.setTranslationStatus(key, { state: 'in_progress', at: Date.now() })


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
    const raw = await r.text()
    logDebug('translate', 'received text length', { length: raw.length })
    let parsed: any = null
    try { parsed = JSON.parse(raw) } catch {}
    if (parsed && parsed.status === 'success') {
      const txt = parsed?.data?.text || ''
      await storage.saveTranslation(key, { ...parsed, text: txt, at: Date.now() })
      await storage.setTranslationStatus(key, { state: 'success', at: Date.now() })
      chrome.runtime?.sendMessage?.({ type: 'translation-updated', payload: { id: item.context.id } })
    } else if (parsed && parsed.status && parsed.status !== 'success') {
      const msg = String(parsed?.message || parsed?.error || 'translation failed')
      await storage.saveTranslation(key, { error: msg, at: Date.now() })
      await storage.setTranslationStatus(key, { state: 'error', message: msg, at: Date.now() })
      chrome.runtime?.sendMessage?.({ type: 'translation-updated', payload: { id: item.context.id } })
    } else {
      await storage.saveTranslation(key, { text: raw, at: Date.now() })
      await storage.setTranslationStatus(key, { state: 'success', at: Date.now() })
      chrome.runtime?.sendMessage?.({ type: 'translation-updated', payload: { id: item.context.id } })
    }
  } catch (e) {
    logError('translate', e)
    await storage.saveTranslation(key, { error: String(e), at: Date.now() })
    await storage.setTranslationStatus(key, { state: 'error', message: String(e), at: Date.now() })
    chrome.runtime?.sendMessage?.({ type: 'translation-updated', payload: { id: item.context.id } })
  } finally {
    tasks.finish(key)
  }
}
