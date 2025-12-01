import { renderItems } from './ui'
let __detectTimer__: number | null = null

function platformName(p: string | undefined): string {
  if (p === 'douyin') return '抖音'
  if (p === 'xiaohongshu') return '小红书'
  return '下载器'
}

/**
 * 加载最新上下文的提取结果并渲染
 */
async function loadAndRender(): Promise<void> {
  clearDetect()
  const list = document.getElementById('list')!
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const host = tabs?.[0]?.url ? new URL(tabs[0].url!).hostname : ''
  const isDouyin = /douyin\.com$|iesdouyin\.com$/.test(host)
  const isXhs = /xiaohongshu\.com$/.test(host)
  if (!isDouyin && !isXhs) {
    list.textContent = '⚠️ 当前页面不支持'
    disableFooter()
    ;(globalThis as any).__uiHasRendered__ = true
    return
  }
  const all = await chrome.storage.local.get()
  const lastContextId = all.lastContextId
  try { (await import('../core/logger')).logDebug('ui:popup', 'load lastContextId', { lastContextId }) } catch {}
  if (!lastContextId) {
    return
  }
  const entries = Object.entries(all).filter(([k]) => k.startsWith('extraction:'))
  const chosen = entries.find(([k]) => k.endsWith(':' + lastContextId))?.[1] as any
  if (!chosen) {
    list.textContent = '⚠️ 未识别到可下载内容'
    disableFooter()
    return
  }
  const header = document.getElementById('header')
  if (header) header.textContent = `${platformName(chosen.context?.platform)} 下载器`
  try { (await import('../core/logger')).logDebug('ui:popup', 'render items', { count: (chosen.items || []).length }) } catch {}
  const prefix = `${chosen.context?.platform}:${lastContextId}:`
  const tKeys = Object.entries(all).filter(([k]) => k.startsWith('translation:') && k.includes(prefix))
  const t = tKeys?.[0]?.[1] as any
  const txt = t?.data?.text || t?.text || ''
  const meta = t?.data?.metadata || {}
  const duration_ms = t?.duration_ms ?? t?.data?.duration_ms
  const sKeys = Object.entries(all).filter(([k]) => k.startsWith('translation-status:') && k.includes(prefix))
  const st = sKeys?.[0]?.[1] as any
  const items = [...(chosen.items || [])]
  if (st?.state === 'in_progress' && !txt) items.push({ kind: 'translation-status', context: chosen.context, text: '当前正在翻译...', createdAt: Date.now() })
  if (st?.state === 'error' && !txt) items.push({ kind: 'translation-status', context: chosen.context, text: '翻译失败', error: true, createdAt: Date.now() })
  if (txt) items.push({ kind: 'translation', context: chosen.context, text: txt, meta: { model: meta?.model, file_size_mb: meta?.file_size_mb, duration_ms }, createdAt: Date.now() })
  renderItems(list, items)
  ;(globalThis as any).__uiHasRendered__ = true
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
    return undefined
  })
}

/**
 * 初始化 Popover：先订阅消息，重置为空，再发送打开事件
 */
function init(): void {
  document.getElementById('btn-settings')?.addEventListener('click', () => chrome.runtime.openOptionsPage())
  document.getElementById('btn-report')?.addEventListener('click', () => alert('请在设置页提交错误报告，暂未实现'))
  document.getElementById('btn-donate')?.addEventListener('click', () => alert('感谢支持！暂未实现'))
  subscribeRefresh()
  resetEmptyState()
  try { chrome.runtime.sendMessage({ type: 'popup-open' }) } catch {}
  scheduleDetect()
}

function disableFooter(): void {
  const ids = ['btn-settings', 'btn-report', 'btn-donate']
  for (const id of ids) {
    const btn = document.getElementById(id) as HTMLButtonElement | null
    if (btn) btn.disabled = true
  }
}

/**
 * 重置为空状态：清空列表与标题，不主动渲染上次内容
 */
function resetEmptyState(): void {
  const list = document.getElementById('list')!
  const header = document.getElementById('header')
  if (header) header.textContent = '下载器'
  list.textContent = ''
}

function scheduleDetect(): void {
  clearDetect()
  const list = document.getElementById('list')!
  list.textContent = '⚠️ 正在识别当前页面...'
  __detectTimer__ = setTimeout(() => {
    try {
      const done = !!(globalThis as any).__uiHasRendered__
      if (!done) {
        list.textContent = '⚠️ 未识别到可下载内容'
        disableFooter()
      }
    } catch {}
  }, 1500) as any
}

function clearDetect(): void {
  if (__detectTimer__ != null) {
    clearTimeout(__detectTimer__ as any)
    __detectTimer__ = null
  }
}

init()
