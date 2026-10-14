# 校验：页面中所有 <q> 引文、背诵分行、数据引用均逐字出自 CCI 原文
import json, os, re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
D = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(D, "..", "..")
d = json.load(open(os.path.join(D, "cci.json"), encoding="utf-8"))
nosup = lambda s: re.sub(r'<sup>.*?</sup>', '', s)

texts = []
def walk(o):
    if isinstance(o, str): texts.append(nosup(o))
    elif isinstance(o, dict): [walk(v) for k, v in o.items() if k not in ("url",)]
    elif isinstance(o, list): [walk(v) for v in o]
walk({k: d[k] for k in ("creeds", "hc", "bc", "cd", "home", "intros")})
corpus = "\n".join(texts)

html = open(os.path.join(SITE, "index.html"), encoding="utf-8").read()
data = open(os.path.join(SITE, "assets", "data.js"), encoding="utf-8").read()
bad, n = [], 0
for src, name in ((html, "index.html"), (data, "data.js")):
    for m in re.finditer(r'<q[^>]*>(.*?)</q>', src, re.S):
        t = re.sub(r'<[^>]+>', '', m.group(1))
        n += 1
        if t not in corpus:
            bad.append((name, t))
# 自测解释中的引号内容
for m in re.finditer(r'x:"(.*?)"\}', data):
    x = m.group(1)
    for seg in re.findall(r'“(.+)”', x):
        for part in seg.split("……"):
            n += 1
            if part and part not in corpus:
                bad.append(("quiz", part))
print("quotes checked:", n, "mismatch:", len(bad))
for b in bad: print("  ✗", b)

# 背诵分行拼接校验
def arr(name):
    m = re.search(r'window\.%s = (\[.*?\n\]);' % name, data, re.S)
    return re.findall(r't:"(.*?)"', m.group(1))
apos = "".join(arr("APOS")); src_apos = "".join(d["creeds"]["apos"]["body"])
nic = "".join(arr("NIC_SPLIT")); src_nic = "".join(d["creeds"]["nic"]["body"])
print("APOS lines == CCI:", apos == src_apos)
print("NIC lines  == CCI:", nic == src_nic)
if nic != src_nic:
    for i, (a, b) in enumerate(zip(nic, src_nic)):
        if a != b: print("  diff at", i, repr(nic[i-5:i+10]), repr(src_nic[i-5:i+10])); break
# 首页十二条标题与 APOS 行对应（去掉末尾冒号与标点差异仅作提示）
# data-src 引用存在性
missing = []
for ref in re.findall(r'data-(?:src|open)="([^"]+)"', html):
    k = ref.split(":")
    ok = (k[0] == "hc" and k[1] in d["hc"]) or (k[0] == "bc" and k[1] in d["bc"]) or \
         (k[0] == "cd" and k[1] in d["cd"] and k[2] in d["cd"][k[1]]["arts"]) or \
         (k[0] == "intro" and (k[1] in d["creeds"] or k[1] in d["intros"])) or (k[0] == "index")
    if not ok: missing.append(ref)
print("data-src/open refs missing:", missing)
# 用字规范
for w in ["上帝", "阿里乌", "借着", "腓特烈", "德布雷", "腓力二世", "奥利维亚努"]:
    c = html.count(w) + data.count(w)
    if c: print("  用字提示:", w, c)
