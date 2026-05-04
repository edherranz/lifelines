"""LIFELINES sensitivity analysis — quantify how much each constant matters.

Method
------
For each constant in CONSTANT_DEFS, run N=100 worlds at default minus 20%, then at
default plus 20%, holding all other constants fixed. Compare the median life
expectancy under the BASELINE rule preset (default endowments + default rules,
AI shock active) against the unperturbed baseline.

Reports a sorted ranking of constants by absolute median-life-expectancy
sensitivity, summed across the four blocs. Useful for:

  - Prioritizing which constants deserve careful empirical sourcing
  - Identifying which structural assumptions the model output is most reliant on
  - Bug-hunting (a constant with implausibly large sensitivity may indicate a
    formula error)

Calibration note: this script tests against DEFAULT_CONSTANTS. To explore
sensitivity around a non-default operating point, change the BASE constants
dict below or pass a custom K to run_scenario in test_harness.

Runtime: ~4-8 minutes depending on the machine. The script reports incremental
progress so you can see it's working.
"""
import sys
import time
import statistics
import argparse

import sim_v5
from test_harness import run_scenario


# Tunable defaults
DEFAULT_N_RUNS = 100      # worlds per (constant, perturbation) cell
DEFAULT_PCT = 0.20        # ±20% perturbation
SEED_BASE = 10000

BLOCS = ['OM', 'SC', 'DO', 'Mosaic']


def median_le_per_bloc(results):
    """Extract median life expectancy per bloc from run_scenario output."""
    return {b: results[b]['median'] for b in BLOCS}


def absolute_sum_delta(baseline_meds, perturbed_meds):
    """Sum of absolute differences across the four blocs — total LE-years moved."""
    return sum(abs(perturbed_meds[b] - baseline_meds[b]) for b in BLOCS)


def signed_per_bloc_delta(baseline_meds, perturbed_meds):
    """Per-bloc signed difference (perturbed minus baseline)."""
    return {b: perturbed_meds[b] - baseline_meds[b] for b in BLOCS}


def run_sensitivity(n_runs=DEFAULT_N_RUNS, pct=DEFAULT_PCT,
                    only_classes=None, only_groups=None, exclude_keys=None):
    """
    Returns a list of dicts sorted by absolute sensitivity, descending:
      [{key, group, class, default, low, high,
        delta_low_per_bloc, delta_high_per_bloc, abs_total}, ...]
    """
    only_classes = set(only_classes) if only_classes else None
    only_groups = set(only_groups) if only_groups else None
    exclude_keys = set(exclude_keys) if exclude_keys else set()

    print('=' * 84)
    print('LIFELINES — sensitivity analysis')
    print('=' * 84)
    print(f'  Worlds per cell:  {n_runs}')
    print(f'  Perturbation:     ±{pct*100:.0f}%')
    print(f'  Scenario:         BASELINE (default rules, AI shock active)')
    print()

    # 1. Establish baseline (default constants)
    print('Phase 1/2 — running unperturbed baseline...')
    t0 = time.time()
    baseline_results = run_scenario('BASELINE', {}, n_runs=n_runs, seed_base=SEED_BASE)
    baseline_meds = median_le_per_bloc(baseline_results)
    t1 = time.time()
    print(f'  baseline medians: '
          f'OM={baseline_meds["OM"]:.2f}  SC={baseline_meds["SC"]:.2f}  '
          f'DO={baseline_meds["DO"]:.2f}  Mosaic={baseline_meds["Mosaic"]:.2f}  '
          f'(took {t1-t0:.1f}s)')

    # 2. Perturbation per constant
    candidates = []
    for key, defn in sim_v5.CONSTANT_DEFS.items():
        if key in exclude_keys:
            continue
        if only_classes and defn['class'] not in only_classes:
            continue
        if only_groups and defn['group'] not in only_groups:
            continue
        candidates.append((key, defn))

    print(f'\nPhase 2/2 — perturbing {len(candidates)} constants (each tested at low + high)...')
    rows = []
    for idx, (key, defn) in enumerate(candidates, 1):
        default_v = defn['value']
        low_v = default_v * (1 - pct)
        high_v = default_v * (1 + pct)
        # Special-case zero defaults: skip (relative perturbation is meaningless)
        if default_v == 0:
            print(f'  [{idx:>2}/{len(candidates)}] {key:<32} default=0, skipping')
            continue
        # Special-case integer constants like WAR_T_MIN: keep them integers
        if isinstance(default_v, int) and not isinstance(default_v, bool):
            low_v = max(1, int(round(low_v)))
            high_v = max(low_v + 1, int(round(high_v)))

        t_start = time.time()
        # Reuse same seeds so stochastic noise cancels — only the constant changed
        K_low = {key: low_v}
        K_high = {key: high_v}
        res_low = run_scenario('LOW', {}, n_runs=n_runs, seed_base=SEED_BASE, K=K_low)
        res_high = run_scenario('HIGH', {}, n_runs=n_runs, seed_base=SEED_BASE, K=K_high)
        meds_low = median_le_per_bloc(res_low)
        meds_high = median_le_per_bloc(res_high)
        delta_low = signed_per_bloc_delta(baseline_meds, meds_low)
        delta_high = signed_per_bloc_delta(baseline_meds, meds_high)
        # Sensitivity: average of |delta_low| and |delta_high| summed across blocs
        abs_total = (absolute_sum_delta(baseline_meds, meds_low)
                     + absolute_sum_delta(baseline_meds, meds_high)) / 2

        rows.append({
            'key': key, 'group': defn['group'], 'class': defn['class'],
            'default': default_v, 'low': low_v, 'high': high_v,
            'delta_low': delta_low, 'delta_high': delta_high,
            'abs_total': abs_total,
        })

        elapsed = time.time() - t_start
        # Compact line per constant
        d_summary = ' '.join(
            f'{b}({delta_low[b]:+.2f}/{delta_high[b]:+.2f})' for b in BLOCS
        )
        print(f'  [{idx:>2}/{len(candidates)}] {key:<32} '
              f'Σ|Δ|={abs_total:>5.2f}  {elapsed:.1f}s   {d_summary}')

    # 3. Sort by total sensitivity
    rows.sort(key=lambda r: r['abs_total'], reverse=True)
    return baseline_meds, rows


