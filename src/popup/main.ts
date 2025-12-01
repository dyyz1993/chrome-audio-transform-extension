import { renderItems } from './ui'

function platformName(p: string | undefined): string {
  if (p === 'douyin') return '抖音'
  if (p === 'xiaohongshu') return '小红书'
  return '下载器'
}

/**
 * 加载最新上下文的提取结果并渲染
 */
async function loadAndRender(): Promise<void> {
  const list = document.getElementById('list')!
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const host = tabs?.[0]?.url ? new URL(tabs[0].url!).hostname : ''
  const isDouyin = /douyin\.com$|iesdouyin\.com$/.test(host)
  const isXhs = /xiaohongshu\.com$/.test(host)
  if (!isDouyin && !isXhs) {
    list.textContent = '⚠️ 当前页面不支持'
    disableFooter()
    return
  }
  const all = await chrome.storage.local.get()
  const lastContextId = all.lastContextId
  try { (await import('../core/logger')).logDebug('ui:popup', 'load lastContextId', { lastContextId }) } catch {}
  if (!lastContextId) {
    list.textContent = '⚠️ 正在加载菜单...'
    return
  }
  const entries = Object.entries(all).filter(([k]) => k.startsWith('extraction:'))
  const chosen = entries.find(([k]) => k.endsWith(':' + lastContextId))?.[1] as any
  if (!chosen) {
    list.textContent = '⚠️ 无可展示内容'
    return
  }
  const header = document.getElementById('header')
  if (header) header.textContent = `${platformName(chosen.context?.platform)} 下载器`
  try { (await import('../core/logger')).logDebug('ui:popup', 'render items', { count: (chosen.items || []).length }) } catch {}
  const tKeys = Object.entries(all).filter(([k]) => k.startsWith('translation:') && k.includes(`${chosen.context?.platform}:${lastContextId}:`))
  const t = tKeys?.[0]?.[1] as any
  const txt = t?.data?.text || t?.text || ''
  const items = [...(chosen.items || [])]
  if (txt) items.push({ kind: 'translation', context: chosen.context, text: txt, createdAt: Date.now() })
  renderItems(list, items)
}

/**
 * 订阅后台事件以刷新列表
 */
function subscribeRefresh(): void {
  chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    if (msg?.type === 'refresh-popup') loadAndRender()
    if (msg?.type === 'translation-updated') {
      try {
        const id = msg?.payload?.id
        const set: Set<string> = (globalThis as any).__uiTranslationInflightIds__ || new Set<string>()
        if (id) set.delete(String(id))
      } catch {}
      loadAndRender()
    }
    if (msg?.type === 'popup-no-context') {
      const list = document.getElementById('list')!
      list.textContent = '⚠️ 当前页面未识别到可下载内容'
      disableFooter()
    }
    return undefined
  })
}

/**
 * 初始化 Popover
 */
function init(): void {
  document.getElementById('btn-settings')?.addEventListener('click', () => chrome.runtime.openOptionsPage())
  document.getElementById('btn-report')?.addEventListener('click', () => alert('请在设置页提交错误报告'))
  document.getElementById('btn-donate')?.addEventListener('click', () => alert('感谢支持！'))
  try { chrome.runtime.sendMessage({ type: 'popup-open' }) } catch {}
  subscribeRefresh()
  loadAndRender()
}

function disableFooter(): void {
  const ids = ['btn-settings', 'btn-report', 'btn-donate']
  for (const id of ids) {
    const btn = document.getElementById(id) as HTMLButtonElement | null
    if (btn) btn.disabled = true
  }
}

init()
