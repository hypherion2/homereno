#!/usr/bin/env python3
"""Helpers for the remodel studio source tree.

    python3 tools/studio.py bundle OUT.html [--exclude v13,v14]
        Inline the CSS and every script into one self-contained HTML file
        (handy for offline use and for the test scripts).

    python3 tools/studio.py publish OUT_DIR [--exclude v13,v14]
        Copy the site (index.html, css/, js/) into OUT_DIR, leaving out the
        listed concepts (held-back ideas that are not ready to share).

Concept data lives in js/data/versions.js (the list) and js/data/concepts/<key>.js
(one file per concept).  load_versions / load_concept / save_concept below read and
write those files so scripts can edit concepts without hand-editing JSON.
"""
import json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSIONS = os.path.join(ROOT, 'js', 'data', 'versions.js')
CONCEPTS = os.path.join(ROOT, 'js', 'data', 'concepts')

def _between(text, start, end):
    i = text.index(start) + len(start); j = text.index(end, i); return text[i:j]

def load_versions(root=ROOT):
    t = open(os.path.join(root, 'js', 'data', 'versions.js'), encoding='utf8').read()
    return json.loads(_between(t, 'const VERS = ', ';\nconst DATA'))

def save_versions(V, root=ROOT):
    p = os.path.join(root, 'js', 'data', 'versions.js'); t = open(p, encoding='utf8').read()
    head = t[:t.index('const VERS = ')]
    open(p, 'w', encoding='utf8').write(head + 'const VERS = ' + json.dumps(V, indent=2, ensure_ascii=False) + ';\nconst DATA = {};\n')

def load_concept(key, root=ROOT):
    t = open(os.path.join(root, 'js', 'data', 'concepts', key + '.js'), encoding='utf8').read()
    return json.loads(t[t.index('{'):t.rindex('}') + 1])

def save_concept(key, C, root=ROOT, title=None):
    if title is None:
        title = next((v['chip'] for v in load_versions(root) if v['key'] == key), key)
    out = ['// ' + title, 'DATA[%s] = {' % json.dumps(key)]
    keys = list(C)
    for i, k in enumerate(keys):
        v = C[k]; end = ',' if i < len(keys) - 1 else ''
        if isinstance(v, list):
            out.append('  %s: [' % json.dumps(k))
            for j, it in enumerate(v):
                out.append('    ' + json.dumps(it, separators=(', ', ': ')) + (',' if j < len(v) - 1 else ''))
            out.append('  ]' + end)
        else:
            out.append('  %s: %s%s' % (json.dumps(k), json.dumps(v), end))
    out.append('};')
    open(os.path.join(root, 'js', 'data', 'concepts', key + '.js'), 'w', encoding='utf8').write('\n'.join(out) + '\n')

def load_all(root=ROOT, exclude=()):
    V = [v for v in load_versions(root) if v['key'] not in exclude]
    return V, {v['key']: load_concept(v['key'], root) for v in V}

def _scripts(html):
    return re.findall(r'<script src="(js/[^"]+)"></script>', html)

def bundle(out, exclude=()):
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
    css = open(os.path.join(ROOT, 'css', 'studio.css'), encoding='utf8').read()
    html = html.replace('<link rel="stylesheet" href="css/studio.css" />', '<style>\n' + css + '</style>')
    html = html.replace('<link rel="stylesheet" href="css/studio.css">', '<style>\n' + css + '</style>')
    parts = []
    for s in _scripts(html):
        key = os.path.splitext(os.path.basename(s))[0]
        if s.startswith('js/data/concepts/') and key in exclude: continue
        code = open(os.path.join(ROOT, s), encoding='utf8').read()
        if s == 'js/data/versions.js' and exclude:
            V = [v for v in json.loads(_between(code, 'const VERS = ', ';\nconst DATA')) if v['key'] not in exclude]
            code = code[:code.index('const VERS = ')] + 'const VERS = ' + json.dumps(V, indent=2, ensure_ascii=False) + ';\nconst DATA = {};\n'
        parts.append('// ===== ' + s + '\n' + code)
    first = html.index('<script src="js/'); last = html.rindex('</script>') + len('</script>')
    html = html[:first] + '<script>\n' + '\n'.join(parts) + '\n</script>' + html[last:]
    open(out, 'w', encoding='utf8').write(html)

def publish(out, exclude=()):
    os.makedirs(out, exist_ok=True)
    for d in ('css', 'js'):
        if os.path.exists(os.path.join(out, d)): shutil.rmtree(os.path.join(out, d))
    shutil.copytree(os.path.join(ROOT, 'css'), os.path.join(out, 'css'))
    shutil.copytree(os.path.join(ROOT, 'js'), os.path.join(out, 'js'), ignore=lambda d, fs: [f for f in fs if f[:-3] in exclude and d.endswith('concepts')])
    if os.path.exists(os.path.join(ROOT, 'tools')):
        if os.path.exists(os.path.join(out, 'tools')): shutil.rmtree(os.path.join(out, 'tools'))
        shutil.copytree(os.path.join(ROOT, 'tools'), os.path.join(out, 'tools'), ignore=shutil.ignore_patterns('__pycache__'))
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
    for k in exclude: html = html.replace('<script src="js/data/concepts/%s.js"></script>\n' % k, '')
    open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(html)
    if exclude:
        V = [v for v in load_versions() if v['key'] not in exclude]; save_versions(V, out)
    for f in ('README.md',):
        if os.path.exists(os.path.join(ROOT, f)): shutil.copy(os.path.join(ROOT, f), os.path.join(out, f))

if __name__ == '__main__':
    a = sys.argv[1:]; ex = ()
    if '--exclude' in a:
        i = a.index('--exclude'); ex = tuple(x for x in a[i + 1].split(',') if x); del a[i:i + 2]
    {'bundle': bundle, 'publish': publish}[a[0]](a[1], ex)
