# -*- coding: utf-8 -*-
import json
import os
import sys

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(base, 'datasets', '_datasets.json'), 'r', encoding='utf-8') as f:
    data = json.load(f)

def escape(s):
    if s is None:
        return ''
    t = str(s).replace('\r\n', ' ').replace('\n', ' ').replace('|', '\\|')
    return t

def links_cell(links):
    if not links or not isinstance(links, dict):
        return ''
    parts = []
    for key, url in links.items():
        if url and str(url).strip():
            u = str(url).strip().replace('|', '%7C')  # 避免 | 破坏表格
            parts.append('[%s](<%s>)' % (key, u))
    return ' '.join(parts)

def task_cell(task):
    if task is None:
        return ''
    return ', '.join(task) if isinstance(task, list) else str(task)

headers = ['id', 'name', 'year', 'organs', 'staining', 'size', 'data', 'task', 'type', 'other', 'links', 'description']
sep = ' | '.join(['---'] * len(headers))
table_lines = ['| ' + ' | '.join(headers) + ' |', '| ' + sep + ' |']
for row in data:
    cells = [
        escape(row.get('id')),
        escape(row.get('name')),
        escape(row.get('year')),
        escape(row.get('organs')),
        escape(row.get('staining')),
        escape(row.get('size')),
        escape(row.get('data')),
        escape(task_cell(row.get('task'))),
        escape(row.get('type')),
        escape(row.get('other')),
        escape(links_cell(row.get('links'))),
        escape(row.get('description'))
    ]
    table_lines.append('| ' + ' | '.join(cells) + ' |')
table_block = '\n'.join(table_lines)

readme_path = os.path.join(base, 'README.md')
with open(readme_path, 'r', encoding='utf-8') as f:
    readme = f.read()
start_marker = '| id | name | year | organs | staining | size | data | task | type | other | links | description |'
idx = readme.find(start_marker)
if idx >= 0:
    rest = readme[idx:]
    lines = rest.split('\n')
    end_idx = 0
    for i, line in enumerate(lines):
        if line.strip().startswith('|') and line.strip().endswith('|'):
            end_idx = i + 1
        else:
            break
    readme_new = readme[:idx] + table_block + '\n' + readme[idx + len('\n'.join(lines[:end_idx])):]
else:
    readme_new = readme
with open(readme_path, 'w', encoding='utf-8') as f:
    f.write(readme_new)
print('README.md table updated with clickable links.')
