/**
 * 内容脚本入口：安装基础桥接，等待平台适配器挂载（后续由适配器调用 hookFetch/hookXhr）
 */
import { buildDouyinAdapter } from '@adapters/douyin.adapter'
import { buildXhsAdapter } from '@adapters/xiaohongshu.adapter'

(function main() {
  const host = location.hostname
  try { (window as any).console?.debug?.('[content] start', { host }) } catch {}
  const adapters = [buildDouyinAdapter(), buildXhsAdapter()]
  adapters.forEach(a => { if (a.hostMatch(host)) a.installHooks() })
})()
