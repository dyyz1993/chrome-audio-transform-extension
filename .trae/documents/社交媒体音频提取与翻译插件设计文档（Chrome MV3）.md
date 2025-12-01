## 设计目标
- 每个平台使用高度定制化的拦截与解析逻辑（平台适配器）。
- 统一输出格式（强类型约束），用于 Popover、下载、翻译与缓存。
- 支持视频、图片、文本、音频，以及基于音频的“翻译后的文本”。

## 项目结构（强调“平台适配器”与“统一契约”）
```
src/
├─ contracts/                  # 统一输出契约（TypeScript 类型与校验）
│  └─ unified.ts
├─ adapters/                   # 平台适配器（抖音/小红书等，高度定制）
│  ├─ douyin.adapter.ts
│  └─ xiaohongshu.adapter.ts
├─ content/
│  ├─ index.ts                 # 内容脚本入口（根据 host 选择适配器）
│  ├─ hooks/                   # fetch/XHR 只读拦截
│  └─ bridge.ts                # 与后台通信
├─ core/
│  ├─ orchestrator.ts          # 统一编排：合并适配器输出 → 契约校验 → 存储
│  ├─ storage.ts               # chrome.storage.local 封装
│  ├─ downloads.ts             # 下载
│  ├─ translate.ts             # 翻译任务（基于音频）
│  └─ logger.ts
├─ popup/                      # Popover（智能菜单与状态）
└─ options/                    # 设置页
```

## 统一输出契约（严格约束）
```ts
// src/contracts/unified.ts
export type MediaKind = 'video' | 'image' | 'text' | 'audio' | 'translation';

export interface UnifiedContext {
  id: string;                          // 上下文 ID（如 aweme_id / notes_id）
  platform: 'douyin' | 'xiaohongshu';  // 平台名
  url: string;                          // 当前页面 URL
}

export interface BaseItem {
  kind: MediaKind;
  context: UnifiedContext;
  source: {                             // 溯源信息（便于调试与上报）
    matcher: string;                    // 命中的拦截规则标识
    originUrl?: string;                 // 原始请求 URL（如 XHR/fetch）
    path?: string;                      // 解析用的 JSONPath/JSPath
  };
  createdAt?: number;                   // 生成时间（排序用）
}

export interface VideoItem extends BaseItem {
  kind: 'video';
  url: string;
  meta?: { bitrate?: number; resolution?: string };
}

export interface ImageItem extends BaseItem {
  kind: 'image';
  url: string;
  meta?: { width?: number; height?: number; format?: string };
}

export interface TextItem extends BaseItem {
  kind: 'text';
  text: string;                         // 文本内容
}

export interface AudioItem extends BaseItem {
  kind: 'audio';
  url: string;
  meta?: { duration?: number; format?: string };
}

export type TranslationStatus = 'pending' | 'translating' | 'done' | 'error';

export interface TranslationItem extends BaseItem {
  kind: 'translation';
  audioRefId: string;                   // 关联的 AudioItem 的 context.id
  status: TranslationStatus;
  language?: string;
  text?: string;                        // 翻译结果文本（status=done 时提供）
  error?: string;                       // 错误信息（status=error 时提供）
}

export type UnifiedItem = VideoItem | ImageItem | TextItem | AudioItem | TranslationItem;

export interface UnifiedExtractionResult {
  context: UnifiedContext;              // 当前页面的统一上下文
  items: UnifiedItem[];                 // 统一条目列表（可混合各种 kind）
}

/**
 * 合同校验：保证所有平台输出满足统一结构
 */
export function assertUnified(result: UnifiedExtractionResult): void {
  if (!result?.context?.id || !result?.context?.platform || !result?.context?.url) {
    throw new Error('Invalid context in UnifiedExtractionResult');
  }
  const kinds = new Set(['video', 'image', 'text', 'audio', 'translation']);
  for (const item of result.items) {
    if (!kinds.has(item.kind)) throw new Error('Unknown kind: ' + (item as any).kind);
    if (item.kind === 'video' || item.kind === 'image' || item.kind === 'audio') {
      if (!(item as any).url) throw new Error('Missing url for media item');
    }
    if (item.kind === 'text') {
      if (!(item as any).text) throw new Error('Missing text for text item');
    }
    if (item.kind === 'translation') {
      const t = item as TranslationItem;
      if (!t.audioRefId || !t.status) throw new Error('Invalid translation item');
    }
  }
}
```

