/**
 * 主世界拦截：只读解析 JSON 并广播到内容脚本（不可使用 chrome.*）
 */
(function () {
  const nativeFetch = window.fetch
  const wrappedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const resp = await nativeFetch(input as any, init)
    try {
      const url = typeof input === 'string' ? input : (input as Request).toString()
      const clone = resp.clone()
      const text = await clone.text()
      try {
        const json = JSON.parse(text)
        // 使用 postMessage 进行跨隔离世界通讯
        window.postMessage({ type: '__ext_json', url, json, xhr:false }, '*')
      } catch {}
    } catch {}
    return resp
  }
    // 1. 保存原生原型方法（核心：脱离原型链依赖）
const nativeXHROpen = XMLHttpRequest.prototype.open;
const nativeXHRSend = XMLHttpRequest.prototype.send;

// 2. 定义存储 URL 的私有属性（避免污染全局，用 Symbol 唯一标识）
const XHR_URL = Symbol('xhr-url');

// 3. 覆盖原型链的 open 方法
Object.defineProperty(XMLHttpRequest.prototype, 'open', {
  value: function (
    method: string,
    url: string,
    async?: boolean,
    user?: string,
    password?: string
  ) {
    // 存储 URL 到当前 XHR 实例（Symbol 避免被外部访问）
    (this as any)[XHR_URL] = url;
    // 调用原生 open 方法（绑定 this 到当前实例）
    return nativeXHROpen.call(this, method, url, async ?? true, user, password);
  },
  writable: false,  // 禁止重新赋值
  configurable: false, // 禁止删除/修改描述符
  enumerable: true
});

// 4. 覆盖原型链的 send 方法
Object.defineProperty(XMLHttpRequest.prototype, 'send', {
  value: function (body?: Document | BodyInit | null) {
    // 监听 load 事件，获取响应
    this.addEventListener('load', () => {
      try {
        const url = (this as any)[XHR_URL] || '';
        const text = this.responseText;
        const json = JSON.parse(text);
        // 发送消息到扩展
        window.postMessage({ type: '__ext_json', url, json, xhr: true }, '*');
      } catch (e) {
        // 非 JSON 响应不处理
      }
    });
    // 调用原生 send 方法
    return nativeXHRSend.call(this, body as Document | XMLHttpRequestBodyInit | null);
  },
  writable: false,
  configurable: false,
  enumerable: true
});
})()
