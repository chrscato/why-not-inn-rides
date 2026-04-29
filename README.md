# Why Not In-Network?

Static "rides" view for the federal IDR Public Use File — receipt-style
visualizations comparing IDR-awarded amounts against nearby in-network
contracted rates, with a ride-share fare as the relatable yardstick.

## Layout

```
index.html          entry point
app.js              pre-bundled UI (theme + receipt + landing-receipt + app)
rides/
  data.js           generated dataset (window.RIDES = [...])
  *.jsx             component sources (kept for rebuilding app.js)
logo.png
style.css
build.sh            rebuild app.js from rides/*.jsx
```

## Local preview

```
python3 -m http.server 8000
# open http://127.0.0.1:8000/
```

## Rebuilding the JS bundle

After editing any `rides/*.jsx`:

```
./build.sh
```

Requires Node + npx; uses esbuild via `npx --yes`.

## Updating the dataset

`rides/data.js` is regenerated upstream from a parquet of payer-enriched
IDR disputes. Replace the file in place when refreshing.

## Analytics

`index.html` includes Microsoft Clarity (sessions + heatmaps) and RB2B
(US-visitor company identification). Replace the two placeholder strings:

- `REPLACE_WITH_CLARITY_ID`
- `REPLACE_WITH_RB2B_KEY`

## Hosting

Designed for GitHub Pages. Source = repo root, no build step required at
serve time (everything is static).
