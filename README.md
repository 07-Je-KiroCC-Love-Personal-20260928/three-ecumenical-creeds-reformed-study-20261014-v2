# 三大普世信经 · 欧陆改革宗深度解读（v2 · 2026-10-14）

《使徒信经》《尼西亚信经》《亚他那修信经》学习页面。**所有信经原文、三项联合信条原文及其引用，均逐字取自 [ccifellowship.org《敬拜手册》](https://ccifellowship.org/books/book-of-praise)**（基督教华人网络团契），保留其用字（“神”“亚流”“藉着”等）、标点与经文注脚。

内容：三信经干净背诵版（全文 / 首字提示 / 遮盖自测 / 朗读 / 打印）、圣经神学与圣约神学、统一时间线（可播放）、历史地图（可飞行浏览）、文化区域、使徒信经十二条（CCI 释义 + 海德堡问答原文）、尼西亚信经关键短语、亚他那修信经 42 点、异端地图、三项联合信条对照与难点辨析、**信条原文阅读器**（海德堡 129 问 · 比利时信条 37 条 · 多特信经全部条文，可全文搜索）、思维导图、闪卡与自测。

## 🌐 在线访问

| 平台 | 链接 |
| --- | --- |
| GitHub Pages | https://07-je-kirocc-love-personal-20260928.github.io/three-ecumenical-creeds-reformed-study-20261014-v2/ |
| Surge | https://three-ecumenical-creeds-reformed-study-20261014-v2.surge.sh/ |
| Netlify | https://three-ecumenical-creeds-reformed-study-20261014-v2.netlify.app/ |

源码仓库：https://github.com/07-Je-KiroCC-Love-Personal-20260928/three-ecumenical-creeds-reformed-study-20261014-v2

## 文件
- `index.html` 页面结构与正文（页内 `<q>` 引文须逐字出自 CCI）
- `assets/cci.js` CCI 原文数据（由 `tools/cci/build_cci.py` 生成，勿手改）
- `assets/data.js` 注释、分行、地图、闪卡、自测数据
- `assets/app.js` 交互；`assets/style.css` 样式
- `tools/cci/` 抓取、整理、生成与校验脚本；`cci.json` 为整理后的原文

## 更新原文与校验
```bash
cd tools/cci
python crawl.py /books/book-of-praise/confessions/heidelberg-catechism /books/book-of-praise/confessions/canons-of-dort
python fetch.py /home /books/book-of-praise/creeds /books/book-of-praise/creeds/apostles-creed /books/book-of-praise/creeds/nicene-creed /books/book-of-praise/creeds/athanasian-creed
python compile.py && python build_cci.py && python verify.py   # verify：所有 <q> 引文必须 0 mismatch
```
（比利时信条 1–37 条与三项联合信条简介页同样用 `fetch.py` 抓取。）

## 本地预览
```bash
python -m http.server 8766
```
访问 `http://127.0.0.1:8766/`；加 `?check=1` 显示溢出/重叠自检结果。

## 更新后重新发布
- GitHub Pages：推送到 `main` 分支即自动发布
- Surge：`npx surge . three-ecumenical-creeds-reformed-study-20261014-v2.surge.sh`
- Netlify：`netlify deploy --prod --no-build --dir . --site three-ecumenical-creeds-reformed-study-20261014-v2`
