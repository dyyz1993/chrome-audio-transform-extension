import { assertUnified, UnifiedExtractionResult } from '@contracts/unified'
import { storage } from './storage'
import { logDebug } from './logger'

/**
 * 统一编排：校验 → 合并存储 → 通知 Popover → 尝试触发翻译
 */
export async function orchestrate(r: UnifiedExtractionResult): Promise<void> {
  assertUnified(r)
  logDebug('core:orchestrator', 'received unified', { platform: r.context.platform, id: r.context.id, items: r.items.length })
  await storage.mergeExtraction(r)
  logDebug('core:orchestrator', 'merged storage', { key: `${r.context.platform}:${r.context.id}` })
  broadcastToPopup(r.context.id)
  const cfg = storage.getTranslationConfigSync()
  const hasAudio = r.items.some(i => i.kind === 'audio')
  if (cfg && hasAudio) {
    // 延后到翻译模块处理（在后台中调用）
    logDebug('core:orchestrator', 'ensure translation', { id: r.context.id })
    chrome.runtime?.sendMessage?.({ type: 'ensure-translation', payload: { context: r.context } })
  }
}

/**
 * 通知 Popover 刷新当前上下文内容
 */
export function broadcastToPopup(contextId: string): void {
  logDebug('core:orchestrator', 'broadcast refresh', { contextId })
  chrome.runtime?.sendMessage?.({ type: 'refresh-popup', payload: { contextId } })
}
