# 抓取 ccifellowship.org 页面正文，保存为纯文本（原样保留文字，用于逐字引用）
import re, sys, os, json, html, urllib.request

BASE = "https://ccifellowship.org"
OUT = os.path.dirname(os.path.abspath(__file__))

def get(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read().decode("utf-8")

def body_html(h):
    # Drupal 正文区域
    m = re.search(r'<div[^>]*class="[^"]*field--name-body[^"]*"[^>]*>(.*?)</div>\s*(?:<nav|<div[^>]*class="[^"]*(?:book-navigation|links|node__links)|</article)', h, re.S)
    if not m:
        m = re.search(r'<article[^>]*>(.*?)</article>', h, re.S)
    return m.group(1) if m else h

def to_text(fragment):
    s = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', '', fragment)
    s = re.sub(r'(?i)<br\s*/?>', '\n', s)
    s = re.sub(r'(?i)</(p|div|h[1-6]|li|tr|blockquote)>', '\n', s)
    s = re.sub(r'(?i)<(p|div|h[1-6]|li|tr|blockquote)[^>]*>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('\xa0', ' ')
    lines = [l.strip() for l in s.split('\n')]
    out, blank = [], False
    for l in lines:
        if not l:
            if not blank and out: out.append('')
            blank = True
        else:
            out.append(l); blank = False
    return '\n'.join(out).strip()

def title(h):
    m = re.search(r'<title>(.*?)</title>', h, re.S)
    return html.unescape(m.group(1)).strip() if m else ''

def children(h, prefix):
    return sorted(set(re.findall(r'href="(' + re.escape(prefix) + r'/[^"#?]+)"', h)))

if __name__ == "__main__":
    paths = sys.argv[1:]
    res = {}
    for p in paths:
        h = get(p)
        name = p.strip('/').replace('/', '__')
        with open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8') as f: f.write(h)
        t = to_text(body_html(h))
        with open(os.path.join(OUT, name + '.txt'), 'w', encoding='utf-8') as f: f.write(t)
        res[p] = {"title": title(h), "chars": len(t), "children": children(h, p)}
    print(json.dumps(res, ensure_ascii=False, indent=1))
