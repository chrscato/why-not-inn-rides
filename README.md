# Why-Not-INN: IDR Economics Receipts

[chrscato.github.io/why-not-inn-rides](https://chrscato.github.io/why-not-inn-rides)

A receipt-style analysis of federal IDR disputes asking whether the
patient could have taken an Uber to a nearby in-network provider for
less than the arbitration award. Built across ~3.7M IDR disputes
through 2025-Q2, joined to public MRF in-network rates and a modeled
UberX fare.

## What it does

- **IDR PUF ingestion.** Parses CMS's Federal IDR Public Use Files
  into a per-quarter dispute table (CPT, state, payer, prevailing
  offer amount, QPA), normalizing schema drift across quarterly
  releases. Final state-quarter-CPT aggregates roll up to a
  payer-enriched parquet that drives the downstream views.
- **MRF rate joining.** For each dispute, computes the median
  in-network contracted rate for the same CPT within a geographic
  radius of the disputed provider (using a per-NPI contracted-rate
  sample plus p25/p75 spread and rate count). The point is a
  defensible "comparable INN rate" benchmark per case, not a single
  payer's number.
- **Fare modeling.** Approximates patient transport cost with a simple
  UberX-style estimate ($4.00 base + $1.85/mi) over the distance to
  the nearest in-network alternative — explicit, reproducible, no API
  dependency.
- **The receipt.** Each case produces a per-dispute "savings" figure:
  arbitrator-awarded minus comparable INN rate minus the modeled fare.
  Surfacing examples in the $700–$1,100 range for routine imaging
  (CT/MRI of abdomen, chest, spine) where the awarded amount is 4–7×
  the local in-network median.

## Stack

Python for the data pipeline (PUF parsing, MRF rate aggregation,
parquet generation), then exported to a static React + SVG site for
the front end. Repo organized as separate modules per stage with a
deterministic data build script.

## This repo

Front end only. The Python pipeline lives upstream and emits
`rides/data.js` (a `window.RIDES = [...]` payload) that this repo
serves as a static site.

```
index.html        entry point
app.js            pre-bundled UI (theme + receipt + landing + app)
rides/
  data.js         generated dataset
  *.jsx           component sources for app.js
build.sh          rebuild app.js from rides/*.jsx (esbuild via npx)
```

Preview locally with `python3 -m http.server 8000`. After editing any
`rides/*.jsx`, rerun `./build.sh` to regenerate `app.js`.
