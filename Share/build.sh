#!/bin/bash
# Rebuilds Maani-Trophy-Information.pdf from source/info.html (macOS only).
# usage: ./build.sh   (needs the compiled helper /tmp/pdfwork/tool/html2pdf)
set -e
cd "$(dirname "$0")/source"
rm -rf pages && mkdir pages
python3 - <<'PY'
import re
s = open("info.html", encoding="utf-8").read()
head = s[: s.index("<body>") + 6]
pages = re.findall(r'<div class="page.*?(?=\n<!-- |\n</body>)', s, flags=re.S)
for i, p in enumerate(pages, 1):
    open(f"pages/p{i}.html", "w", encoding="utf-8").write(head + "\n" + p + "\n</body></html>")
print(len(pages), "pages")
PY
sed -i '' 's#src="img/#src="../img/#g' pages/*.html
# one process per page (WebKit paints big images reliably only on a fresh start), then join
for i in $(seq 1 $(ls pages/p*.html | wc -l)); do
  /tmp/pdfwork/tool/html2pdf pages/p$i.pdf pages/p$i.html >/dev/null
done
/tmp/pdfwork/tool/pdfjoin ../Maani-Trophy-Information.pdf $(for i in $(seq 1 $(ls pages/p*.html | wc -l)); do echo pages/p$i.pdf; done)
rm -rf pages
