/**
 * 向后台发送统一结果，并接收指令（如触发翻译/刷新）
 */
export function sendUnified(result: any): void {
  try {
    chrome.runtime?.sendMessage?.({ type: 'unified', payload: result })
  } catch {}
}

/**
 * 订阅后台消息（例如请求内容脚本重新扫描或更新 UI）
 */
export function onBackgroundMessage(handler: (msg: any, sender: chrome.runtime.MessageSender) => void): void {
  try {
    chrome.runtime?.onMessage?.addListener(handler)
  } catch {}
}
