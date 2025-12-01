/**
 * 内容脚本入口：安装基础桥接，等待平台适配器挂载（后续由适配器调用 hookFetch/hookXhr）
 */
import { buildDouyinAdapter, extractDouyinContextId, extractFromCacheById } from '@adapters/douyin.adapter'
import { buildXhsAdapter } from '@adapters/xiaohongshu.adapter'
import * as bridge from './bridge'

/**
 * 注入主世界拦截脚本并事件路由到平台适配器
 */
(function main() {
  console.info('[content] init', { host: location.hostname })
  try {
    chrome.storage.local.get(['settings']).then(r => {
      const enabled = !!r.settings?.debug
      ;(globalThis as any).__debug_enabled__ = enabled
      console.info('[content] debug init', { enabled })
    })
  } catch {}
  const src = chrome.runtime.getURL('assets/content/inject.js')
  const s = document.createElement('script')
  s.src = src
  ;(document.documentElement || document.head).appendChild(s)

  const douyin = buildDouyinAdapter()
  const xhs = buildXhsAdapter()
  const host = location.hostname
  const isDouyin = /douyin\.com$|iesdouyin\.com$/.test(host)
  const isXhs = /xiaohongshu\.com$/.test(host)

  window.addEventListener('message', (ev: MessageEvent) => {
    if (ev.source !== window) return
    const data: any = ev.data
    if (!data || data.type !== '__ext_json') return
    const { url, json, xhr } = data
    try {
      if (isDouyin) {
        // Douyin：仅缓存原始 JSON，延迟到 popup 打开时再抽取
        void douyin.handleJson?.(url, json, xhr)
      } else if (isXhs) {
        const r = xhs.handleJson?.(url, json, xhr)
        if (r) {
          bridge.sendUnified(r)
        }
      }
    } catch {}
  })

  // 弹窗打开时：获取 aweme_id 并基于缓存抽取统一结果
  bridge.onBackgroundMessage((msg) => {
    console.log('[content] onBackgroundMessage', { msg })
    if (msg?.type !== 'popup-open') return
    try {
      const id = extractDouyinContextId(document, location.href)
      if (!id) return
      const r = extractFromCacheById(id)
      if (r) bridge.sendUnified(r)
    } catch {}
  })
})()
