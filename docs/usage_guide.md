# 详细使用说明 / Detailed Usage Guide

## 目录 / Table of Contents

1. [快速开始 / Quick Start](#快速开始--quick-start)
2. [功能详解 / Feature Details](#功能详解--feature-details)
3. [高级配置 / Advanced Configuration](#高级配置--advanced-configuration)
4. [故障排除 / Troubleshooting](#故障排除--troubleshooting)
5. [API参考 / API Reference](#api参考--api-reference)
6. [开发者指南 / Developer Guide](#开发者指南--developer-guide)

---

## 快速开始 / Quick Start

### 第一步：安装扩展 / Step 1: Install Extension

1. 下载最新版本的扩展包 / Download the latest extension package
2. 解压到本地文件夹 / Extract to a local folder
3. 打开Chrome浏览器，进入 `chrome://extensions/` / Open Chrome browser and navigate to `chrome://extensions/`
4. 开启"开发者模式" / Enable "Developer mode"
5. 点击"加载已解压的扩展程序" / Click "Load unpacked"
6. 选择解压的文件夹 / Select the extracted folder

### 第二步：基本使用 / Step 2: Basic Usage

1. 访问抖音网页版 / Visit Douyin web version
2. 打开包含音频的视频内容 / Open video content containing audio
3. 点击浏览器工具栏中的扩展图标 / Click the extension icon in the browser toolbar
4. 在弹出的界面中查看可提取的音频内容 / View extractable audio content in the popup
5. 点击下载按钮保存音频文件 / Click the download button to save the audio file

---

## 功能详解 / Feature Details

### 音频提取功能 / Audio Extraction Feature

#### 抖音平台支持 / Douyin Platform Support

扩展通过以下方式从抖音提取音频：

1. **网络请求拦截 / Network Request Interception**
   - 扩展会拦截抖音页面的网络请求 / The extension intercepts network requests from Douyin pages
   - 自动识别包含音频数据的API响应 / Automatically identifies API responses containing audio data

2. **DOM数据提取 / DOM Data Extraction**
   - 从页面DOM结构中提取视频信息 / Extract video information from page DOM structure
   - 获取视频ID和元数据 / Get video ID and metadata

3. **音频URL解析 / Audio URL Parsing**
   - 从API响应中解析出音频下载链接 / Parse audio download links from API responses
   - 支持多种音频格式 / Support multiple audio formats

#### 小红书平台支持 / Xiaohongshu Platform Support

小红书支持正在开发中，将包含以下功能：

- 笔记音频提取 / Note audio extraction
- 视频内容音频提取 / Video content audio extraction
- 图片文本提取与翻译 / Image text extraction and translation

### 音频翻译功能 / Audio Translation Feature

#### 翻译流程 / Translation Process

1. **音频上传 / Audio Upload**
   - 将提取的音频上传到翻译服务 / Upload extracted audio to translation service
   - 支持多种音频格式 / Support multiple audio formats

2. **语音识别 / Speech Recognition**
   - 使用SenseVoiceSmall或whisper_base模型进行语音识别 / Use SenseVoiceSmall or whisper_base models for speech recognition
   - 生成原始文本和时间戳 / Generate original text and timestamps

3. **文本翻译 / Text Translation**
   - 将识别的文本翻译为目标语言 / Translate recognized text to target language
   - 保持时间戳同步 / Maintain timestamp synchronization

4. **结果下载 / Result Download**
   - 下载翻译后的文本文件 / Download translated text files
   - 可选择下载带时间戳的SRT文件 / Option to download timestamped SRT files

<div align="center">
  <img src="docs/images/third-part-voice.png" alt="翻译流程" width="600">
  <p>翻译流程示意图 / Translation Process Diagram</p>
</div>

---

## 高级配置 / Advanced Configuration

### 翻译服务部署 / Translation Service Deployment

#### 使用 script-gateway 部署 / Deploy with script-gateway

1. **环境准备 / Environment Preparation**
   ```bash
   # 安装Python环境 / Install Python environment
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或 / or venv\Scripts\activate  # Windows
   
   # 安装依赖 / Install dependencies
   pip install script-gateway
   ```

2. **模型配置 / Model Configuration**
   ```python
   # 配置SenseVoiceSmall模型 / Configure SenseVoiceSmall model
   {
     "model_name": "SenseVoiceSmall",
     "model_path": "/path/to/SenseVoiceSmall",
     "language": "auto",  # 自动检测语言 / Auto-detect language
     "output_format": "srt"  # 输出格式 / Output format
   }
   ```

3. **服务启动 / Service Start**
   ```bash
   # 启动服务 / Start service
   script-gateway --host 0.0.0.0 --port 8000
   ```

4. **扩展配置 / Extension Configuration**
   - 在扩展设置中输入API地址 / Enter API address in extension settings
   - 格式：`http://your-server:8000/api/scripts/{model-id}/run` / Format: `http://your-server:8000/api/scripts/{model-id}/run`

### 高级参数设置 / Advanced Parameter Settings

| 参数 / Parameter | 高级选项 / Advanced Options | 说明 / Description |
|-----------------|---------------------------|-------------------|
| 翻译质量 / Translation Quality | high/medium/low | 控制翻译输出的质量 / Control translation output quality |
| 并发处理 / Concurrent Processing | 1-10 | 同时处理的翻译任务数量 / Number of simultaneous translation tasks |
| 缓存策略 / Cache Strategy | on/off | 是否缓存翻译结果 / Whether to cache translation results |
| 自动重试 / Auto Retry | times | 翻译失败时的自动重试次数 / Auto retry count on translation failure |

---

## 故障排除 / Troubleshooting

### 常见问题 / Common Issues

#### 1. 扩展无法加载 / Extension Won't Load

**症状 / Symptoms**: 
- 扩展图标显示为灰色 / Extension icon shows as gray
- 扩展列表中显示错误 / Error shown in extension list

**解决方案 / Solutions**:
1. 检查Chrome版本是否为88+ / Check if Chrome version is 88+
2. 确保扩展文件夹包含所有必要文件 / Ensure extension folder contains all necessary files
3. 检查manifest.json语法是否正确 / Check if manifest.json syntax is correct

#### 2. 无法提取音频 / Unable to Extract Audio

**症状 / Symptoms**:
- 弹窗显示"无音频内容" / Popup shows "No audio content"
- 下载按钮无响应 / Download button unresponsive

**解决方案 / Solutions**:
1. 确保在支持的平台页面上 / Ensure you are on a supported platform page
2. 刷新页面后重试 / Refresh the page and try again
3. 检查网络连接 / Check network connection
4. 确保页面已完全加载 / Ensure page has fully loaded

#### 3. 翻译功能失败 / Translation Function Fails

**症状 / Symptoms**:
- 翻译按钮点击后无响应 / Translation button unresponsive after click
- 显示"翻译失败"错误 / Shows "Translation failed" error

**解决方案 / Solutions**:
1. 检查API地址配置是否正确 / Check if API address is configured correctly
2. 确认翻译服务正常运行 / Confirm translation service is running normally
3. 检查网络防火墙设置 / Check network firewall settings
4. 查看浏览器控制台错误信息 / Check browser console for error messages

#### 4. 下载文件为空或损坏 / Downloaded File is Empty or Corrupted

**症状 / Symptoms**:
- 下载的音频文件无法播放 / Downloaded audio file cannot be played
- 文件大小异常 / File size is abnormal

**解决方案 / Solutions**:
1. 尝试使用不同的下载位置 / Try using a different download location
2. 检查磁盘空间 / Check disk space
3. 禁用其他下载管理器扩展 / Disable other download manager extensions
4. 尝试使用不同的浏览器 / Try using a different browser

### 调试模式 / Debug Mode

启用调试模式以获取详细日志信息：

1. 打开扩展设置页面 / Open extension settings page
2. 将"调试模式"设置为"ON" / Set "Debug Mode" to "ON"
3. 打开浏览器开发者工具 / Open browser developer tools
4. 查看控制台日志信息 / Check console log information

---

## API参考 / API Reference

### 扩展内部API / Extension Internal API

#### 消息传递 / Message Passing

扩展使用Chrome消息传递API进行组件间通信：

```javascript
// 发送统一数据到后台 / Send unified data to background
chrome.runtime.sendMessage({
  type: 'unified',
  payload: {
    context: { id: 'video-id', platform: 'douyin' },
    items: [
      { kind: 'audio', url: 'audio-url', context: {...} }
    ]
  }
});

// 请求翻译 / Request translation
chrome.runtime.sendMessage({
  type: 'ensure-translation',
  payload: {
    context: { id: 'video-id', platform: 'douyin' }
  }
});
```

#### 存储API / Storage API

扩展使用Chrome存储API保存用户设置和数据：

```javascript
// 保存设置 / Save settings
chrome.storage.local.set({
  settings: {
    translation: {
      api: 'http://your-server:8000/api/scripts/10/run',
      model: 'SenseVoiceSmall'
    },
    userNickname: 'user',
    userId: 'id'
  }
});

// 获取设置 / Get settings
chrome.storage.local.get(['settings']).then(result => {
  const settings = result.settings;
});
```

### 第三方翻译API / Third-party Translation API

#### 请求格式 / Request Format

```javascript
// POST /api/scripts/{model-id}/run
{
  "audio_url": "https://example.com/audio.mp3",
  "options": {
    "language": "auto",
    "output_format": "srt",
    "quality": "high"
  }
}
```

#### 响应格式 / Response Format

```javascript
{
  "status": "success",
  "result": {
    "text": "识别的文本内容",
    "translated_text": "翻译后的文本内容",
    "srt": "1\n00:00:00,000 --> 00:00:05,000\n翻译后的文本内容",
    "duration": 5.2
  }
}
```

---

## 开发者指南 / Developer Guide

### 项目结构 / Project Structure

```
chrome-ext-audio-transform/
├── src/
│   ├── adapters/           # 平台适配器 / Platform adapters
│   │   ├── douyin.adapter.ts
│   │   └── xiaohongshu.adapter.ts
│   ├── background/         # 后台脚本 / Background scripts
│   │   └── index.ts
│   ├── content/            # 内容脚本 / Content scripts
│   │   ├── index.ts
│   │   ├── bridge.ts
│   │   └── inject.ts
│   ├── core/               # 核心功能 / Core functionality
│   │   ├── downloads.ts
│   │   ├── storage.ts
│   │   ├── translate.ts
│   │   └── orchestrator.ts
│   ├── popup/              # 弹窗界面 / Popup interface
│   │   ├── index.html
│   │   └── main.ts
│   └── options/            # 设置页面 / Options page
│       ├── index.html
│       └── main.ts
├── public/                 # 静态资源 / Static assets
│   ├── manifest.json
│   └── icons/
├── docs/                   # 文档 / Documentation
│   └── images/
└── package.json
```

### 开发环境搭建 / Development Environment Setup

1. **克隆仓库 / Clone Repository**
   ```bash
   git clone https://github.com/your-username/chrome-ext-audio-transform.git
   cd chrome-ext-audio-transform
   ```

2. **安装依赖 / Install Dependencies**
   ```bash
   npm install
   ```

3. **开发模式 / Development Mode**
   ```bash
   npm run dev
   ```

4. **构建生产版本 / Build for Production**
   ```bash
   npm run build
   ```

5. **运行测试 / Run Tests**
   ```bash
   npm test
   ```

### 添加新平台支持 / Adding New Platform Support

1. **创建适配器 / Create Adapter**
   ```typescript
   // src/adapters/newplatform.adapter.ts
   export function extractNewPlatformContextId(doc: Document, url: string): string | null {
     // 实现上下文ID提取逻辑 / Implement context ID extraction logic
   }
   
   export function extractFromNewPlatformCache(id: string): UnifiedExtractionResult | null {
     // 实现缓存数据提取逻辑 / Implement cache data extraction logic
   }
   ```

2. **注册适配器 / Register Adapter**
   ```typescript
   // src/content/index.ts
   import { extractNewPlatformContextId, extractFromNewPlatformCache } from '@adapters/newplatform.adapter'
   
   // 在适当的地方调用新平台适配器 / Call new platform adapter at appropriate places
   ```

3. **更新manifest.json / Update manifest.json**
   ```json
   {
     "content_scripts": [
       {
         "matches": ["https://*.newplatform.com/*"],
         "js": ["assets/content/index.js"],
         "run_at": "document_start",
         "all_frames": true
       }
     ]
   }
   ```

### 贡献指南 / Contributing Guidelines

1. **代码风格 / Code Style**
   - 使用TypeScript编写代码 / Write code in TypeScript
   - 遵循ESLint规则 / Follow ESLint rules
   - 添加适当的注释 / Add appropriate comments

2. **提交规范 / Commit Guidelines**
   - 使用清晰的提交信息 / Use clear commit messages
   - 一个提交只做一件事 / One thing per commit
   - 提交前运行测试 / Run tests before committing

3. **Pull Request流程 / Pull Request Process**
   - Fork仓库 / Fork the repository
   - 创建功能分支 / Create a feature branch
   - 编写测试 / Write tests
   - 提交Pull Request / Submit Pull Request

---

## 附录 / Appendix

### 版本历史 / Version History

#### v0.3.6 (当前版本 / Current Version)
- ✅ 实现抖音音频提取功能 / Implemented Douyin audio extraction
- ✅ 添加翻译功能支持 / Added translation support
- ✅ 优化用户界面 / Optimized user interface
- 🚧 小红书支持开发中 / Xiaohongshu support under development

#### 未来计划 / Future Plans
- 📋 完善小红书平台支持 / Complete Xiaohongshu platform support
- 📋 添加更多平台支持 / Add support for more platforms
- 📋 优化翻译质量 / Optimize translation quality
- 📋 添加批量处理功能 / Add batch processing functionality

### 许可证 / License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情 / This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### 致谢 / Acknowledgments

感谢以下开源项目和贡献者 / Thanks to the following open source projects and contributors:

- Chrome Extension API / Chrome扩展API
- SenseVoiceSmall模型 / SenseVoiceSmall model
- Whisper模型 / Whisper model
- script-gateway项目 / script-gateway project

---

<div align="center">
  <p>如有问题或建议，请创建Issue或联系开发团队 / For questions or suggestions, please create an Issue or contact the development team</p>
</div>