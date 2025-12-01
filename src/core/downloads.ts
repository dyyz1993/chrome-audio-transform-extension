import { MediaItem } from '@contracts/unified'
import { storage } from './storage'

/**
 * 统一下载：根据设置生成子目录 filename，并触发下载
 */
export async function download(item: MediaItem, filenameHint?: string): Promise<void> {
  const cfg: any = await storage.getSettings()
  const base = `${item.platform}/${cfg.userNickname || 'user'}_${cfg.userId || 'id'}/${item.context.id}/`
  const name = filenameHint || inferName(item.kind === 'text' ? 'text.txt' : (item as any).url)
  const url = (item as any).url || 'data:text/plain,' + encodeURIComponent((item as any).text || '')
  try { (await import('./logger')).logDebug('core:downloads', 'download', { filename: base + name, kind: (item as any).kind }) } catch {}
  chrome.downloads.download({ url, filename: base + name })
}

/**
 * 推断文件名
 */
function inferName(url: string): string {
  try {
    const u = new URL(url)
    const pathname = u.pathname.split('/').pop() || 'file'
    return pathname
  } catch {
    return 'file'
  }
}
