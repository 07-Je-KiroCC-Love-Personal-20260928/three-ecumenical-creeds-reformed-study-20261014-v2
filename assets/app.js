/* 三大普世信经 · 交互脚本 v2 */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement, body = document.body;
  var mqMobile = window.matchMedia("(max-width:1024px)");

  /* ---------- 1. 经文渲染 ---------- */
  function secColor(n) {
    if (n <= 2) return "var(--gold)";
    if (n <= 4) return "var(--father)";
    if (n <= 20) return "var(--orange)";
    if (n <= 24) return "var(--pink)";
    if (n <= 28) return "var(--blue)";
    if (n <= 37) return "var(--son)";
    if (n <= 43) return "var(--spirit)";
    return "var(--purple)";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var byN = {};
  (window.ATH || []).forEach(function (v) { byN[v.n] = v; });

  /* 使徒 / 尼西亚 解析卡片 */
  function tagHtml(o) {
    return (o.b || []).map(function (t) { return '<span class="tag bible">📖 ' + esc(t) + "</span>"; }).join("") +
      (o.q || []).map(function (t) { return '<span class="tag conf">🛡️ ' + esc(t) + "</span>"; }).join("") +
      (o.h || []).map(function (t) { return '<span class="tag her">🚫 ' + esc(t) + "</span>"; }).join("");
  }
  function renderArts(id, list) {
    var box = document.getElementById(id); if (!box) return;
    box.innerHTML = (list || []).map(function (o) {
      return '<article class="art" style="--c:' + o.c + '"><span class="no">' + o.n + "</span>" + (o.hard ? '<span class="badge-hard">难点</span>' : "") +
        '<div class="ttl">' + esc(o.t) + '</div><div class="core">💡 ' + esc(o.k) + '</div><div class="tags">' + tagHtml(o) + "</div></article>";
    }).join("");
  }
  renderArts("aposArts", window.APOS_NOTES);
  renderArts("nicArts", window.NIC_NOTES);

  /* ---------- 背诵版 ---------- */
  var PC = { f: "var(--father)", s: "var(--son)", h: "var(--spirit)", c: "var(--purple)" };
  function athPart(n) { return n <= 2 ? "c" : n <= 28 ? "f" : n <= 37 ? "s" : n <= 43 ? "h" : "c"; }
  function hintOf(t) {
    return t.split(/([，；。、：])/).map(function (seg) {
      if (/^[，；。、：]$/.test(seg) || !seg) return seg;
      return seg.charAt(0) + seg.slice(1).replace(/[^\s]/g, "＿");
    }).join("");
  }
  function lineHtml(k, t, p) {
    return '<div class="rl" style="--c:' + PC[p] + '" data-say="' + esc(t) + '"><span class="k">' + k + '</span><span class="t">' + esc(t) + '</span><span class="h">' + esc(hintOf(t)) + "</span></div>";
  }
  function renderRecite() {
    var a = $("#rc-apos"), n = $("#rc-nic"), q = $("#rc-ath");
    if (a) a.innerHTML = (window.APOS_LINES || []).map(function (l) { return lineHtml(l.a, l.t, l.p); }).join("");
    if (n) n.innerHTML = (window.NIC_LINES || []).map(function (l, i, arr) {
      var gap = i > 0 && arr[i - 1].p !== l.p ? '<div class="rgap"></div>' : "";
      return gap + lineHtml(l.a, l.t, l.p);
    }).join("");
    if (q) {
      var breaks = { 3: 1, 29: 1, 38: 1, 44: 1 }, html = "";
      (window.ATH || []).forEach(function (v) { if (breaks[v.n]) html += '<div class="rgap"></div>'; html += lineHtml(v.n, v.zh, athPart(v.n)); });
      q.innerHTML = html;
    }
    var lg = '<div class="legend-p"><span><i style="--c:var(--father)"></i>父 / 三一</span><span><i style="--c:var(--son)"></i>子</span><span><i style="--c:var(--spirit)"></i>圣灵 / 工作</span><span><i style="--c:var(--purple)"></i>教会与盼望 / 门槛与封印</span></div>';
    $$(".rpanel .paper").forEach(function (p) { p.insertAdjacentHTML("beforeend", lg); });
  }
  renderRecite();
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
  document.addEventListener("click", function (e) {
    var l = e.target.closest && e.target.closest(".rl");
    if (l && curMode !== "full") l.classList.toggle("show");
  });
  setMode("full");
  /* 朗读 */
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
  /* 打印 */
  var printBtn = $('#rmodes button[data-act="print"]');
  if (printBtn) printBtn.addEventListener("click", function () {
    var prevMode = curMode; setMode("full"); body.classList.add("print-recite");
    setTimeout(function () { window.print(); body.classList.remove("print-recite"); setMode(prevMode); }, 50);
  });
  $$(".verses[data-range]").forEach(function (box) {
    var r = box.getAttribute("data-range").split("-").map(Number);
    var html = "";
    for (var n = r[0]; n <= r[1]; n++) {
      var v = byN[n]; if (!v) continue;
      var tags = (v.b || []).map(function (t) { return '<span class="tag bible">📖 ' + esc(t) + "</span>"; }).join("") +
        (v.c || []).map(function (t) { return '<span class="tag conf">🛡️ ' + esc(t) + "</span>"; }).join("") +
        (v.h || []).map(function (t) { return '<span class="tag her">🚫 ' + esc(t) + "</span>"; }).join("");
      html += '<article class="verse" id="v' + n + '" style="--c:' + secColor(n) + '">' +
        '<span class="no">' + n + "</span>" + (v.hard ? '<span class="badge-hard">难点</span>' : "") +
        '<div class="verse-zh">' + esc(v.zh) + "</div>" +
        '<div class="verse-la" lang="la">' + esc(v.la) + "</div>" +
        '<div class="verse-note">💡 ' + esc(v.note) + "</div>" +
        '<div class="verse-tags">' + tags + "</div></article>";
    }
    box.innerHTML = html;
  });

  /* 结构条 */
  var sbar = $("#sbar");
  if (sbar) {
    for (var i = 1; i <= 44; i++) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = i; b.style.setProperty("--c", secColor(i));
      b.title = "第" + i + "条：" + (byN[i] ? byN[i].zh : "");
      b.setAttribute("aria-label", "跳到第" + i + "条");
      b.addEventListener("click", (function (n) {
        return function () {
          var el = document.getElementById("v" + n); if (!el) return;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1800);
        };
      })(i));
      sbar.appendChild(b);
    }
  }

  /* ---------- 2. 目录 ---------- */
  var toc = $("#toc");
  var heads = $$("main h2[id], main h3[id]");
  heads.forEach(function (h) {
    var li = document.createElement("li");
    li.className = h.tagName === "H2" ? "lvl2" : "lvl3";
    var a = document.createElement("a");
    a.href = "#" + h.id;
    var ico = h.querySelector(".ico");
    var txt = h.textContent.replace(ico ? ico.textContent : "", "").trim();
    a.innerHTML = "<span>" + (ico ? ico.textContent : "•") + "</span><span>" + esc(txt) + "</span>";
    a.addEventListener("click", function () { if (mqMobile.matches) setToc(false); });
    li.appendChild(a); toc.appendChild(li);
  });
  var links = $$("#toc a");
  var tocBtn = $("#tocBtn");
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
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mqMobile.matches) setToc(false); });
  mqMobile.addEventListener && mqMobile.addEventListener("change", function () { body.classList.remove("toc-open"); body.classList.remove("toc-hidden"); });

  $("#tocSearch").addEventListener("input", function () {
    var q = this.value.trim().toLowerCase();
    links.forEach(function (a) { a.parentNode.classList.toggle("hidden", q && a.textContent.toLowerCase().indexOf(q) < 0); });
  });

  /* 当前章节高亮 */
  var current = null;
  var hio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var id = en.target.id;
        if (current === id) return; current = id;
        links.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + id;
          a.classList.toggle("active", on);
          if (on && !mqMobile.matches) {
            var sb = $("#sidebar"), top = a.offsetTop - sb.clientHeight / 2;
            sb.scrollTo({ top: top, behavior: "smooth" });
          }
        });
      }
    });
  }, { rootMargin: "-70px 0px -70% 0px" });
  heads.forEach(function (h) { hio.observe(h); });

  /* ---------- 3. 进度条 / 回到顶部 ---------- */
  var prog = $("#progress"), fab = $("#toTop"), ticking = false;
  function onScroll() {
    var h = root.scrollHeight - root.clientHeight;
    prog.style.width = (h > 0 ? (root.scrollTop / h) * 100 : 0) + "%";
    fab.classList.toggle("show", root.scrollTop > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  fab.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 4. 显隐动画 + 计数 ---------- */
  var rio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
  }, { threshold: 0.04 });
  $$(".reveal").forEach(function (el) { rio.observe(el); });
  $$("[data-count]").forEach(function (el) {
    var to = +el.getAttribute("data-count"), t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });

  /* ---------- 5. 拉丁文开关 ---------- */
  $("#latinBtn").addEventListener("click", function () {
    body.classList.toggle("hide-latin");
    this.setAttribute("aria-pressed", String(!body.classList.contains("hide-latin")));
  });

  /* ---------- 6. 时间线筛选 ---------- */
  $$("#eraFilter button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var era = btn.getAttribute("data-era");
      $$("#eraFilter button").forEach(function (b) { b.classList.toggle("on", b === btn); });
      $$("#timelineList .tl").forEach(function (t) { t.classList.toggle("dim", era !== "all" && t.getAttribute("data-era").split(" ").indexOf(era) < 0); });
    });
  });

  /* ---------- 7. 地图 ---------- */
  var map = null, tiles = null, layers = {};
  var tileUrl = function () { return root.getAttribute("data-theme") === "light" ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"; };
  var colors = { apos: "#34d399", nic: "#f6b73c", ath: "#22d3b6", ref: "#5aa9ff" };
  function initMap() {
    if (!window.L || !$("#map")) { var m = $("#map"); if (m) m.innerHTML = '<p style="padding:20px">地图组件加载失败，请检查网络后刷新。</p>'; return; }
    map = L.map("map", { scrollWheelZoom: false, worldCopyJump: true }).setView([42, 14], 4);
    tiles = L.tileLayer(tileUrl(), { maxZoom: 12, subdomains: "abcd", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
    Object.keys(colors).forEach(function (k) { layers[k] = L.layerGroup().addTo(map); });
    var bounds = [];
    (window.PLACES || []).forEach(function (p) {
      bounds.push(p.p);
      L.circleMarker(p.p, { radius: 9, color: "#fff", weight: 1.5, fillColor: colors[p.k], fillOpacity: .95 })
        .bindPopup("<b>" + esc(p.n) + "</b><br>" + esc(p.d))
        .bindTooltip(esc(p.n.replace(/（.*?）/g, "")), { direction: "top", offset: [0, -6] })
        .addTo(layers[p.k]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24] });
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
    $$("#mapCtrl button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-layer"), on = !btn.classList.contains("on");
        btn.classList.toggle("on", on);
        if (on) layers[k].addTo(map); else map.removeLayer(layers[k]);
      });
    });
    window.addEventListener("resize", function () { map.invalidateSize(); });
  }
  if ("IntersectionObserver" in window && $("#map")) {
    var mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { mio.disconnect(); initMap(); } }, { rootMargin: "400px" });
    mio.observe($("#map"));
  }

  /* ---------- 8. 闪卡 ---------- */
  var cards = $("#cards");
  (window.CARDS || []).forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "flip"; b.style.setProperty("--c", c.c);
    b.setAttribute("aria-label", "闪卡：" + c.q + "（点击翻面）");
    b.innerHTML = '<div class="in"><div class="fa"><span class="e">' + c.e + '</span><span class="q">' + esc(c.q) + '</span><span class="hint">点击翻面 ↻</span></div><div class="fb"><div>' + c.a + "</div></div></div>";
    b.addEventListener("click", function () { b.classList.toggle("on"); });
    cards.appendChild(b);
  });

  /* ---------- 9. 自测 ---------- */
  var quiz = $("#quiz"), score = 0, done = 0, total = (window.QUIZ || []).length;
  function renderQuiz() {
    quiz.innerHTML = ""; score = 0; done = 0; updScore();
    (window.QUIZ || []).forEach(function (q, qi) {
      var box = document.createElement("div"); box.className = "qbox";
      box.innerHTML = '<div class="qq">' + (qi + 1) + ". " + esc(q.q) + '</div><div class="opts"></div><div class="qexp">📌 ' + esc(q.x) + "</div>";
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
  function updScore() {
    var s = $("#score"); if (!s) return;
    s.textContent = "得分 " + score + " / " + total + (done === total && total ? (score === total ? " 🏆 满分！" : score >= total * .75 ? " 👍 很好" : " 💪 再来一次") : "");
  }
  if (quiz) { renderQuiz(); $("#quizReset").addEventListener("click", renderQuiz); }

  /* ---------- 10. Mermaid ---------- */
  var mBlocks = $$(".mermaid");
  mBlocks.forEach(function (el) { el.setAttribute("data-src", el.innerHTML); });
  function mermaidCfg() {
    var light = root.getAttribute("data-theme") === "light";
    return {
      startOnLoad: false, securityLevel: "strict", theme: light ? "default" : "dark",
      fontFamily: getComputedStyle(body).fontFamily,
      flowchart: { htmlLabels: true, curve: "basis", useMaxWidth: true, padding: 12 },
      mindmap: { useMaxWidth: true, padding: 14 },
      themeVariables: light ? { fontSize: "15px", lineColor: "#56608a" } : { fontSize: "15px", lineColor: "#a6afcc", background: "transparent", mainBkg: "#1b2350", primaryColor: "#2a3470", primaryTextColor: "#e9edf9", edgeLabelBackground: "#1b2350" }
    };
  }
  function renderMermaid() {
    var mm = window.__mermaid; if (!mm) return;
    mBlocks.forEach(function (el) { el.removeAttribute("data-processed"); el.innerHTML = el.getAttribute("data-src"); });
    mm.initialize(mermaidCfg());
    mm.run({ nodes: mBlocks }).catch(function (err) { console.error("mermaid", err); });
  }
  if (window.__mermaid) renderMermaid(); else window.addEventListener("mermaid-ready", renderMermaid);

  /* ---------- 11. 主题 ---------- */
  $("#themeBtn").addEventListener("click", function () {
    var t = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("ac-theme", t); } catch (e) {}
    $('meta[name="theme-color"]').setAttribute("content", t === "light" ? "#eef2fb" : "#070b1a");
    if (tiles) tiles.setUrl(tileUrl());
    renderMermaid();
  });

  /* ---------- 12. 自检（?check=1）：检测横向溢出 ---------- */
  if (/[?&]check=1/.test(location.search)) {
    if (!map) { try { mio && mio.disconnect(); } catch (e) {} initMap(); }
    setTimeout(function () {
      $$(".reveal").forEach(function (el) { el.classList.add("in"); });
      var vw = root.clientWidth, bad = [];
      $$("main *").forEach(function (el) {
        var r = el.getBoundingClientRect(); if (!r.width) return;
        var p = el.parentElement, scrollable = false;
        while (p && p !== body) { var ox = getComputedStyle(p).overflowX; if (ox === "auto" || ox === "scroll" || ox === "hidden") { scrollable = true; break; } p = p.parentElement; }
        if (!scrollable && (r.right > vw + 1 || r.left < -1)) bad.push(el.tagName + "." + (el.className && el.className.baseVal === undefined ? el.className : "") + "#" + el.id + " R=" + Math.round(r.right));
      });
      var svgs = $$(".mermaid svg").length;
      var ov = [];
      $$(".grid,.arts,.verses,.trio,.cards,.timeline,.opts,.stats,.chips,.meta").forEach(function (g) {
        var kids = Array.prototype.slice.call(g.children).filter(function (k) { return k.offsetParent !== null; });
        for (var i = 0; i < kids.length; i++) for (var j = i + 1; j < kids.length; j++) {
          var a = kids[i].getBoundingClientRect(), b2 = kids[j].getBoundingClientRect();
          if (a.left < b2.right - 1 && b2.left < a.right - 1 && a.top < b2.bottom - 1 && b2.top < a.bottom - 1) ov.push((g.id || g.className) + "[" + i + "x" + j + "]");
        }
      });
      $$(".flip .fb,.flip .fa").forEach(function (f, i) { if (f.scrollHeight > f.clientHeight + 2) ov.push("flipClip" + i); });
      bad = bad.concat(ov.map(function (x) { return "OVERLAP " + x; }));
      var out = document.createElement("pre"); out.id = "__check";
      out.textContent = "CHECK vw=" + vw + " docScrollW=" + root.scrollWidth + " mermaidSVG=" + svgs + "/" + mBlocks.length + " verses=" + $$(".verse").length + " arts=" + $$(".art").length + " recite=" + $$(".rl").length + " cards=" + $$(".flip").length + " quiz=" + $$(".qbox").length + " map=" + (!!document.querySelector(".leaflet-container")) + " markers=" + $$(".leaflet-interactive").length + " mermaidErr=" + (document.body.innerHTML.indexOf("Syntax error in text") >= 0) + " overflow=" + bad.length + "\n" + bad.slice(0, 30).join("\n");
      body.insertBefore(out, body.firstChild);
    }, 9000);
  }
})();
