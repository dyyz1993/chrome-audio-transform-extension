/**
 * 渲染统一条目到 Popover 列表
 */
import { download } from '@core/downloads'

const inflight: Set<string> = (globalThis as any).__uiTranslationInflightIds__ || new Set<string>()
;(globalThis as any).__uiTranslationInflightIds__ = inflight

export function renderItems(el: HTMLElement, items: any[]): void {
  el.innerHTML = ''
  const relevant = sortRelevant(items)
  if (!relevant.length) {
    const loading = document.createElement('div')
    loading.textContent = '⚠️ 正在加载菜单...'
    el.appendChild(loading)
    return
  }
  const hasTranslation = relevant.some(x => x?.kind === 'translation')
  const hasTranslating = relevant.some(x => x?.kind === 'translation-status' && !(x as any).error)
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
    if (it.kind === 'audio' && !hasTranslation && !hasTranslating) {
      const badge = document.createElement('span')
      badge.className = 'badge warn'
      const id = String(it?.context?.id || '')
      const isBusy = inflight.has(id)
      badge.textContent = isBusy ? '翻译中' : '可翻译'
      if (!isBusy) {
        badge.style.cursor = 'pointer'
        badge.addEventListener('click', (ev) => {
          ev.stopPropagation()
          inflight.add(id)
          badge.textContent = '翻译中'
          badge.style.cursor = 'not-allowed'
          try { chrome.runtime?.sendMessage?.({ type: 'ensure-translation', payload: { context: it.context } }) } catch {}
        })
      } else {
        badge.style.cursor = 'not-allowed'
      }
      right.appendChild(badge)
    }
    if (it.kind === 'translation') {
      const m = (it as any).meta || {}
      const parts: string[] = []
      if (m.model) parts.push(String(m.model))
      if (m.file_size_mb) parts.push(`${m.file_size_mb}MB`)
      if (m.duration_ms != null) parts.push(`${Math.round(Number(m.duration_ms) / 1000)}s`)
      if (parts.length) label.textContent = `${label.textContent} (${parts.join(' · ')})`
      const copyBtn = document.createElement('button')
      copyBtn.className = 'badge ok'
      copyBtn.textContent = '复制'
      copyBtn.style.cursor = 'pointer'
      copyBtn.addEventListener('click', (ev) => {
        ev.stopPropagation()
        const txt = String((it as any).text || '')
        if (!txt) return
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(txt).then(() => { copyBtn.textContent = '已复制' })
        } else {
          const ta = document.createElement('textarea')
          ta.value = txt
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          copyBtn.textContent = '已复制'
        }
      })
      right.appendChild(copyBtn)

      const dlBtn = document.createElement('button')
      dlBtn.className = 'badge ok'
      dlBtn.textContent = '下载'
      dlBtn.style.cursor = 'pointer'
      dlBtn.addEventListener('click', (ev) => {
        ev.stopPropagation()
        const txt = String((it as any).text || '')
        if (!txt) return
        const synthetic: any = { kind: 'text', context: it.context, text: txt }
        void download(synthetic as any, 'translation.txt')
      })
      right.appendChild(dlBtn)
    }
    if (it.kind === 'translation-status') {
      label.textContent = String((it as any).text || '')
      label.style.fontSize = '12px'
      label.style.color = '#9ca3af'
    }
    div.append(left, right)
    if (it.kind !== 'translation') {
      div.style.cursor = 'pointer'
      div.addEventListener('click', () => { void download(it) })
    }
    el.appendChild(div)
  }
}

/**
 * 选择图标
 */
function iconFor(kind: string): string {
  if (kind === 'video') return '📽️'
  if (kind === 'audio') return '🎵'
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
