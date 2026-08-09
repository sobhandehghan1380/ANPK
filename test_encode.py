import codecs

corrupt_string = open(r'f:\site\ANPK2\src\app\admin\products\page.tsx', encoding='utf-8').read()
idx = corrupt_string.find('text-slate-700 block\">') + 22
snippet = corrupt_string[idx:idx+50]
print("Snippet repr:", repr(snippet))

for cp in ['cp1252', 'cp1256', 'iso-8859-1', 'windows-1252', 'latin1']:
    try:
        raw_bytes = snippet.encode(cp)
        restored = raw_bytes.decode('utf-8', errors='replace')
        print(f'{cp} SUCCESS: {restored}')
    except Exception as e:
        print(f'{cp} FAILED: {e}')
