import { submitTranslation } from '@core/translate'
import { logDebug } from '@core/logger'

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.type === 'offscreen-translate') {
    const { audio, cfg } = msg.payload
    logDebug('offscreen', 'translate', { id: audio?.context?.id })
    ;(async () => {
      try {
        await submitTranslation(audio, cfg)
      } catch {}
    })()
    return true
  }
})