## 平台适配器接口（高度定制 + 统一输出）
```ts
// src/adapters/douyin.adapter.ts
/**
 * 抖音适配器：拦截响应并转换为 UnifiedExtractionResult
 */
export function buildDouyinAdapter(): {
  hostMatch(host: string): boolean;
  installHooks(onUnified: (r: UnifiedExtractionResult) => void): void;
} {
  return {
    hostMatch: (host) => /douyin\.com$|iesdouyin\.com$/.test(host),
    installHooks: (onUnified) => {
      // 只读拦截 fetch/XHR；匹配 aweme 接口
      hookFetch(
        [{ urlRegex: /aweme\/v1\// }, { urlRegex: /aweme\/post\// }],
        (url, json) => {
          const id = json?.aweme_id || extractIdFromDomOrUrl();
          const ctx = { id, platform: 'douyin', url: location.href };
          const items: UnifiedItem[] = [];
          const audio = json?.music?.play_url?.url_list?.[0];
          if (audio) items.push({ kind: 'audio', context: ctx, url: audio, source: { matcher: 'aweme', originUrl: url, path: 'music.play_url.url_list[0]' } });
          const br = json?.video?.bit_rate || [];
          const v = br.find((b: any) => b?.play_addr?.url_list?.[0])?.play_addr?.url_list?.[0];
          if (v) items.push({ kind: 'video', context: ctx, url: v, source: { matcher: 'aweme', originUrl: url, path: 'video.bit_rate[*].play_addr.url_list[0]' } });
          onUnified({ context: ctx, items });
        }
      );
    }
  };
}
```
```ts
// src/adapters/xiaohongshu.adapter.ts
/**
 * 小红书适配器：拦截 notes/images 接口并输出统一结构
 */
export function buildXhsAdapter() {
  return {
    hostMatch: (host: string) => /xiaohongshu\.com$/.test(host),
    installHooks: (onUnified: (r: UnifiedExtractionResult) => void) => {
      hookFetch(
        [{ urlRegex: /\/api\/notes\// }, { urlRegex: /\/api\/images\// }],
        (url, json) => {
          const id = extractNotesIdFromUrl(location.href) || json?.note?.id;
          const ctx = { id, platform: 'xiaohongshu', url: location.href };
          const items: UnifiedItem[] = [];
          const imgs = (json?.images || []).map((x: any) => x?.url).filter(Boolean);
          for (const u of imgs) items.push({ kind: 'image', context: ctx, url: u, source: { matcher: 'images', originUrl: url, path: 'images[*].url' } });
          const text = json?.note?.content;
          if (text) items.push({ kind: 'text', context: ctx, text, source: { matcher: 'notes', originUrl: url, path: 'note.content' } });
          onUnified({ context: ctx, items });
        }
      );
    }
  };
}
```

## 编排（统一入口）
```ts
// src/core/orchestrator.ts
/**
 * 接收各平台适配器输出 → 校验 → 存储 → 更新 Popover
 */
export function orchestrate(r: UnifiedExtractionResult) {
  assertUnified(r);
  // 存储：按 context.id 去重合并；最新在前
  storage.mergeExtraction(r);
  // 若存在音频且已配置翻译接口，则创建/恢复 TranslationItem
  const cfg = storage.getTranslationConfigSync();
  const hasAudio = r.items.some(i => i.kind === 'audio');
  if (cfg && hasAudio) ensureTranslationItems(r.context, cfg);
  // 通知 Popover 刷新
  broadcastToPopup(r.context.id);
}
```

## 翻译（仅基于音频）
- 规则：当 `AudioItem` 存在时才有 `TranslationItem` 的能力；一对一绑定 `audioRefId = context.id`。
- 去重：同 `context.id + 参数组合` 不重复提交；缓存结果并持久化状态。
- Popover 展示：`pending/翻译中/已完成/失败`。

## 数据与拦截差异（平台定制）
- 抖音：
  - 音频：`music.play_url.url_list[0]`
  - 视频：`video.bit_rate[*].play_addr.url_list[0]`
  - ID：URL 纯数字或 DOM `data-e2e-vid`；接口路径以 `aweme` 为主。
- 小红书：
  - 图片：`images[*].url`
  - 文本：`note.content`
  - ID：URL `notes/{id}`；接口为 `notes/images` 等。
- 说明：各平台的拦截规则、解析路径、ID 获取方式均可完全定制；但输出项必须满足 `UnifiedItem` 契约。

## 合同约束（关键点）
- 每个 `UnifiedItem` 必须携带 `context`（含 `id/platform/url`）。
- `video/image/audio` 必须有绝对 `url`；`text` 必须有 `text`。
- `translation` 必须绑定 `audioRefId` 与 `status`；结果文本在 `status=done` 时提供。
- `source` 必填 `matcher`，用于追踪拦截规则来源；建议附带 `originUrl` 与 `path`。

## Popover 与设置：与契约绑定
- Popover：按 `kind` 渲染统一组件；依赖 `status` 显示翻译状态。
- 设置：翻译接口配置决定是否生成/触发 `translation` 条目；下载与去重依赖统一存储结构。

## 验证流程
- 按平台在真实页面验证：拦截命中、解析正确、契约校验通过、状态与 UI 同步。
- 失败回溯：依赖 `source.matcher/originUrl/path` 快速定位平台解析差异。

## 主题与扩展
- 主题：墨蓝配色与统一图标不变；契约保证跨平台一致呈现。
- 扩展：新增平台仅需实现适配器并输出 `UnifiedExtractionResult`。