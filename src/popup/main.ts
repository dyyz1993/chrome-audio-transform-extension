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
  const { lastContextId } = await chrome.storage.local.get(['lastContextId'])
  try { (await import('../core/logger')).logDebug('ui:popup', 'load lastContextId', { lastContextId }) } catch {}
  if (!lastContextId) {
    list.textContent = '⚠️ 正在加载菜单...'
    return
  }
  const exKeys = await chrome.storage.local.get(null)
  const entries = Object.entries(exKeys).filter(([k]) => k.startsWith('extraction:'))
  const chosen = entries.find(([k]) => k.endsWith(':' + lastContextId))?.[1] as any
  if (!chosen) {
    list.textContent = '⚠️ 无可展示内容'
    return
  }
  const header = document.getElementById('header')
  if (header) header.textContent = `${platformName(chosen.context?.platform)} 下载器`
  try { (await import('../core/logger')).logDebug('ui:popup', 'render items', { count: (chosen.items || []).length }) } catch {}
  renderItems(list, chosen.items || [])
}

/**
 * 订阅后台事件以刷新列表
 */
function subscribeRefresh(): void {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'refresh-popup') loadAndRender()
    if (msg?.type === 'translation-updated') loadAndRender()
  })
}

/**
 * 初始化 Popover
 */
function init(): void {
  document.getElementById('btn-settings')?.addEventListener('click', () => chrome.runtime.openOptionsPage())
  document.getElementById('btn-report')?.addEventListener('click', () => alert('请在设置页提交错误报告'))
  document.getElementById('btn-donate')?.addEventListener('click', () => alert('感谢支持！'))
  subscribeRefresh()
  loadAndRender()
}

init()
