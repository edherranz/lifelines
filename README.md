# LIFELINES

A browser-based political-economy simulator. Four institutional archetypes face a transformative AI capability shock and have 150 years to absorb it. Their internal rules — taxes, redistribution, alignment stringency, political responsiveness — determine whether they cohere or come apart.

The metric is **median life expectancy**, integrated over 150 years. It captures economic deprivation, political violence, environmental harm, alignment failure, and war casualties.

## Live demo

After deploying, visit: `https://<your-username>.github.io/<repo-name>/`

## What's in this repo

```
.
├── src/
│   ├── lifelines.jsx       The full simulator (React + Recharts + Tailwind)
│   ├── main.jsx            React entry point
│   └── index.css           Tailwind base
├── validation/             Python validation suite (mirrors the JS sim)
│   ├── sim_v5.py           Python port of the simulation engine
│   ├── test_harness.py     13 hypothesis-driven scenarios, 33 assertions
│   ├── cross_validate.py   Distributional check: JS sim vs Python sim
│   ├── convergence_*.py    "How many simulations are enough?" study
│   └── audit_sync.py       Static check that key constants match
├── .github/workflows/      Auto-deploy to GitHub Pages on push to main
├── index.html              HTML entry
├── package.json            Vite + React deps
├── vite.config.js          Build config (relative base for GH Pages)
├── tailwind.config.js
└── postcss.config.js
```

## Run locally

You need Node.js 18+ installed. Then:

```bash
npm install        # one-time, installs React, Vite, Tailwind, Recharts, lucide-react
npm run dev        # starts dev server at http://localhost:5173
```

Edit `src/lifelines.jsx` and the page hot-reloads.

## Build for production

```bash
npm run build      # outputs static site to dist/
npm run preview    # serves the production build at http://localhost:4173
```

The `dist/` folder contains a fully static site — index.html plus a few JS/CSS files — that you can host anywhere (GitHub Pages, Cloudflare Pages, Netlify, S3, your own server).

## Deploy to GitHub Pages (automatic)

The `.github/workflows/deploy.yml` workflow does it for you. Once you push this repo to GitHub:

1. Go to your repository's **Settings** → **Pages** (in the left sidebar)
2. Under **Source**, select **GitHub Actions**
3. Push any commit to the `main` branch — the action runs, builds, and deploys
4. After ~1–2 minutes, your site is live at `https://<your-username>.github.io/<repo-name>/`

To trigger manually: **Actions** tab → **Deploy LIFELINES to GitHub Pages** → **Run workflow**.

## Validation suite

The `validation/` folder contains Python scripts that test the simulation logic. Run them locally if you have Python 3.10+:

```bash
cd validation
python3 test_harness.py             # 33 hypothesis assertions, ~3 min
python3 cross_validate.py           # JS↔Python distributional match, ~3 min
python3 convergence_bootstrap.py    # convergence study, ~4 min
```

Latest results:
- **33/33** hypothesis assertions pass
- **32/32** medians match between JS and Python within 1 year (max drift 0.38 yr)
- **N=1,000** worlds is the sweet spot for design-quality decisions

See `validation/README.md` for details.

## License

MIT — see `LICENSE`.
