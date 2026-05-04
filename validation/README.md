# LIFELINES validation suite

Scripts that verify the simulation produces explainable results, that the
JavaScript and Python codes are in sync, and that you're running enough
simulations for stable answers.

## Architecture (v0.6 onwards)

Both the JavaScript engine (`../src/lifelines.jsx`) and the Python port (`sim_v5.py`)
now use the **same centralized `CONSTANT_DEFS` catalog**. Every numeric tunable
in the model (53 of them, in 8 groups) lives in this catalog with:

- `value` — the numeric default
- `group` — which subsystem it belongs to (capability, mortality, war, flows, etc.)
- `class` — Empirical / Calibrated / Structural

The simulation functions (`step_bloc`, `compute_interactions`, `run_world`,
`run_world_batch`) all accept an optional `K` parameter — a dict of constant
values. Default behavior uses `DEFAULT_CONSTANTS`, which is auto-derived from
`CONSTANT_DEFS`. To probe model behavior under non-default constants, pass
`K={'BASE_DEATH': 0.015, ...}` and the function merges with defaults for the
unspecified keys.

The web app exposes this same machinery in the *Manual → Constants* page:
edits there flow into the next simulation run and are included in JSON export.

## Scope: validation runs against default constants

**All four published validation results below were produced with the constants
at their default values.** Editing any constant invalidates these specific
numbers. That's the whole point of the constants editor — see what shifts. The
*Findings* section of the web app includes banners and the `CONSTANTS MODIFIED`
pill that appear whenever non-defaults are active, to prevent confusion between
"published default-constant numbers" and "your custom-constant runs."

If you want validation under non-default constants, pass a `K` override to
`run_scenario` in `test_harness.py`, or copy the `sensitivity_analysis.py`
pattern.

## Files

- **`sim_v5.py`** — Python port of the simulation engine. Mirrors `lifelines.jsx`
  line-for-line on dynamics. Contains the authoritative Python `CONSTANT_DEFS`
  and `DEFAULT_CONSTANTS`.
- **`test_harness.py`** — 13 hypothesis-driven scenarios with documented
  expected outcomes. Now accepts `K=` override on `run_scenario` to test under
  custom constants.
- **`cross_validate.py`** — Auto-extracts the JS sim from `lifelines.jsx`,
  runs both JS (via Node) and Python with matching seeds, compares medians.
- **`audit_sync.py`** — Parses `CONSTANT_DEFS` from both files and compares
  by key. Reports any value, group, or class mismatch. Replaces the old
  regex-based literal-hunting approach.
- **`convergence_bootstrap.py`** ⭐ — Convergence study: bootstrap-resamples
  a 5,000-world pool to estimate standard error of median life expectancy
  vs. batch size N.
- **`convergence_study.py`** — Alternative K-batch convergence approach
  (slower, more rigorous).
- **`sensitivity_analysis.py`** ✨ NEW — Perturbs each constant by ±20% and
  ranks by impact on median life expectancy. Useful for prioritizing which
  constants deserve careful empirical sourcing and which are robust.
- **`sensitivity_results.txt`** — Canonical sensitivity ranking at N=100.

## Running

```bash
# All scripts run from this directory.

python3 audit_sync.py                # 53 constants verified, instant
python3 test_harness.py              # 33 hypothesis assertions, ~3 min
python3 cross_validate.py            # JS↔Python distributional match, ~3 min
python3 convergence_bootstrap.py     # convergence study, ~4 min
python3 sensitivity_analysis.py      # ±20% perturbation ranking, ~3 min

# sensitivity_analysis.py supports filters:
python3 sensitivity_analysis.py --only-class Empirical
python3 sensitivity_analysis.py --only-group mortality
python3 sensitivity_analysis.py -n 200 -p 0.10        # tighter, slower
```

## Latest results (default constants, v0.6)

```
audit_sync.py:               53/53 constants in sync (value + group + class)
test_harness.py:             33/33 hypothesis assertions passed
cross_validate.py:           32/32 medians within 1 year, max diff 0.38 yrs
convergence_bootstrap.py:    N=1,000 sweet spot — ±0.2yr 95% CI on median
sensitivity_analysis.py:     53 constants ranked, top 5 below
```

### Top 5 most-sensitive constants (Σ|ΔLE| across the 4 blocs at ±20%)

```
1. BASE_DEATH                (Empirical)   44.8 yrs    inverse drives life-expectancy
2. CRISIS_SCAR_DECAY         (Structural)  18.6 yrs    half-life of crisis memory
3. ENV_DEATH_ALIGN_THRESHOLD (Structural)   6.4 yrs    when alignment "kicks in"
4. POVERTY_THRESHOLD         (Structural)   5.2 yrs    income floor for poverty death
5. ALIGN_FAIL_ALIGN_THRESHOLD (Structural)  3.9 yrs    when alignment failures deadly
```

Notes for interpretation:
- The dominance of `BASE_DEATH` is expected — life expectancy ≈ 1/mortality
  has steep derivative — but it tells you the **single most consequential
  calibration choice** in the model.
- `CRISIS_SCAR_DECAY` at #2 is a genuine finding: the model's resilience
  pattern is heavily sensitive to a *Structural* constant (not derived from
  data). This is exactly the kind of thing a thoughtful quant would
  challenge.
- War-related constants show near-zero sensitivity at default rules because
  wars are uncommon there. Re-run sensitivity under an `OM_AUTHORITARIAN`
  scenario and the war constants jump up the rankings — a worthwhile follow-up.

See `sensitivity_results.txt` for the full ranking.

## Adding a constant

1. Add the entry to `CONSTANT_DEFS` in **both** `sim_v5.py` (Python) and
   `../src/lifelines.jsx` (JavaScript). Same key, same value, same group,
   same class.
2. Reference it as `K['NAME']` in Python or `K.NAME` in JavaScript inside
   the relevant simulation function.
3. Add a description and rationale in the JavaScript catalog (the longer
   metadata is documentation-only and lives in JS).
4. Run `python3 audit_sync.py` to verify the keys/values match.
5. Run `python3 cross_validate.py` to confirm the JS and Python sims still
   agree at default values.