def print_report(baseline_meds, rows):
    print()
    print('=' * 84)
    print(f'RANKING — constants by total sensitivity (sum of |ΔLE| across 4 blocs, avg of low & high)')
    print('=' * 84)
    print(f'  Baseline medians:  '
          f'OM={baseline_meds["OM"]:.2f}  SC={baseline_meds["SC"]:.2f}  '
          f'DO={baseline_meds["DO"]:.2f}  Mosaic={baseline_meds["Mosaic"]:.2f}')
    print()
    print(f'  {"#":>3} {"CONSTANT":<32} {"GROUP":<11} {"CLASS":<11} {"Σ|ΔLE|":>7}  per-bloc Δ at low / high')
    print('  ' + '─' * 82)
    for rank, r in enumerate(rows, 1):
        d_low = r['delta_low']
        d_high = r['delta_high']
        per_bloc = '   '.join(
            f'{b}:{d_low[b]:+.1f}/{d_high[b]:+.1f}'
            for b in BLOCS
        )
        print(f'  {rank:>3} {r["key"]:<32} {r["group"]:<11} {r["class"]:<11} '
              f'{r["abs_total"]:>7.3f}  {per_bloc}')

    # ── Top-of-the-list summary ────────────────────────────────
    print()
    print('=' * 84)
    print('INTERPRETATION')
    print('=' * 84)
    if not rows:
        print('  (no constants tested)')
        return

    top_three = rows[:3]
    bottom_three = rows[-3:][::-1]
    print(f'  Most-sensitive constants (model output depends most on these):')
    for r in top_three:
        print(f'    · {r["key"]} ({r["class"]}) — Σ|ΔLE| = {r["abs_total"]:.2f} yrs')
    print()
    print(f'  Least-sensitive constants (in this scenario, output barely moves):')
    for r in bottom_three:
        print(f'    · {r["key"]} ({r["class"]}) — Σ|ΔLE| = {r["abs_total"]:.2f} yrs')
    print()
    print(f'  Reading the table: a value of 1.0 means moving this constant by ±{int(DEFAULT_PCT*100)}%')
    print(f'  shifts median life expectancy by 1 year (summed across the 4 blocs, averaged over the')
    print(f'  two perturbation directions). High sensitivity means the model output is structurally')
    print(f'  driven by that constant; low sensitivity means the constant is robust at the scenario')
    print(f'  tested. (Sensitivities are scenario-dependent — different rules will reorder this list.)')


def main():
    ap = argparse.ArgumentParser(description='LIFELINES sensitivity analysis')
    ap.add_argument('-n', '--n-runs', type=int, default=DEFAULT_N_RUNS,
                    help=f'Worlds per perturbation cell (default {DEFAULT_N_RUNS})')
    ap.add_argument('-p', '--pct', type=float, default=DEFAULT_PCT,
                    help=f'Fractional perturbation, default {DEFAULT_PCT}')
    ap.add_argument('--only-class', choices=['Empirical', 'Calibrated', 'Structural'],
                    action='append', help='Restrict to specific epistemic class(es)')
    ap.add_argument('--only-group', action='append',
                    help='Restrict to specific group(s) e.g. mortality, war, flows')
    ap.add_argument('--exclude', action='append',
                    help='Skip a specific constant key')
    args = ap.parse_args()

    t0 = time.time()
    baseline_meds, rows = run_sensitivity(
        n_runs=args.n_runs, pct=args.pct,
        only_classes=args.only_class, only_groups=args.only_group,
        exclude_keys=args.exclude or [],
    )
    print_report(baseline_meds, rows)
    print(f'\n  Total time: {time.time() - t0:.1f}s')
    return 0


if __name__ == '__main__':
    sys.exit(main())
