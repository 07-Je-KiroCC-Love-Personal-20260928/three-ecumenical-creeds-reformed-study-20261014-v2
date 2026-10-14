# 广度遍历 ccifellowship.org 指定前缀下的页面，保存正文纯文本
import re, os, io, sys, time, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from fetch import get, body_html, to_text, title, OUT

prefixes = sys.argv[1:]
seen, queue, index = set(), list(prefixes), {}
while queue:
    p = queue.pop(0)
    if p in seen:
        continue
    seen.add(p)
    name = p.strip('/').replace('/', '__')
    hp = os.path.join(OUT, name + '.html')
    if os.path.exists(hp):
        h = open(hp, encoding='utf-8').read()
    else:
        for i in range(3):
            try:
                h = get(p); break
            except Exception as e:
                print("retry", p, e); time.sleep(2)
        open(hp, 'w', encoding='utf-8').write(h)
        time.sleep(0.3)
    t = to_text(body_html(h))
    open(os.path.join(OUT, name + '.txt'), 'w', encoding='utf-8').write(t)
    index[p] = title(h).replace(' | 基督教华人网络团契', '')
    for l in re.findall(r'href="(/books/book-of-praise/[^"#?]+)"', h):
        if any(l.startswith(px) for px in prefixes) and l not in seen:
            queue.append(l)
json.dump(index, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(index), "pages")
