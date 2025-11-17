#!/usr/bin/env python3
import re

# Read the file
with open('src/ui/album-list.test.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add count field after group_date where it's missing
# Match group_date line followed by either title or albums (not count)
pattern = r"(group_date: '2025-0[12]',)\s*\n(\s*)(title:|albums:)"
replacement = r"\1\n\2count: 2,\n\2\3"
content = re.sub(pattern, replacement, content)

# For single-album groups, adjust count to 1
content = re.sub(r"count: 2,\s*\n\s*albums: \[\s*\{\s*id:", lambda m: m.group(0).replace('count: 2,', 'count: 1,'), content)

# Replace [data-group-header] with .album-group__header
content = content.replace('[data-group-header]', '.album-group__header')

# Write back
with open('src/ui/album-list.test.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed album-list.test.js")
