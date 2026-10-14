/* 三大普世信经 · 交互脚本 v2.1（原文数据见 cci.js，逐字取自 ccifellowship.org） */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement, body = document.body;
  var mqMobile = window.matchMedia("(max-width:1024px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CCI = window.CCI || { hc: {}, bc: {}, cd: {}, creeds: {}, home: { arts: [] }, intros: {} };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* CCI 原文只含 <sup> 标记：先整体转义，再还原 sup */
  function rich(s) { return esc(s).replace(/&lt;sup&gt;/g, "<sup>").replace(/&lt;\/sup&gt;/g, "</sup>"); }
  function plain(s) { return String(s).replace(/<sup>.*?<\/sup>/g, ""); }
  function link(u) { return CCI.base + u; }
  var CN = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  /* ---------- 1. CCI 引文卡片 ---------- */
  var CD_NAME = { "section1": "第一项教义", "section2": "第二项教义", "section3-4": "第三、四项教义", "section5": "第五项教义" };
  function refsHtml(refs) {
    if (!refs || !refs.length) return "";
    return '<details class="cq-refs"><summary>📖 经文出处（' + refs.length + '）</summary><ol>' + refs.map(function (r) { return "<li>" + rich(r) + "</li>"; }).join("") + "</ol></details>";
  }
  function getItem(key) {
    var k = key.split(":"), o;
    if (k[0] === "hc" && (o = CCI.hc[k[1]])) return { icon: "📗", head: "海德堡要理问答 · 第" + o.n + "问", tag: "主日" + o.ld, q: "问：" + o.q, paras: o.a, refs: o.refs, url: o.url, c: "var(--green)" };
    if (k[0] === "bc" && (o = CCI.bc[k[1]])) return { icon: "📘", head: "比利时信条 · " + o.title, paras: o.paras, refs: o.refs, url: o.url, c: "var(--blue)" };
    if (k[0] === "cd" && CCI.cd[k[1]] && (o = CCI.cd[k[1]].arts[k[2]])) return { icon: "📕", head: "多特信经 · " + CD_NAME[k[1]] + " · " + o.title, tag: CCI.cd[k[1]].title.replace(/^第.+?项教义\s*/, ""), paras: o.paras, refs: o.refs, url: o.url, c: "var(--son)" };
    if (k[0] === "intro") {
      var cr = CCI.creeds[k[1]];
      if (cr) return { icon: "📜", head: "CCI《敬拜手册》· " + { apos: "使徒信经", nic: "尼西亚信经", ath: "亚他那修信经" }[k[1]] + " 简介", paras: [cr.intro], url: cr.url, c: "var(--gold)" };
      var it = CCI.intros[k[1]];
      if (it) return { icon: "📜", head: "CCI《敬拜手册》· " + { bc: "比利时信条", hc: "海德堡要理问答", cd: "多特信经" }[k[1]] + " 简介", paras: it, url: { bc: "/books/book-of-praise/confessions/the-belgic-confession", hc: "/books/book-of-praise/confessions/heidelberg-catechism", cd: "/books/book-of-praise/confessions/canons-of-dort" }[k[1]], c: "var(--gold)" };
    }
    if (k[0] === "index") return { icon: "📜", head: "CCI《敬拜手册》· 普世信经", paras: CCI.creeds.index, url: "/books/book-of-praise/creeds", c: "var(--gold)" };
    return null;
  }
  function cardHtml(key, opt) {
    opt = opt || {};
    var it = getItem(key); if (!it) return '<p class="muted">（未找到原文：' + esc(key) + "）</p>";
    var paras = it.paras || [];
    if (opt.p) paras = [paras[opt.p - 1]];
    var len = paras.join("").length;
    var collapse = !opt.expand && (paras.length > 2 || len > 320);
    return '<div class="cq-h"><span>' + it.icon + " " + esc(it.head) + "</span>" + (it.tag ? '<span class="tag conf">' + esc(it.tag) + "</span>" : "") + (opt.p ? '<span class="tag">节选第' + opt.p + "段</span>" : "") +
      '<a href="' + link(it.url) + '" target="_blank" rel="noopener">CCI 原文 ↗</a></div>' +
      (it.q ? '<div class="cq-q">' + rich(it.q) + "</div>" : "") +
      '<div class="cq-t">' + paras.map(function (p) { return "<p>" + rich(p) + "</p>"; }).join("") + "</div>" +
      (collapse ? '<button type="button" class="more-btn">展开全文 ▾</button>' : "") +
      (opt.p ? "" : refsHtml(it.refs)) + "|" + (collapse ? "1" : "");
  }
  function fillCard(el) {
    var key = el.getAttribute("data-src");
    var out = cardHtml(key, { p: +el.getAttribute("data-p") || 0, expand: el.hasAttribute("data-expand") });
    var i = out.lastIndexOf("|"), collapse = out.slice(i + 1) === "1";
    el.innerHTML = out.slice(0, i);
    var it = getItem(key); if (it) el.style.borderLeftColor = it.c;
    if (collapse) {
      el.classList.add("collapsed");
      $(".more-btn", el).addEventListener("click", function () { var c = el.classList.toggle("collapsed"); this.textContent = c ? "展开全文 ▾" : "收起 ▴"; });
    }
  }
  $$(".cq[data-src]").forEach(fillCard);
  $$(".src-line[data-link]").forEach(function (el) { var u = el.getAttribute("data-link"); el.innerHTML = '✅ 原文逐字出自 <a href="' + link(u) + '" target="_blank" rel="noopener">ccifellowship.org' + esc(u) + "</a>"; });

  /* ---------- 2. 亚他那修信经 42 点 ---------- */
  function athColor(n) { return n <= 2 ? "var(--gold)" : n <= 4 ? "var(--father)" : n <= 20 ? "var(--orange)" : n <= 24 ? "var(--pink)" : n <= 28 ? "var(--blue)" : n <= 37 ? "var(--son)" : n <= 41 ? "var(--spirit)" : "var(--purple)"; }
  function athPart(n) { return n <= 2 ? "c" : n <= 28 ? "f" : n <= 37 ? "s" : n <= 41 ? "h" : "c"; }
  function tags(o) {
    return (o.b || []).map(function (t) { return '<span class="tag bible">📖 ' + esc(t) + "</span>"; }).join("") +
      (Array.isArray(o.c) ? o.c : (o.q || [])).map(function (t) { return '<span class="tag conf">🛡️ ' + esc(t) + "</span>"; }).join("") +
      (o.h || []).map(function (t) { return '<span class="tag her">🚫 ' + esc(t) + "</span>"; }).join("");
  }
  var ATH = (CCI.creeds.ath && CCI.creeds.ath.items) || [], athBy = {};
  ATH.forEach(function (v) { athBy[v.n] = v; });
  $$(".verses[data-range]").forEach(function (box) {
    var r = box.getAttribute("data-range").split("-").map(Number), html = "";
    for (var n = r[0]; n <= r[1]; n++) {
      var v = athBy[n], o = (window.ATH_NOTES || {})[n] || {}; if (!v) continue;
      html += '<article class="verse" id="v' + n + '" style="--c:' + athColor(n) + '"><span class="no">' + n + "</span>" + (o.hard ? '<span class="badge-hard">难点</span>' : "") +
        '<div class="verse-zh">' + esc(v.t) + "</div>" + (o.k ? '<div class="verse-note">💡 ' + o.k + "</div>" : "") + '<div class="verse-tags">' + tags(o) + "</div></article>";
    }
    box.innerHTML = html;
  });
  var sbar = $("#sbar");
  if (sbar) ATH.forEach(function (v) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = v.n; b.style.setProperty("--c", athColor(v.n)); b.title = "第" + v.n + "点：" + v.t; b.setAttribute("aria-label", "跳到第" + v.n + "点");
    b.addEventListener("click", function () { var el = document.getElementById("v" + v.n); if (!el) return; el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1800); });
    sbar.appendChild(b);
  });

  /* ---------- 3. 使徒信经 12 条 / 尼西亚短语 ---------- */
  var PC = { f: "var(--father)", s: "var(--son)", h: "var(--spirit)", c: "var(--purple)" };
  var aposBox = $("#aposArts");
  if (aposBox) aposBox.innerHTML = (window.APOS || []).map(function (a) {
    var home = CCI.home.arts[a.n - 1];
    var homeHtml = home ? '<details><summary>📗 CCI 首页释义：' + esc(home.h) + '</summary><div class="cq"><div class="cq-h"><span>📜 CCI 首页 · 使徒信经十二条</span><a href="' + link("/") + '" target="_blank" rel="noopener">CCI 原文 ↗</a></div><div class="cq-t">' + home.p.map(function (p) { return "<p>" + rich(p) + "</p>"; }).join("") + "</div></div></details>" : "";
    var hcHtml = '<details><summary>📘 海德堡要理问答 Q' + a.hc[0] + (a.hc.length > 1 ? "–" + a.hc[a.hc.length - 1] : "") + "（原文）</summary>" + a.hc.map(function (n) { return '<div class="cq" style="border-left-color:var(--green)">' + cardHtml("hc:" + n, { expand: true }).replace(/\|1?$/, "") + "</div>"; }).join("") + "</details>";
    return '<article class="art" style="--c:' + PC[a.p] + '"><span class="no">' + a.n + "</span>" + (a.hard ? '<span class="badge-hard">难点</span>' : "") +
      '<div class="ttl"><q>' + esc(a.t) + '</q></div><div class="core">💡 ' + a.k + '</div><div class="tags">' + tags(a) + "</div>" + homeHtml + hcHtml + "</article>";
  }).join("");
  var nicBox = $("#nicArts");
  if (nicBox) nicBox.innerHTML = (window.NIC_NOTES || []).map(function (o, i) {
    return '<article class="art" style="--c:' + o.c + '"><span class="no">' + (i + 1) + "</span>" + (o.hard ? '<span class="badge-hard">难点</span>' : "") +
      '<div class="ttl"><q>' + esc(o.t) + '</q></div><div class="core">💡 ' + o.k + '</div><div class="tags">' + tags(o) + "</div></article>";
  }).join("");

  /* ---------- 4. 背诵版 ---------- */
  function hintOf(t) {
    return t.trim().split(/([，；。、：！!·])/).map(function (seg) {
      if (!seg || /^[，；。、：！!·]$/.test(seg)) return seg;
      return seg.charAt(0) + seg.slice(1).replace(/\S/g, "＿");
    }).join("");
  }
  function lineHtml(k, t, p) {
    return '<div class="rl" style="--c:' + PC[p] + '" data-say="' + esc(t) + '"><span class="k">' + k + '</span><span class="t">' + esc(t) + '</span><span class="h">' + esc(hintOf(t)) + "</span></div>";
  }
  function gapIf(prev, cur) { return prev && prev !== cur ? '<div class="rgap"></div>' : ""; }
  var ra = $("#rc-apos"), rn = $("#rc-nic"), rq = $("#rc-ath");
  if (ra) ra.innerHTML = (window.APOS || []).map(function (l, i, arr) { return gapIf(i && arr[i - 1].p, l.p) + lineHtml(l.n, l.t, l.p); }).join("");
  if (rn) rn.innerHTML = (window.NIC_SPLIT || []).map(function (l, i, arr) { return gapIf(i && arr[i - 1].p, l.p) + lineHtml(i + 1, l.t, l.p); }).join("");
  if (rq) rq.innerHTML = ATH.map(function (v, i) { return ({ 3: 1, 29: 1, 38: 1, 42: 1 }[v.n] ? '<div class="rgap"></div>' : "") + lineHtml(v.n, v.t, athPart(v.n)); }).join("");
  var curPanel = "apos", curMode = "full";
  function showPanel(p) {
    curPanel = p; stopSpeak();
    $$("#rtabs button").forEach(function (b) { var on = b.getAttribute("data-p") === p; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); });
    $$(".rpanel").forEach(function (el) { el.hidden = el.getAttribute("data-p") !== p; });
  }
  function setMode(m) {
    curMode = m;
    $$("#rmodes button[data-m]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-m") === m); });
    $$(".rpanel .paper").forEach(function (p) { p.classList.remove("mode-full", "mode-hint", "mode-blur"); p.classList.add("mode-" + m); });
    $$(".rl.show").forEach(function (l) { l.classList.remove("show"); });
  }
  $$("#rtabs button").forEach(function (b) { b.addEventListener("click", function () { showPanel(b.getAttribute("data-p")); }); });
  $$("#rmodes button[data-m]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-m")); }); });
  document.addEventListener("click", function (e) { var l = e.target.closest && e.target.closest(".rl"); if (l && curMode !== "full") l.classList.toggle("show"); });
  setMode("full");
  var speakBtn = $('#rmodes button[data-act="speak"]'), speaking = false;
  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    speaking = false; if (speakBtn) speakBtn.textContent = "🔊 朗读";
    $$(".rl.speaking").forEach(function (l) { l.classList.remove("speaking"); });
  }
  if (speakBtn) {
    if (!("speechSynthesis" in window)) speakBtn.hidden = true;
    speakBtn.addEventListener("click", function () {
      if (speaking) { stopSpeak(); return; }
      var lines = $$('.rpanel[data-p="' + curPanel + '"] .rl'); if (!lines.length) return;
      speaking = true; speakBtn.textContent = "⏹ 停止";
      var voices = window.speechSynthesis.getVoices().filter(function (v) { return /zh/i.test(v.lang); });
      lines.forEach(function (l, i) {
        var u = new SpeechSynthesisUtterance(l.getAttribute("data-say"));
        u.lang = "zh-CN"; u.rate = 0.9; if (voices[0]) u.voice = voices[0];
        u.onstart = function () { $$(".rl.speaking").forEach(function (x) { x.classList.remove("speaking"); }); l.classList.add("speaking"); l.scrollIntoView({ behavior: "smooth", block: "center" }); };
        if (i === lines.length - 1) u.onend = stopSpeak;
        window.speechSynthesis.speak(u);
      });
    });
  }
  var printBtn = $('#rmodes button[data-act="print"]');
  if (printBtn) printBtn.addEventListener("click", function () {
    var prev = curMode; setMode("full"); body.classList.add("print-recite");
    setTimeout(function () { window.print(); body.classList.remove("print-recite"); setMode(prev); }, 50);
  });

  /* ---------- 5. 目录 ---------- */
  var toc = $("#toc"), heads = $$("main h2[id], main h3[id]");
  heads.forEach(function (h) {
    var li = document.createElement("li"); li.className = h.tagName === "H2" ? "lvl2" : "lvl3";
    var a = document.createElement("a"); a.href = "#" + h.id;
    var ico = h.querySelector(".ico"), txt = h.textContent.replace(ico ? ico.textContent : "", "").trim();
    a.innerHTML = "<span>" + (ico ? ico.textContent : "•") + "</span><span>" + esc(txt) + "</span>";
    a.addEventListener("click", function () { if (mqMobile.matches) setToc(false); });
    li.appendChild(a); toc.appendChild(li);
  });
  var links = $$("#toc a"), tocBtn = $("#tocBtn");
  function setToc(open) {
    if (mqMobile.matches) { body.classList.toggle("toc-open", open); body.classList.remove("toc-hidden"); }
    else { body.classList.toggle("toc-hidden", !open); body.classList.remove("toc-open"); try { localStorage.setItem("ac-toc", open ? "1" : "0"); } catch (e) {} }
    tocBtn.setAttribute("aria-expanded", String(open));
  }
  function tocIsOpen() { return mqMobile.matches ? body.classList.contains("toc-open") : !body.classList.contains("toc-hidden"); }
  try { if (!mqMobile.matches && localStorage.getItem("ac-toc") === "0") setToc(false); } catch (e) {}
  if (mqMobile.matches) tocBtn.setAttribute("aria-expanded", "false");
  tocBtn.addEventListener("click", function () { setToc(!tocIsOpen()); });
  $("#scrim").addEventListener("click", function () { setToc(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (mqMobile.matches) setToc(false); closeModal(); } });
  if (mqMobile.addEventListener) mqMobile.addEventListener("change", function () { body.classList.remove("toc-open", "toc-hidden"); });
  $("#tocSearch").addEventListener("input", function () {
    var q = this.value.trim().toLowerCase();
    links.forEach(function (a) { a.parentNode.classList.toggle("hidden", q && a.textContent.toLowerCase().indexOf(q) < 0); });
  });
  var current = null;
  var hio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting || current === en.target.id) return;
      current = en.target.id;
      links.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + current; a.classList.toggle("active", on);
        if (on && !mqMobile.matches) { var sb = $("#sidebar"); sb.scrollTo({ top: a.offsetTop - sb.clientHeight / 2, behavior: "smooth" }); }
      });
    });
  }, { rootMargin: "-70px 0px -70% 0px" });
  heads.forEach(function (h) { hio.observe(h); });

  /* ---------- 6. 进度 / 顶部 / 显隐 ---------- */
  var prog = $("#progress"), fab = $("#toTop"), ticking = false;
  function onScroll() { var h = root.scrollHeight - root.clientHeight; prog.style.width = (h > 0 ? root.scrollTop / h * 100 : 0) + "%"; fab.classList.toggle("show", root.scrollTop > 600); ticking = false; }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  fab.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  var rio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }); }, { threshold: 0.03 });
  $$(".reveal").forEach(function (el) { rio.observe(el); });

  /* ---------- 7. 时间线：筛选 + 播放 ---------- */
  var tlList = $("#timelineList"), playTimer = null;
  $$("#eraFilter button[data-era]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var era = btn.getAttribute("data-era");
      $$("#eraFilter button[data-era]").forEach(function (b) { b.classList.toggle("on", b === btn); });
      $$("#timelineList .tl").forEach(function (t) { t.classList.toggle("dim", era !== "all" && t.getAttribute("data-era").split(" ").indexOf(era) < 0); });
    });
  });
  var playBtn = $('#eraFilter button[data-act="play"]');
  if (playBtn) playBtn.addEventListener("click", function () {
    if (playTimer) { clearInterval(playTimer); playTimer = null; tlList.classList.remove("playing"); $$(".tl.lit").forEach(function (t) { t.classList.remove("lit"); }); playBtn.textContent = "▶ 播放"; return; }
    var items = $$("#timelineList .tl:not(.dim)"), i = 0;
    tlList.classList.add("playing"); playBtn.textContent = "⏹ 停止";
    tlList.scrollIntoView({ behavior: "smooth", block: "start" });
    playTimer = setInterval(function () {
      if (i >= items.length) { clearInterval(playTimer); playTimer = null; playBtn.textContent = "▶ 重播"; setTimeout(function () { tlList.classList.remove("playing"); $$(".tl.lit").forEach(function (t) { t.classList.remove("lit"); }); }, 1500); return; }
      items[i].classList.add("lit"); items[i].scrollIntoView({ behavior: "smooth", block: "center" }); i++;
    }, 1300);
  });

  /* ---------- 8. 地图 ---------- */
  var map = null, tiles = null, layers = {}, markers = [];
  var colors = { apos: "#34d399", nic: "#f6b73c", ath: "#22d3b6", ref: "#5aa9ff" };
  function tileUrl() { return root.getAttribute("data-theme") === "light" ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"; }
  function initMap() {
    var el = $("#map"); if (!el) return;
    if (!window.L) { el.innerHTML = '<p style="padding:20px">地图组件加载失败，请检查网络后刷新。</p>'; return; }
    map = L.map("map", { scrollWheelZoom: false, worldCopyJump: true }).setView([42, 14], 4);
    tiles = L.tileLayer(tileUrl(), { maxZoom: 12, subdomains: "abcd", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
    Object.keys(colors).forEach(function (k) { layers[k] = L.layerGroup().addTo(map); });
    var bounds = [];
    (window.PLACES || []).forEach(function (p) {
      bounds.push(p.p);
      var m = L.circleMarker(p.p, { radius: 9, color: "#fff", weight: 1.5, fillColor: colors[p.k], fillOpacity: .95 })
        .bindPopup("<b>" + esc(p.n) + "</b><br>" + esc(p.d)).bindTooltip(esc(p.n.replace(/（.*?）/g, "")), { direction: "top", offset: [0, -6] }).addTo(layers[p.k]);
      markers.push(m);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24] });
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
    $$("#mapCtrl button[data-layer]").forEach(function (btn) {
      btn.addEventListener("click", function () { var k = btn.getAttribute("data-layer"), on = !btn.classList.contains("on"); btn.classList.toggle("on", on); if (on) layers[k].addTo(map); else map.removeLayer(layers[k]); });
    });
    var tourBtn = $('#mapCtrl button[data-act="tour"]'), tourT = null;
    if (tourBtn) tourBtn.addEventListener("click", function () {
      if (tourT) { clearTimeout(tourT); tourT = null; tourBtn.textContent = "▶ 飞行浏览"; return; }
      var i = 0; tourBtn.textContent = "⏹ 停止";
      (function next() {
        if (i >= markers.length) { tourT = null; tourBtn.textContent = "▶ 飞行浏览"; map.fitBounds(bounds, { padding: [24, 24] }); return; }
        var m = markers[i++]; map.flyTo(m.getLatLng(), 6, { duration: reduce ? 0 : 1.2 }); setTimeout(function () { m.openPopup(); }, reduce ? 0 : 1250);
        tourT = setTimeout(next, 3200);
      })();
    });
    window.addEventListener("resize", function () { map.invalidateSize(); });
  }
  var mio = null;
  if ($("#map")) { mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { mio.disconnect(); initMap(); } }, { rootMargin: "400px" }); mio.observe($("#map")); }

  /* ---------- 9. 闪卡 / 自测 ---------- */
  var cards = $("#cards");
  (window.CARDS || []).forEach(function (c) {
    var b = document.createElement("button"); b.type = "button"; b.className = "flip"; b.style.setProperty("--c", c.c);
    b.setAttribute("aria-label", "闪卡：" + c.q + "（点击翻面）");
    b.innerHTML = '<div class="in"><div class="fa"><span class="e">' + c.e + '</span><span class="q">' + esc(c.q) + '</span><span class="hint">点击翻面 ↻</span></div><div class="fb"><div>' + c.a + "</div></div></div>";
    b.addEventListener("click", function () { b.classList.toggle("on"); });
    cards.appendChild(b);
  });
  var quiz = $("#quiz"), score = 0, done = 0, total = (window.QUIZ || []).length;
  function updScore() {
    var s = $("#score"); if (!s) return;
    s.textContent = "得分 " + score + " / " + total + (done === total && total ? (score === total ? " 🏆 满分！" : score >= total * .75 ? " 👍 很好" : " 💪 再来一次") : "");
    var r = $("#ringFg"); if (r) r.style.strokeDashoffset = String(113.1 * (1 - (total ? score / total : 0)));
  }
  function renderQuiz() {
    quiz.innerHTML = ""; score = 0; done = 0; updScore();
    (window.QUIZ || []).forEach(function (q, qi) {
      var box = document.createElement("div"); box.className = "qbox";
      box.innerHTML = '<div class="qq">' + (qi + 1) + ". " + esc(q.q) + '</div><div class="opts"></div><div class="qexp">📌 依据：' + esc(q.x) + "</div>";
      var opts = $(".opts", box);
      q.o.forEach(function (o, oi) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = String.fromCharCode(65 + oi) + ". " + o;
        b.addEventListener("click", function () {
          if (box.classList.contains("done")) return;
          box.classList.add("done"); done++;
          if (oi === q.a) { b.classList.add("ok"); score++; } else { b.classList.add("no"); opts.children[q.a].classList.add("ok"); }
          updScore();
        });
        opts.appendChild(b);
      });
      quiz.appendChild(box);
    });
  }
  if (quiz) { renderQuiz(); $("#quizReset").addEventListener("click", renderQuiz); }

  /* ---------- 10. 信条原文阅读器 ---------- */
  function keysOf(kind) {
    if (kind === "hc") return Object.keys(CCI.hc).map(Number).sort(function (a, b) { return a - b; }).map(function (n) { return "hc:" + n; });
    if (kind === "bc") return Object.keys(CCI.bc).map(Number).sort(function (a, b) { return a - b; }).map(function (n) { return "bc:" + n; });
    var out = [];
    ["section1", "section2", "section3-4", "section5"].forEach(function (s) {
      Object.keys(CCI.cd[s].arts).map(Number).sort(function (a, b) { return a - b; }).forEach(function (n) { out.push("cd:" + s + ":" + n); });
    });
    return out;
  }
  function labelOf(key) {
    var k = key.split(":");
    if (k[0] === "hc") { var q = CCI.hc[k[1]]; return "Q" + q.n + "（主日" + q.ld + "）" + plain(q.q).slice(0, 26); }
    if (k[0] === "bc") return CCI.bc[k[1]].title;
    return CD_NAME[k[1]] + " · " + CCI.cd[k[1]].arts[k[2]].title;
  }
  function textOf(key) { var it = getItem(key); return it ? plain((it.q || "") + " " + (it.paras || []).join(" ")) : ""; }
  var rdKind = "hc", rdKeys = [], rdSel = $("#rdSel"), rdView = $("#rdView"), rdTerm = "";
  function hl(html, term) {
    if (!term) return html;
    var re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "g");
    return html.replace(/>([^<]+)</g, function (m, t) { return ">" + t.replace(re, "<mark>$1</mark>") + "<"; });
  }
  function rdShow(key) {
    if (!rdView) return;
    rdSel.value = key;
    rdView.innerHTML = '<div class="cq">' + hl(cardHtml(key, { expand: true }).replace(/\|1?$/, ""), rdTerm) + "</div>";
    var it = getItem(key); if (it) $(".cq", rdView).style.borderLeftColor = it.c;
  }
  function rdTab(kind, key) {
    rdKind = kind; rdKeys = keysOf(kind);
    $$("#rdTabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-k") === kind); });
    rdSel.innerHTML = rdKeys.map(function (k) { return '<option value="' + k + '">' + esc(labelOf(k)) + "</option>"; }).join("");
    rdShow(key || rdKeys[0]);
  }
  if (rdSel) {
    $$("#rdTabs button").forEach(function (b) { b.addEventListener("click", function () { rdTab(b.getAttribute("data-k")); }); });
    rdSel.addEventListener("change", function () { rdShow(rdSel.value); });
    $("#rdPrev").addEventListener("click", function () { var i = rdKeys.indexOf(rdSel.value); if (i > 0) rdShow(rdKeys[i - 1]); });
    $("#rdNext").addEventListener("click", function () { var i = rdKeys.indexOf(rdSel.value); if (i < rdKeys.length - 1) rdShow(rdKeys[i + 1]); });
    var st = null;
    $("#rdSearch").addEventListener("input", function () {
      var q = this.value.trim(); clearTimeout(st);
      st = setTimeout(function () {
        rdTerm = q; var hits = $("#rdHits");
        if (!q) { hits.innerHTML = ""; rdShow(rdSel.value); return; }
        var all = keysOf("hc").concat(keysOf("bc"), keysOf("cd")).filter(function (k) { return textOf(k).indexOf(q) >= 0; });
        hits.innerHTML = '<span class="small muted">共 ' + all.length + " 处：</span>" + all.slice(0, 80).map(function (k) { return '<button type="button" data-k="' + k + '">' + esc(labelOf(k).slice(0, 18)) + "</button>"; }).join("");
        $$("button", hits).forEach(function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-k"); rdTab(k.split(":")[0], k); }); });
        rdShow(rdSel.value);
      }, 220);
    });
    rdTab("hc");
  }

  /* ---------- 11. 弹窗：data-open ---------- */
  var modal = $("#modal");
  function openModal(key) {
    $("#modalBody").innerHTML = '<div class="cq">' + cardHtml(key, { expand: true }).replace(/\|1?$/, "") + '</div><p class="small"><a href="#reader" id="toReader">📚 在阅读器中继续阅读 →</a></p>';
    modal.hidden = false; $("#modalX").focus();
    $("#toReader").addEventListener("click", function () { closeModal(); rdTab(key.split(":")[0], key); });
  }
  function closeModal() { if (modal && !modal.hidden) modal.hidden = true; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-open]");
    if (a) { e.preventDefault(); openModal(a.getAttribute("data-open")); }
  });
  $$("a[data-open]").forEach(function (a) { a.setAttribute("href", "#reader"); a.setAttribute("role", "button"); });
  if (modal) { $("#modalX").addEventListener("click", closeModal); modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); }); }

  /* ---------- 12. 出处列表 ---------- */
  var srcList = $("#srcList");
  if (srcList) srcList.innerHTML = [
    ["普世信经（总述）", "/books/book-of-praise/creeds"], ["使徒信经", "/books/book-of-praise/creeds/apostles-creed"], ["尼西亚信经", "/books/book-of-praise/creeds/nicene-creed"],
    ["亚他那修信经", "/books/book-of-praise/creeds/athanasian-creed"], ["比利时信条（37条）", "/books/book-of-praise/confessions/the-belgic-confession"],
    ["海德堡要理问答（52主日·129问）", "/books/book-of-praise/confessions/heidelberg-catechism"], ["多特信经（五项教义）", "/books/book-of-praise/confessions/canons-of-dort"], ["首页：使徒信经十二条释义", "/"]
  ].map(function (x) { return '<li><a href="' + link(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + "</a></li>"; }).join("");

  /* ---------- 13. Mermaid ---------- */
  var mBlocks = $$(".mermaid");
  mBlocks.forEach(function (el) { el.setAttribute("data-src", el.innerHTML); });
  function mermaidCfg() {
    var light = root.getAttribute("data-theme") === "light";
    return { startOnLoad: false, securityLevel: "strict", theme: light ? "default" : "dark", fontFamily: getComputedStyle(body).fontFamily,
      flowchart: { htmlLabels: true, curve: "basis", useMaxWidth: true, padding: 12 }, mindmap: { useMaxWidth: true, padding: 14 },
      themeVariables: light ? { fontSize: "15px", lineColor: "#56608a" } : { fontSize: "15px", lineColor: "#a6afcc", background: "transparent", mainBkg: "#1b2350", primaryColor: "#2a3470", primaryTextColor: "#e9edf9", edgeLabelBackground: "#1b2350" } };
  }
  function renderMermaid() {
    var mm = window.__mermaid; if (!mm) return;
    mBlocks.forEach(function (el) { el.removeAttribute("data-processed"); el.innerHTML = el.getAttribute("data-src"); });
    mm.initialize(mermaidCfg());
    mm.run({ nodes: mBlocks }).catch(function (err) { console.error("mermaid", err); });
  }
  if (window.__mermaid) renderMermaid(); else window.addEventListener("mermaid-ready", renderMermaid);

  /* ---------- 14. 主题 ---------- */
  $("#themeBtn").addEventListener("click", function () {
    var t = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("ac-theme", t); } catch (e) {}
    $('meta[name="theme-color"]').setAttribute("content", t === "light" ? "#eef2fb" : "#070b1a");
    if (tiles) tiles.setUrl(tileUrl());
    renderMermaid();
  });

  /* ---------- 15. 打字机 + 星光粒子 ---------- */
  var typer = $("#typer");
  if (typer && !reduce) {
    var phrases = ["父 —— 子 —— 圣灵", "其位格不紊，其本质不分", "受生却非被造，与父同质", "既是神又是人"], pi = 0, ci = phrases[0].length, del = true;
    setInterval(function () {
      var p = phrases[pi];
      if (del) { ci--; if (ci <= 0) { del = false; pi = (pi + 1) % phrases.length; } }
      else { ci++; if (ci >= phrases[pi].length + 14) { del = true; ci = phrases[pi].length; } }
      typer.textContent = phrases[pi].slice(0, Math.max(0, Math.min(ci, phrases[pi].length))) || "\u00a0";
    }, 110);
  }
  var cv = $("#stars");
  if (cv && cv.getContext && !reduce) {
    var ctx = cv.getContext("2d"), pts = [], running = true, W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    var pal = ["#ffd166", "#ff5c7a", "#22d3b6", "#a78bfa", "#5aa9ff"];
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { pts = []; var n = Math.round(Math.min(90, W * H / 9000)); for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, vx: (Math.random() - .5) * .25, vy: -Math.random() * .3 - .05, c: pal[i % pal.length], t: Math.random() * 6.28 }); }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.t += .03; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        ctx.globalAlpha = .35 + .35 * Math.sin(p.t); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    size(); seed(); frame();
    window.addEventListener("resize", function () { size(); seed(); });
    new IntersectionObserver(function (en) { var v = en[0].isIntersecting; if (v && !running) { running = true; frame(); } else if (!v) running = false; }).observe(cv);
  }

  /* ---------- 16. 自检（?check=1）：溢出与重叠 ---------- */
  if (/[?&]check=1/.test(location.search)) {
    if (!map) { try { mio && mio.disconnect(); } catch (e) {} initMap(); }
    setTimeout(function () {
      $$(".reveal").forEach(function (el) { el.classList.add("in"); });
      $$(".cq.collapsed .more-btn").forEach(function (b) { b.click(); });
      $$("details").forEach(function (d) { d.open = true; });
      setTimeout(function () {
        var vw = root.clientWidth, bad = [];
        $$("main *").forEach(function (el) {
          var r = el.getBoundingClientRect(); if (!r.width) return;
          var p = el.parentElement, sc = false;
          while (p && p !== body) { var ox = getComputedStyle(p).overflowX; if (ox === "auto" || ox === "scroll" || ox === "hidden") { sc = true; break; } p = p.parentElement; }
          if (!sc && (r.right > vw + 1 || r.left < -1)) bad.push("OVERFLOW " + el.tagName + "." + (typeof el.className === "string" ? el.className : "") + "#" + el.id + " R=" + Math.round(r.right));
        });
        $$(".grid,.arts,.verses,.trio,.cards,.timeline,.opts,.stats,.chips,.meta,.cq-grid").forEach(function (g) {
          var kids = Array.prototype.slice.call(g.children).filter(function (k) { return k.offsetParent !== null; });
          for (var i = 0; i < kids.length; i++) for (var j = i + 1; j < kids.length; j++) {
            var a = kids[i].getBoundingClientRect(), b2 = kids[j].getBoundingClientRect();
            if (a.left < b2.right - 1 && b2.left < a.right - 1 && a.top < b2.bottom - 1 && b2.top < a.bottom - 1) bad.push("OVERLAP " + (g.id || g.className) + "[" + i + "x" + j + "]");
          }
        });
        $$(".flip .fb,.flip .fa").forEach(function (f, i) { if (f.scrollHeight > f.clientHeight + 2) bad.push("FLIPCLIP " + i); });
        var out = document.createElement("pre"); out.id = "__check";
        out.textContent = "CHECK vw=" + vw + " docW=" + root.scrollWidth + " mermaid=" + $$(".mermaid svg").length + "/" + mBlocks.length + " cq=" + $$(".cq .cq-t").length + " missingCQ=" + $$(".cq").filter(function (c) { return /未找到原文/.test(c.textContent); }).length +
          " ath=" + $$(".verse").length + " arts=" + $$(".art").length + " recite=" + $$(".rl").length + " cards=" + $$(".flip").length + " quiz=" + $$(".qbox").length +
          " reader=" + (rdSel ? rdSel.options.length : 0) + " map=" + !!document.querySelector(".leaflet-container") + " markers=" + $$(".leaflet-interactive").length +
          " mermaidErr=" + (body.innerHTML.indexOf("Syntax error in text") >= 0) + " issues=" + bad.length + "\n" + bad.slice(0, 40).join("\n");
        body.insertBefore(out, body.firstChild);
      }, 1500);
    }, 9000);
  }
})();
