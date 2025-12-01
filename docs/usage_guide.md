# 详细使用说明 / Detailed Usage Guide

## 目录 / Table of Contents

1. [快速开始 / Quick Start](#快速开始--quick-start)
2. [功能详解 / Feature Details](#功能详解--feature-details)
3. [高级配置 / Advanced Configuration](#高级配置--advanced-configuration)
4. [故障排除 / Troubleshooting](#故障排除--troubleshooting)
5. [常见问题 / FAQ](#常见问题--faq)
6. [更新日志 / Changelog](#更新日志--changelog)

---

## 快速开始 / Quick Start

### 安装扩展 / Installing the Extension

1. 下载最新版本的扩展文件 / Download the latest version of the extension files
2. 打开 Chrome 浏览器，访问 `chrome://extensions/` / Open Chrome browser and navigate to `chrome://extensions/`
3. 开启右上角的"开发者模式" / Enable "Developer mode" in the top right corner
4. 点击"加载已解压的扩展程序" / Click "Load unpacked"
5. 选择解压后的扩展文件夹 / Select the extracted extension folder

### 基本使用 / Basic Usage

1. 打开包含音频的网页 / Open a webpage containing audio
2. 点击扩展图标激活功能 / Click the extension icon to activate features
3. 选择所需的转换选项 / Select the desired conversion options
4. 点击"开始转换"按钮 / Click the "Start Conversion" button
5. 等待处理完成并下载结果 / Wait for processing to complete and download the result

---

## 功能详解 / Feature Details

### 音频格式转换 / Audio Format Conversion

支持多种音频格式之间的转换，包括但不限于：

Supports conversion between multiple audio formats, including but not limited to:

- MP3 ↔ WAV
- MP3 ↔ FLAC
- AAC ↔ MP3
- OGG ↔ MP3

### 音频内容翻译 / Audio Content Translation

1. **自动语言检测** / Automatic Language Detection
   - 扩展会自动检测音频中的语言 / The extension automatically detects the language in the audio

2. **多语言支持** / Multi-language Support
   - 支持翻译为多种目标语言 / Supports translation to multiple target languages
   - 可在设置中配置首选翻译语言 / Preferred translation language can be configured in settings

3. **翻译质量优化** / Translation Quality Optimization
   - 使用先进的语音识别技术 / Uses advanced speech recognition technology
   - 支持上下文感知翻译 / Supports context-aware translation

### 字幕生成 / Subtitle Generation

1. **自动时间轴生成** / Automatic Timeline Generation
   - 精确的时间戳匹配 / Precise timestamp matching

2. **多格式字幕支持** / Multi-format Subtitle Support
   - SRT 格式 / SRT format
   - VTT 格式 / VTT format
   - 自定义格式 / Custom format

---

## 高级配置 / Advanced Configuration

### API 配置 / API Configuration

1. 打开扩展选项页面 / Open the extension options page
2. 在"API 设置"部分配置以下选项 / Configure the following options in the "API Settings" section:
   - API 密钥 / API Key
   - 服务端点 / Service Endpoint
   - 请求超时时间 / Request Timeout

### 转换质量设置 / Conversion Quality Settings

1. **音频质量** / Audio Quality
   - 高质量 / High Quality (推荐文件较小 / Recommended for smaller files)
   - 标准质量 / Standard Quality (平衡大小和质量 / Balanced size and quality)
   - 自定义质量 / Custom Quality (根据需求调整 / Adjust according to needs)

2. **采样率设置** / Sample Rate Settings
   - 44.1 kHz (CD 质量 / CD Quality)
   - 48 kHz (标准视频质量 / Standard Video Quality)
   - 自定义采样率 / Custom Sample Rate

### 批量处理设置 / Batch Processing Settings

1. **并发处理数量** / Concurrent Processing Count
   - 设置同时处理的文件数量 / Set the number of files processed simultaneously
   - 建议根据系统性能调整 / Recommended to adjust based on system performance

2. **处理队列管理** / Processing Queue Management
   - 查看当前处理队列 / View current processing queue
   - 暂停/恢复处理任务 / Pause/Resume processing tasks

---

## 故障排除 / Troubleshooting

### 常见问题及解决方案 / Common Issues and Solutions

1. **扩展无法加载** / Extension Fails to Load
   - 检查 Chrome 版本是否为最新 / Check if Chrome is up to date
   - 确保扩展文件完整 / Ensure extension files are complete
   - 尝试重新加载扩展 / Try reloading the extension

2. **音频转换失败** / Audio Conversion Fails
   - 检查音频文件是否损坏 / Check if the audio file is corrupted
   - 确认目标格式是否支持 / Confirm if the target format is supported
   - 尝试降低转换质量设置 / Try lowering the conversion quality settings

3. **翻译功能不工作** / Translation Function Not Working
   - 检查 API 配置是否正确 / Check if API configuration is correct
   - 确认网络连接正常 / Confirm normal network connection
   - 验证 API 密钥是否有效 / Verify if the API key is valid

4. **字幕生成错误** / Subtitle Generation Errors
   - 检查音频语言是否支持 / Check if the audio language is supported
   - 尝试调整音频质量设置 / Try adjusting audio quality settings
   - 确认输出格式是否正确 / Confirm if the output format is correct

### 错误代码参考 / Error Code Reference

| 错误代码 / Error Code | 描述 / Description | 解决方案 / Solution |
|---------------------|-------------------|-------------------|
| E001 | 扩展初始化失败 / Extension initialization failed | 重新安装扩展 / Reinstall the extension |
| E002 | API 连接超时 / API connection timeout | 检查网络连接 / Check network connection |
| E003 | 音频格式不支持 / Unsupported audio format | 使用支持的格式 / Use a supported format |
| E004 | 翻译服务不可用 / Translation service unavailable | 稍后重试 / Try again later |
| E005 | 存储空间不足 / Insufficient storage space | 清理浏览器缓存 / Clear browser cache |

---

## 常见问题 / FAQ

**Q: 支持哪些音频格式？** / **Q: What audio formats are supported?**

A: 目前支持 MP3、WAV、FLAC、AAC、OGG 等主流音频格式。/ A: Currently supports mainstream audio formats such as MP3, WAV, FLAC, AAC, OGG, etc.

**Q: 翻译功能需要联网吗？** / **Q: Does the translation function require an internet connection?**

A: 是的，翻译功能需要连接到云端翻译服务。/ A: Yes, the translation function needs to connect to cloud translation services.

**Q: 可以批量处理多个文件吗？** / **Q: Can multiple files be processed in batches?**

A: 是的，扩展支持批量处理功能，可以同时处理多个音频文件。/ A: Yes, the extension supports batch processing and can handle multiple audio files simultaneously.

**Q: 如何提高转换速度？** / **Q: How to improve conversion speed?**

A: 可以尝试降低转换质量设置，或者确保系统资源充足。/ A: You can try lowering the conversion quality settings or ensure sufficient system resources.

---

## 更新日志 / Changelog

### v1.0.0 / v1.0.0

- 初始版本发布 / Initial release
- 基本音频转换功能 / Basic audio conversion functionality
- 翻译功能集成 / Translation function integration
- 字幕生成功能 / Subtitle generation functionality

### v1.1.0 / v1.1.0

- 新增批量处理功能 / Added batch processing functionality
- 优化转换速度 / Optimized conversion speed
- 修复已知问题 / Fixed known issues

### v1.2.0 / v1.2.0

- 新增更多音频格式支持 / Added support for more audio formats
- 改进用户界面 / Improved user interface
- 增强错误处理机制 / Enhanced error handling mechanism

---

## 技术支持 / Technical Support

如果您遇到任何问题或需要技术支持，请通过以下方式联系我们：

If you encounter any problems or need technical support, please contact us through:

- GitHub Issues: [提交问题 / Submit Issues](https://github.com/dyyz1993/chrome-audio-transform-extension/issues)
- Email: [your-email@example.com]

---

## 许可证 / License

本项目采用 MIT 许可证。/ This project is licensed under the MIT License.

---

*最后更新 / Last Updated: 2025-12-01*