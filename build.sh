#!/usr/bin/env bash
# Rebuild app.js from the JSX sources in rides/.
# Requires Node + npx on PATH.
set -euo pipefail

cd "$(dirname "$0")"

tmp=$(mktemp --suffix=.jsx)
trap 'rm -f "$tmp"' EXIT

cat rides/theme.jsx rides/receipt.jsx rides/landing-receipt.jsx rides/app.jsx > "$tmp"
printf '\nconst __wnir_root = ReactDOM.createRoot(document.getElementById("root"));\n__wnir_root.render(<RidesApp />);\n' >> "$tmp"

npx --yes esbuild "$tmp" \
  --loader:.jsx=jsx \
  --minify \
  --target=es2018 \
  --legal-comments=none \
  > app.js

echo "wrote app.js ($(wc -c < app.js) bytes)"
