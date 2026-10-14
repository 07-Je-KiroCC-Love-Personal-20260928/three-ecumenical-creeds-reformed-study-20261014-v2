# 由 cci.json 生成站点用的 assets/cci.js（原文一字不改）
import json, os
D = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(D, "..", "..", "assets", "cci.js")
d = json.load(open(os.path.join(D, "cci.json"), encoding="utf-8"))
data = {
    "base": "https://ccifellowship.org",
    "book": "敬拜手册",
    "creeds": d["creeds"],
    "home": d["home"],
    "intros": d["intros"],
    "hc": d["hc"],
    "bc": d["bc"],
    "cd": d["cd"],
    "hcParts": [
        {"t": "第一部 论人的罪和愁苦", "from": 3, "to": 11},
        {"t": "第二部 论我们的得救", "from": 12, "to": 85},
        {"t": "第三部 论感恩", "from": 86, "to": 129}
    ]
}
js = "/* 本文件由 _cci/build_cci.py 自动生成：内容逐字取自 https://ccifellowship.org/books/book-of-praise （敬拜手册），请勿手工修改 */\nwindow.CCI = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(SITE, "w", encoding="utf-8").write(js)
print("written", SITE, len(js.encode("utf-8")), "bytes")
