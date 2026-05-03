# LIFELINES validation suite

Scripts that verify the simulation produces explainable results, that the
JavaScript and Python codes are in sync, and that you're running enough
simulations for stable answers.

## Files

- **`sim_v5.py`** — Python port of the simulation engine, mirrors `lifelines.jsx` line-for-line on dynamics. Calibrated to match real-world life expectancy baselines.
- **`test_harness.py`** — Hypothesis-driven test suite. 13 scenarios with documented expected outcomes and mechanisms.
- **`cross_validate.py`** — Runs the same scenarios in **both** JS (auto-extracted from `lifelines.jsx`, run via Node) and Python, compares medians.
- **`audit_sync.py`** — Static check that scans both source files for matching numeric constants.
- **`convergence_bootstrap.py`** ⭐ — Answers "how many simulations are enough?" Builds a pool of 5,000 worlds and bootstrap-resamples to estimate standard error vs N.
- **`convergence_study.py`** — Alternative convergence approach using K independent batches (slower, more rigorous; preserved for reference).

## Running

```bash
python3 test_harness.py             # 33 hypothesis assertions, ~3 min
python3 cross_validate.py           # JS/Python distributional match, ~3 min
python3 audit_sync.py               # static constant audit, instant
python3 convergence_bootstrap.py    # convergence study, ~4 min
```

## Latest results

```
test_harness.py:           33/33 assertions passed
cross_validate.py:         32/32 medians within 1 year, max diff 0.38 yrs
audit_sync.py:             constants in sync (regex false positives confirmed manually)
convergence_bootstrap.py:  N=1000 hits ±0.2 yr 95% CI on median (sweet spot)
                           N=10000 only needed for tail percentiles and rare events
```

## Convergence summary

For the **median life expectancy**, the binding constraint is Mosaic (highest variance):

| N | 95% CI half-width | Use case |
|---|---|---|
| 25 | ±1.2 yr | sanity check only |
| 100 | ±0.6 yr | quick exploration |
| 200 | ±0.4 yr | comparing distinct scenarios |
| 1,000 | ±0.2 yr | reliable design decisions ⭐ |
| 5,000 | ±0.08 yr | publication-quality medians |
| 10,000 | ±0.06 yr | required only for tails / rare events |

For **tail percentiles** (p5, p95) the SE is ~3× larger at the same N. For **rare resolution proportions** (e.g., breakdown rate <5%), SE follows binomial scaling: ±2.2pp at N=100, ±0.7pp at N=1,000, ±0.3pp at N=10,000.

**Practical rule of thumb:** Use N=1,000 unless you're comparing two scenarios that differ by less than 0.5 yrs OR claiming a rare-event proportion to within 1 percentage point.

## What the test scenarios reveal

| Scenario | What it confirms |
|---|---|
| Baseline | Calibration to real-world life expectancies under shock |
| **Mosaic max AI/robot** | Capability without institutions kills — drops 5+ yrs below baseline. Driver: alignment_failure_death dominant at high cap × low align. |
| Mosaic full capacity build | Institutional reform brings Mosaic to mid-70s despite poor endowments |
| OM goes authoritarian | War-aggression backfires; OM crashes to mid-50s as rogue invader |
| SC abandons UBI | Loss of redistribution drops SC ~5 yrs; alignment+responsiveness still protect |
| DO democratizes | Endowments are good — institutional reform unlocks 78+ |
| Capability arms race | Higher capability accentuates institutional differences; Mosaic worst hit |
| Universal energy monopolization | env_death rises where alignment is low; SC shielded by alignment 0.65 |
| Universal high alignment | Largest absolute gain for Mosaic; war rate drops 24% → 5% |
| OM adopts SC rules | Rules dominate over endowments — OM reaches 80 yrs |
| Peaceful world | High alignment+responsiveness eliminates war (~0.06 wars/world) |
| Mosaic alignment only | Big single-lever effect: +9 yrs from alignment alone |
| Stability | Different seed bases produce same medians within 1 yr |
