#!/usr/bin/env bash
# Compress and linearise one PDF in place (FR-B-05). The result is kept only when it is at least
# 10 % smaller, so files that are already lean are never touched or churned.
# Usage: bash scripts/optimise-pdf.sh <file.pdf>   (needs ghostscript and qpdf)
set -uo pipefail
f="$1"
tmp="$(mktemp -d)"

# ponytail: /ebook downsamples images to 150 dpi, plenty for printed papers; use /printer (300 dpi) if scans look soft
if ! gs -q -dNOPAUSE -dBATCH -dSAFER -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook \
  -sOutputFile="$tmp/small.pdf" "$f"; then
  echo "skipped $f: Ghostscript could not read it"
  exit 0
fi

# Linearised ("fast web view") PDFs let the browser show page 1 before the rest has downloaded.
# qpdf exits with 3 for warnings it has repaired, which is still a usable file.
qpdf --linearize --object-streams=generate "$tmp/small.pdf" "$tmp/out.pdf"
status=$?
if [ "$status" -ne 0 ] && [ "$status" -ne 3 ]; then
  echo "skipped $f: qpdf failed"
  exit 0
fi

old=$(stat -c %s "$f")
new=$(stat -c %s "$tmp/out.pdf")
if [ $((new * 10)) -le $((old * 9)) ]; then
  cp "$tmp/out.pdf" "$f"
  echo "optimised $f: $old -> $new bytes"
else
  echo "kept $f: only $old -> $new bytes"
fi
