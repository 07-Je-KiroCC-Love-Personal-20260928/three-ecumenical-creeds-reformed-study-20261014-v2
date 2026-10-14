# 将抓取的 CCI 页面 HTML 解析为结构化 JSON。
# 原则：文字一字不改；只保留 <sup> 脚注标记，其余标签去除。
import re, os, io, sys, json, glob, html as H
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
D = os.path.dirname(os.path.abspath(__file__))

def rd(name):
    return open(os.path.join(D, name), encoding="utf-8").read()

def page_title(h):
    m = re.search(r'<title>(.*?)</title>', h, re.S)
    return H.unescape(m.group(1)).replace(" | 基督教华人网络团契", "").strip()

def content(h):
    i = h.find('id="block-tulip-content"')
    j = h.find('<nav role="navigation"', i)
    return h[i:j if j > 0 else len(h)]

def clean(s):
    s = re.sub(r'<sup[^>]*>', '\x01', s); s = s.replace('</sup>', '\x02')
    s = re.sub(r'(?i)<br\s*/?>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = H.unescape(s).replace('\xa0', ' ').strip()
    return s.replace('\x01', '<sup>').replace('\x02', '</sup>')

def paras(c):
    return [clean(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', c, re.S) if clean(p)]

def refs(c):
    out = []
    for ol in re.findall(r'<ol class="reference-list">(.*?)</ol>', c, re.S):
        out += [clean(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', ol, re.S)]
    return out

out = {"source": "https://ccifellowship.org/books/book-of-praise", "creeds": {}, "hc": {}, "bc": {}, "cd": {}}

for key, slug in [("apos", "apostles-creed"), ("nic", "nicene-creed"), ("ath", "athanasian-creed")]:
    c = content(rd("books__book-of-praise__creeds__%s.html" % slug))
    ps = paras(c)
    out["creeds"][key] = {"intro": ps[0], "body": ps[1:], "url": "/books/book-of-praise/creeds/" + slug}
out["creeds"]["index"] = paras(content(rd("books__book-of-praise__creeds.html")))

for f in glob.glob(os.path.join(D, "*heidelberg-catechism*lord-day-*.html")):
    ld = int(re.search(r'lord-day-(\d+)', f).group(1))
    path = "/" + os.path.basename(f)[:-5].replace("__", "/")
    c = content(open(f, encoding="utf-8").read())
    chunks = re.split(r'<h4[^>]*>', c)[1:]
    for ch in chunks:
        qh, rest = ch.split('</h4>', 1)
        qt = clean(qh)
        m = re.match(r'^(\d+)\s*[．.]\s*问：(.*)$', qt, re.S)
        if not m:
            continue
        n = int(m.group(1))
        out["hc"][n] = {"n": n, "ld": ld, "q": m.group(2), "a": paras(rest), "refs": refs(rest), "url": path}

for n in range(1, 38):
    h = rd("books__book-of-praise__confessions__the-belgic-confession__%d.html" % n)
    c = content(h)
    out["bc"][n] = {"title": page_title(h), "paras": paras(c), "refs": refs(c), "url": "/books/book-of-praise/confessions/the-belgic-confession/%d" % n}

for sec in ["section1", "section2", "section3-4", "section5"]:
    h = rd("books__book-of-praise__confessions__canons-of-dort__%s.html" % sec)
    out["cd"][sec] = {"title": page_title(h), "arts": {}}
    for f in glob.glob(os.path.join(D, "books__book-of-praise__confessions__canons-of-dort__%s__*.html" % sec)):
        n = os.path.basename(f)[:-5].split("__")[-1]
        hh = open(f, encoding="utf-8").read(); c = content(hh)
        out["cd"][sec]["arts"][n] = {"title": page_title(hh), "paras": paras(c), "refs": refs(c), "url": "/books/book-of-praise/confessions/canons-of-dort/%s/%s" % (sec, n)}

# ---- 首页：使徒信经十二条释义 ----
hc_ = content(rd("home.html"))
blocks = re.findall(r'<(h2|p)[^>]*>(.*?)</\1>', hc_, re.S)
home = {"intro": "", "arts": [], "end": [], "url": "/"}
cur, mode = None, "intro"
for tag, inner in blocks:
    txt = clean(inner)
    if tag == "h2":
        if txt == "结语":
            mode = "end"
        else:
            mode = "art"; cur = {"h": txt, "p": []}; home["arts"].append(cur)
    elif mode == "intro":
        home["intro"] = txt
    elif mode == "end":
        home["end"].append(txt)
    else:
        cur["p"].append(txt)
out["home"] = home

# ---- 三项联合信条各自的简介页 ----
out["intros"] = {k: paras(content(rd(f))) for k, f in {
    "bc": "books__book-of-praise__confessions__the-belgic-confession.html",
    "hc": "books__book-of-praise__confessions__heidelberg-catechism.html",
    "cd": "books__book-of-praise__confessions__canons-of-dort.html",
    "forms": "books__book-of-praise__confessions.html"}.items()}

# ---- 亚他那修信经逐点拆分（按网站自带编号 “n) ”）----
ath_items = []
for p in out["creeds"]["ath"]["body"]:
    parts = re.split(r'(?:(?<=^)|(?<=[。；，！!]))\s*(\d+)\) ', p)
    k = 1
    while k < len(parts):
        ath_items.append({"n": int(parts[k]), "t": parts[k + 1].strip()})
        k += 2
out["creeds"]["ath"]["items"] = ath_items

json.dump(out, open(os.path.join(D, "cci.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("HC:", len(out["hc"]), "missing:", [i for i in range(1, 130) if i not in out["hc"]])
print("BC:", len(out["bc"]), "empty:", [k for k, v in out["bc"].items() if not v["paras"]])
for s, v in out["cd"].items():
    print(s, v["title"], len(v["arts"]), "empty:", [k for k, a in v["arts"].items() if not a["paras"]])
print("creeds:", {k: len(v["body"]) for k, v in out["creeds"].items() if k != "index"})
print("HC1:", out["hc"][1]["q"])
print("ATH items:", len(ath_items), [i["n"] for i in ath_items] == list(range(1, 43)))
print("ATH joined equals source:", all(p.replace(" ", "") .find(i["t"].replace(" ", "")) >= 0 for i in ath_items for p in ["".join(out["creeds"]["ath"]["body"])]))
print("HOME arts:", len(home["arts"]), [a["h"] for a in home["arts"]][:3], "end:", len(home["end"]))
print("INTROS:", {k: len(v) for k, v in out["intros"].items()})
