# AIGC 风险检测 MVP

一个基于 Vue 3 的 MVP：支持粘贴文本或上传 DOCX 文档，返回 AIGC 风险率、风险等级、证据片段与人工复核建议。

## 本地运行

```bash
npm install
npm run dev
```

访问 Vite 输出的本地地址，默认前端会代理 `/api` 到 `http://localhost:8787`。

## DeepSeek API 配置

当前项目支持「有 Key 走 DeepSeek，无 Key 自动走 Mock」。

1. 复制 `.env.example` 为 `.env`
2. 在 `.env` 中填写：

```bash
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

不要把 `.env` 提交到 Git。

## 首版说明

- 没配置 `DEEPSEEK_API_KEY` 时，后端使用 Mock 检测算法。
- 支持 `.docx` 解析；旧版 `.doc` 首版会提示另存为 DOCX。
- 不保存原文，不做历史记录。
- 检测结果只代表风险可能性，不能作为学术处分、法律判断或招聘筛选的唯一依据。
