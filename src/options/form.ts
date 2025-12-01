/**
 * 读取设置表单的值
 */
export function readForm(): any {
  const q = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)
  return {
    repeat: q('repeat').value === 'on',
    chooseLoc: q('chooseLoc').value === 'on',
    refresh: q('refresh').value,
    imgfmt: q('imgfmt').value,
    translation: { api: q('transApi').value, language: 'auto', use_itn: true, output_timestamp: false, device: 'cpu' },
    debug: q('debug').value === 'on',
    userNickname: (q('nickname') as HTMLInputElement).value,
    userId: (q('userid') as HTMLInputElement).value
  }
}

/**
 * 将设置写入 chrome.storage.local
 */
export async function saveSettings(settings: any): Promise<void> {
  await chrome.storage.local.set({ settings })
}

/**
 * 将翻译配置写入同步缓存（后台快速获取）
 */
export function updateTranslationSync(cfg: any): void {
  (globalThis as any).__translation_cfg__ = cfg
}

export function updateDebugSync(enabled: boolean): void {
  (globalThis as any).__debug_enabled__ = enabled
}

/**
 * 渲染已有设置到表单
 */
export async function renderSettings(): Promise<void> {
  const r = await chrome.storage.local.get(['settings'])
  const s = r.settings || {}
  const w = (id: string, v: string) => ((document.getElementById(id) as HTMLInputElement | HTMLSelectElement).value = v)
  w('repeat', s.repeat ? 'on' : 'off')
  w('chooseLoc', s.chooseLoc ? 'on' : 'off')
  w('refresh', s.refresh || 'never')
  w('imgfmt', s.imgfmt || 'original')
  w('transApi', s.translation?.api || '')
  w('order', s.order || 'newest')
  w('debug', s.debug ? 'on' : 'off')
  w('nickname', s.userNickname || '')
  w('userid', s.userId || '')
}
