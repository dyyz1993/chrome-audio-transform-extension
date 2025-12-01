/**
 * 内容脚本加载器：在页面上下文中注入 ESM 模块
 * - 解决非模块环境报错 "Cannot use import statement outside a module"
 * - 通过 <script type="module"> 加载打包后的模块脚本
 */
(function injectModule() {
  try {
    const src = chrome.runtime.getURL('assets/content/index.js')
    const script = document.createElement('script')
    script.type = 'module'
    script.src = src
    script.setAttribute('data-origin', 'chrome-ext-audio-transform')
    document.documentElement.appendChild(script)
  } catch {}
})()

