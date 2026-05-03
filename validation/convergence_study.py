"""
LIFELINES convergence study.

For each candidate sample size N, run K independent batches and measure the
across-batch standard deviation of each statistic of interest. The N at which
the across-batch SD drops below a target tolerance is "enough" for that statistic.

Key insight: median converges faster than tail percentiles, which converge
faster than rare-event proportions (e.g., breakdown rate in <5% of worlds).
"""
import sim_v5
import random
import statistics
import time
from collections import Counter

SCENARIOS = {
    'baseline': {},
    'mosaic_max_ai': {'Mosaic': {'aiGrowth': 100, 'robotGrowth': 100}},
}

SIZES = [50, 100, 200, 500, 1000]
K = 6  # K independent batches per size for SD estimation


def run_batch_summary(overrides, n, seed_base):
    """Run n worlds, return per-bloc medians, p5, p95, plus war count and resolutions."""
    rules = {
        'OM': dict(sim_v5.OPEN_MARKET),
        'SC': dict(sim_v5.SOCIAL_COMPACT),
        'DO': dict(sim_v5.DIRECTED_ORDER),
        'Mosaic': dict(sim_v5.MOSAIC),
    }
    for bloc_key, rule_changes in overrides.items():
        rules[bloc_key].update(rule_changes)

    lifes = {k: [] for k in rules}
    resolutions = {k: [] for k in rules}
    war_counts = []

    for i in range(n):
        rng = random.Random(seed_base + i * 7919)
        blocs = {k: sim_v5.init_bloc(k, rules[k], rng) for k in rules}
        for k in blocs:
            blocs[k]['wars_as_target'] = []
            blocs[k]['wars_as_aggressor'] = []
        for t in range(1, 151):
            inputs = sim_v5.compute_interactions(blocs, t, rng)
            for k in blocs:
                sim_v5.step_bloc(blocs[k], t, rng, inputs[k], ai_shock_active=True)
        run_wars = 0
        for k in blocs:
            j = blocs[k]
            avg_mort = j['cumulativeMortality'] / 150
            le = max(28, min(90, 1 / avg_mort))
            lifes[k].append(le)
            # Resolution from final 30-turn averages
            # Approximation: just use endgame state since we don't track history here
            res = classify_resolution(k, j)
            resolutions[k].append(res)
            run_wars += len(j['wars_as_aggressor'])
        war_counts.append(run_wars)

    out = {}
    for k in lifes:
        s = sorted(lifes[k])
        n_s = len(s)
        out[k] = {
            'median': s[n_s // 2],
            'mean': statistics.mean(lifes[k]),
            'p5': s[max(0, int(0.05 * n_s))],
            'p95': s[min(n_s - 1, int(0.95 * n_s))],
            'breakdown_pct': resolutions[k].count('breakdown') / n_s * 100,
            'extraction_pct': resolutions[k].count('extraction') / n_s * 100,
        }
    out['_war_rate'] = sum(1 for w in war_counts if w > 0) / n * 100
    out['_avg_wars'] = statistics.mean(war_counts)
    return out


def classify_resolution(k, j):
    income = j['medianIncome']
    gini = j['gini']
    stab = j['polStability']
    conc = j['capitalConc']
    unemp = j['unemployment']
    if stab < 0.30:
        return 'breakdown'
    if conc > 0.78 and gini > 0.62:
        return 'rentier'
    if k == 'Mosaic' and income < 0.5 and gini > 0.55:
        return 'extraction'
    if gini > 0.55 and income < 0.7:
        return 'bifurcation'
    if income > 1.4 and unemp < 0.20 and gini < 0.45:
        return 'abundance'
    return 'redistribution'


def main():
    print('=' * 100)
    print('LIFELINES CONVERGENCE STUDY')
    print(f'For each N, runs K={K} independent batches, measures across-batch SD of statistics.')
    print(f'Smaller across-batch SD = the statistic has converged at that N.')
    print('=' * 100)

    for sc_name, overrides in SCENARIOS.items():
        print(f'\n┌─ Scenario: {sc_name}')
        # Track key statistics over (size, batch) repeats
        # Focus on Mosaic since it has the most variance
        focus = 'Mosaic' if sc_name != 'om_authoritarian' else 'OM'
        print(f'│ Focus bloc: {focus}')
        print(f'│')
        print(f'│ {"N":>5s}  {"med (SD)":>13s}  {"p5 (SD)":>13s}  {"p95 (SD)":>13s}  {"war% (SD)":>13s}  {"time":>7s}')
        print(f'│ {"-"*5}  {"-"*13}  {"-"*13}  {"-"*13}  {"-"*13}  {"-"*7}')

        for n in SIZES:
            t0 = time.time()
            batch_results = []
            for k_idx in range(K):
                seed_base = 50000 + k_idx * 1000003  # large prime steps for independence
                r = run_batch_summary(overrides, n, seed_base)
                batch_results.append(r)
            elapsed = time.time() - t0

            # Across-batch statistics
            medians = [b[focus]['median'] for b in batch_results]
            p5s = [b[focus]['p5'] for b in batch_results]
            p95s = [b[focus]['p95'] for b in batch_results]
            war_rates = [b['_war_rate'] for b in batch_results]

            med_mean, med_sd = statistics.mean(medians), statistics.stdev(medians)
            p5_mean, p5_sd = statistics.mean(p5s), statistics.stdev(p5s)
            p95_mean, p95_sd = statistics.mean(p95s), statistics.stdev(p95s)
            war_mean, war_sd = statistics.mean(war_rates), statistics.stdev(war_rates)

            print(f'│ {n:>5d}  {med_mean:>5.1f} (±{med_sd:>4.2f})  '
                  f'{p5_mean:>5.1f} (±{p5_sd:>4.2f})  '
                  f'{p95_mean:>5.1f} (±{p95_sd:>4.2f})  '
                  f'{war_mean:>5.1f} (±{war_sd:>4.2f})  {elapsed:>6.1f}s')

        print('└─')

    # Recommendations
    print('\n' + '=' * 100)
    print('RULE OF THUMB (Monte Carlo theory):')
    print('  · SE_median ≈ 1.25 × σ / √N   (Sheather & Marron 1990)')
    print('  · SE_p5 ≈ 2-3× SE_median       (tail percentiles need more samples)')
    print('  · SE_proportion ≈ √(p(1-p)/N)  (rare events need most samples)')
    print()
    print('PRACTICAL TARGETS at SD ≤ 0.5 yr for life-expectancy median:')
    print('  · σ_population ≈ 2.5 yrs (typical bloc spread)')
    print('  · Need N such that 1.25 × 2.5 / √N ≤ 0.5')
    print('  · Solve: N ≥ (1.25 × 2.5 / 0.5)² = 39')
    print('  · So N=200 already gives SD ≈ 0.22 yrs (4× headroom)')
    print()
    print('  · For p5/p95 (tail) at SD ≤ 1 yr: N ≈ 500-1000')
    print('  · For rare resolution proportions (e.g., 5% breakdown): need N ≥ 1000')
    print('=' * 100)


if __name__ == '__main__':
    main()
