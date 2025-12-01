/**
 * 渲染统一条目到 Popover 列表
 */
export function renderItems(el: HTMLElement, items: any[]): void {
  el.innerHTML = ''
  const relevant = sortRelevant(items)
  if (!relevant.length) {
    const loading = document.createElement('div')
    loading.textContent = '⚠️ 正在加载菜单...'
    el.appendChild(loading)
    return
  }
  for (const it of relevant) {
    const div = document.createElement('div')
    div.className = 'item'
    const left = document.createElement('div')
    left.className = 'left'
    const icon = document.createElement('span')
    icon.textContent = iconFor(it.kind)
    const label = document.createElement('span')
    label.textContent = labelFor(it)
    left.append(icon, label)
    const right = document.createElement('div')
    if (it.kind === 'audio') {
      const badge = document.createElement('span')
      badge.className = 'badge warn'
      badge.textContent = '可翻译'
      right.appendChild(badge)
    }
    div.append(left, right)
    el.appendChild(div)
  }
}

/**
 * 选择图标
 */
function iconFor(kind: string): string {
  if (kind === 'video') return '▶'
  if (kind === 'audio') return '♪'
  if (kind === 'image') return '🖼'
  if (kind === 'text') return '📄'
  if (kind === 'translation') return '🗣'
  return '•'
}

/**
 * 生成标签文案
 */
function labelFor(it: any): string {
  if (it.kind === 'text') return '下载文本 ▶'
  if (it.kind === 'image') return '下载此图片 ▶'
  if (it.kind === 'video' || it.kind === 'audio') return '下载媒体 ▶'
  if (it.kind === 'translation') return '翻译结果 ▶'
  return '未知 ▶'
}

/**
 * 排序最相关（音频/视频优先，最新在前）
 */
function sortRelevant(items: any[]): any[] {
  const weight = (k: string) => (k === 'audio' ? 3 : k === 'video' ? 2 : k === 'image' ? 1 : 0)
  return [...items].sort((a, b) => weight(b.kind) - weight(a.kind) || (b.createdAt || 0) - (a.createdAt || 0))
}
