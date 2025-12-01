import { readForm, saveSettings, updateTranslationSync, updateDebugSync, renderSettings } from './form'

function platformName(p: string | undefined): string {
  if (p === 'douyin') return '抖音'
  if (p === 'xiaohongshu') return '小红书'
  return '下载器'
}

/**
 * 初始化设置页：渲染与绑定保存、清理
 */
function init(): void {
  renderSettings()
  chrome.storage.local.get(['lastContextId']).then(async ({ lastContextId }) => {
    if (lastContextId) {
      const all = await chrome.storage.local.get()
      const chosen = Object.entries(all).filter(([k]) => k.startsWith('extraction:')).find(([k]) => k.endsWith(':' + lastContextId))?.[1] as any
      const titleEl = document.getElementById('title')
      if (titleEl && chosen?.context?.platform) titleEl.textContent = `${platformName(chosen.context.platform)} 下载器设置`
      try { (await import('../core/logger')).logDebug('ui:options', 'set title', { platform: chosen?.context?.platform }) } catch {}
    }
  })
  document.getElementById('btn-save')?.addEventListener('click', async () => {
    const s = readForm()
    await saveSettings(s)
    updateTranslationSync(s.translation)
    updateDebugSync(s.debug)
    try { (await import('../core/logger')).logDebug('ui:options', 'saved settings', s) } catch {}
    alert('已保存')
  })
  document.getElementById('btn-clear')?.addEventListener('click', async () => {
    const all = await chrome.storage.local.get()
    const keys = Object.keys(all).filter(k => k.startsWith('extraction:') || k.startsWith('translation:'))
    await chrome.storage.local.remove(keys)
    try { (await import('../core/logger')).logDebug('ui:options', 'cleared keys', { count: keys.length }) } catch {}
    alert('已清除下载与翻译记录')
  })
}

init()
