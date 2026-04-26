# AIGC 风险检测 MVP

一个基于 Vue 3 的 MVP：支持粘贴文本或上传 DOCX 文档，返回 AIGC 风险率、风险等级、证据片段与人工复核建议。

## 本地运行

```bash
npm install
npm run dev
```

访问 Vite 输出的本地地址，默认前端会代理 `/api` 到 `http://localhost:8787`。

## 首版说明

- 当前后端使用 Mock 检测算法，不需要 API Key。
- 支持 `.docx` 解析；旧版 `.doc` 首版会提示另存为 DOCX。
- 不保存原文，不做历史记录。
- 检测结果只代表风险可能性，不能作为学术处分、法律判断或招聘筛选的唯一依据。
