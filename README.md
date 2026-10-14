# 三大普世信经 · 欧陆改革宗深度解读（v2 · 2026-10-14）

《使徒信经》《尼西亚信经》《亚他那修信经》学习页面：三信经干净背诵版（全文 / 首字提示 / 遮盖自测 / 朗读 / 打印）、圣经神学与圣约神学、统一时间线、历史地图、文化区域、逐条解析、异端地图、三项联合信条对照、难点辨析、思维导图、闪卡与自测。

## 🌐 在线访问

| 平台 | 链接 |
| --- | --- |
| GitHub Pages | https://07-je-kirocc-love-personal-20260928.github.io/three-ecumenical-creeds-reformed-study-20261014-v2/ |
| Surge | https://three-ecumenical-creeds-reformed-study-20261014-v2.surge.sh/ |
| Netlify | https://three-ecumenical-creeds-reformed-study-20261014-v2.netlify.app/ |

源码仓库：https://github.com/07-Je-KiroCC-Love-Personal-20260928/three-ecumenical-creeds-reformed-study-20261014-v2

## 文件
- `index.html` 页面结构与正文
- `assets/style.css` 样式（毛玻璃、明暗主题、自适应、打印）
- `assets/data.js` 三信经文本、逐条解析、地图、闪卡、自测数据
- `assets/app.js` 交互（目录、背诵模式、朗读、地图、Mermaid、主题）

## 本地预览
```bash
python -m http.server 8766
```
访问 `http://127.0.0.1:8766/`；加 `?check=1` 显示溢出/重叠自检结果。

## 更新后重新发布
- GitHub Pages：推送到 `main` 分支即自动发布
- Surge：`npx surge . three-ecumenical-creeds-reformed-study-20261014-v2.surge.sh`
- Netlify：`netlify deploy --prod --no-build --dir . --site three-ecumenical-creeds-reformed-study-20261014-v2`
