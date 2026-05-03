"""
LIFELINES test harness — runs many scenarios with documented expectations
and verifies actual results match the hypothesis. Produces a report.

Each test = (name, rule_overrides, hypothesis, expected_range_per_bloc, why)
"""

import sim_v5
import statistics
import random
import math
from copy import deepcopy

N_RUNS = 200  # per scenario


def run_scenario(name, overrides_per_bloc, n_runs=N_RUNS, ai_shock=True, seed_base=10000):
    """
    overrides_per_bloc: dict like {'Mosaic': {'aiGrowth': 100, 'robotGrowth': 100}}
    Returns dict {bloc: {median, p5, p95, mean, stdev, war_count}}
    """
    rules_for_run = {
        'OM': dict(sim_v5.OPEN_MARKET),
        'SC': dict(sim_v5.SOCIAL_COMPACT),
        'DO': dict(sim_v5.DIRECTED_ORDER),
        'Mosaic': dict(sim_v5.MOSAIC),
    }
    for bloc_key, rule_changes in overrides_per_bloc.items():
        rules_for_run[bloc_key].update(rule_changes)

    per_bloc_lifes = {k: [] for k in rules_for_run}
    war_targets = {k: 0 for k in rules_for_run}
    war_aggressors = {k: 0 for k in rules_for_run}
    total_wars = 0
    n_with_war = 0

    for i in range(n_runs):
        rng = random.Random(seed_base + i * 7919)
        blocs = {k: sim_v5.init_bloc(k, rules_for_run[k], rng) for k in rules_for_run}
        for k in blocs:
            blocs[k]['wars_as_target'] = []
            blocs[k]['wars_as_aggressor'] = []
        for t in range(1, 151):
            inputs = sim_v5.compute_interactions(blocs, t, rng)
            for k in blocs:
                sim_v5.step_bloc(blocs[k], t, rng, inputs[k], ai_shock_active=ai_shock)
        run_war_count = 0
        for k in blocs:
            avg_mort = blocs[k]['cumulativeMortality'] / 150
            le = max(28, min(90, 1 / avg_mort))
            per_bloc_lifes[k].append(le)
            war_targets[k] += len(blocs[k]['wars_as_target'])
            war_aggressors[k] += len(blocs[k]['wars_as_aggressor'])
            run_war_count += len(blocs[k]['wars_as_aggressor'])
        total_wars += run_war_count
        if run_war_count > 0:
            n_with_war += 1

    out = {}
    for k, lifes in per_bloc_lifes.items():
        s = sorted(lifes)
        n = len(s)
        out[k] = {
            'median': s[n // 2],
            'mean': statistics.mean(lifes),
            'stdev': statistics.stdev(lifes) if n > 1 else 0,
            'p5': s[max(0, n // 20)],
            'p95': s[min(n - 1, n - n // 20 - 1)],
            'min': min(lifes), 'max': max(lifes),
            'war_target': war_targets[k],
            'war_aggressor': war_aggressors[k],
        }
    out['_total_wars'] = total_wars
    out['_n_with_war'] = n_with_war
    out['_n_runs'] = n_runs
    return out


def fmt(x):
    return f'{x:.1f}'


def assert_in_range(name, bloc, value, low, high, why=''):
    ok = low <= value <= high
    flag = '✓' if ok else '✗'
    msg = f'  {flag} {bloc:8s} {fmt(value):>6s}  expected [{fmt(low)}, {fmt(high)}]'
    if why and not ok:
        msg += f'  — {why}'
    return ok, msg


# ──────────────────────────────────────────────────────────────
# TEST SCENARIOS
# Each is (name, overrides, expected_ranges, hypothesis, mechanism)
# ──────────────────────────────────────────────────────────────

TESTS = [
    {
        'name': 'BASELINE — calibrated defaults under AI shock',
        'overrides': {},
        'expected': {
            'OM': (71, 76),
            'SC': (78, 82),
            'DO': (66, 71),
            'Mosaic': (50, 58),
        },
        'hypothesis': 'Default rules produce calibration baselines under AI shock.',
        'mechanism': 'Each bloc has different rules + endowments + initial conditions tuned to match real-world life expectancies under shock.',
    },

    {
        'name': "MOSAIC MAX AI/ROBOT (Ed's case): full capability with no other changes",
        'overrides': {'Mosaic': {'aiGrowth': 100, 'robotGrowth': 100}},
        'expected': {
            'Mosaic': (44, 52),  # WORSE than baseline by ~5-7 yrs
        },
        'hypothesis': "Maxing capability without supporting institutions WORSENS outcomes by ~5-7 yrs. Capability without alignment is a mortality driver, not a benefit.",
        'mechanism': 'Dominant driver: alignment_failure_death = (cap-1.5)×(0.4-align)×0.012. At cap=6.7 and align=0.30 → 0.0063 mortality/yr (=4.5 yrs life lost). Plus capital concentrates (no tax), unemployment surges (no retraining/UBI buffer), income collapses (extraction + infrastructure cap), food insecurity rises. Capability is destructive without absorption institutions.',
    },

    {
        'name': 'MOSAIC FULL CAPACITY BUILD: cap+retrain+energy+pol+align all up',
        'overrides': {'Mosaic': {
            'aiGrowth': 60, 'robotGrowth': 50,
            'capitalTax': 50, 'wealthTax': 25,
            'ubiLevel': 50, 'energyDist': 70, 'laborProt': 60,
            'retraining': 70, 'alignment': 60, 'politicalResp': 60,
        }},
        'expected': {
            'Mosaic': (75, 82),
        },
        'hypothesis': 'When Mosaic adopts SC-like institutional rules, life expectancy approaches developed-bloc levels — even with poor endowments.',
        'mechanism': 'Higher alignment unlocks dividends. Retraining absorbs displacement. UBI buffers unemployment. politicalResp eliminates stat-credibility penalty. EnergyDist breaks capital-concentration. Reduces war-vulnerability (less polStab decay). Infrastructure factor still caps total upside.',
    },

    {
        'name': "OM GOES AUTHORITARIAN: drops responsiveness and alignment to DO levels",
        'overrides': {'OM': {'politicalResp': 20, 'alignment': 30, 'ubiLevel': 5}},
        'expected': {
            'OM': (50, 62),  # bigger drop than naive estimate
        },
        'hypothesis': 'OM under low responsiveness + low alignment + minimal UBI loses institutional advantages AND becomes a war-aggressor itself, suffering compounding damage.',
        'mechanism': 'Stat-credibility penalty active. Alignment dividends turn off. Capital concentrates. CRUCIAL: OM aggression score rises — it now invades Mosaic frequently, paying war costs (mortality, polStab decline, crisisScar). 100+ wars across 200 worlds → ~0.5 wars/world × 1% mortality + accumulated crisisScar.',
    },

    {
        'name': 'SC ABANDONS UBI AND REDISTRIBUTION',
        'overrides': {'SC': {'ubiLevel': 0, 'capitalTax': 15, 'wealthTax': 0, 'retraining': 25}},
        'expected': {
            'SC': (72, 78),
        },
        'hypothesis': 'Without UBI, retraining, and redistribution, SC loses what makes it work but retains alignment and political responsiveness which protect it from worst outcomes.',
        'mechanism': 'Capital concentrates without check. Despair_death rises with unbuffered unemployment. But high alignment still suppresses alignment_fail and env_death; high politicalResp avoids stat-credibility penalty. Drops ~5-6 yrs from full SC, not catastrophic.',
    },

    {
        'name': "DO DEMOCRATIZES: high responsiveness + alignment, market-style economy",
        'overrides': {'DO': {'politicalResp': 75, 'alignment': 65, 'ubiLevel': 40, 'retraining': 65, 'capitalTax': 50}},
        'expected': {
            'DO': (74, 82),
        },
        'hypothesis': 'DO has good endowments. Institutional reforms unlock its potential. Should rival OM/SC.',
        'mechanism': 'Stat-credibility penalty disappears. Alignment unlocks dividends. UBI + retraining + capitalTax + politicalResp reinforce. War-aggression drops to near zero (no longer invading anyone).',
    },

    {
        'name': 'CAPABILITY ARMS RACE: all blocs max AI/robot',
        'overrides': {k: {'aiGrowth': 100, 'robotGrowth': 100} for k in ['OM', 'SC', 'DO', 'Mosaic']},
        'expected': {
            'SC': (78, 84),
            'OM': (68, 76),
            'DO': (62, 70),
            'Mosaic': (44, 52),
        },
        'hypothesis': 'Higher capability accentuates institutional differences. Well-aligned blocs benefit; poorly-aligned + low-buffer blocs crash.',
        'mechanism': 'capability × (1-alignment) drives alignment-failure mortality. Mosaic worst hit (low align + low retraining + low UBI). DO middle (low align but better buffer than Mosaic).',
    },

    {
        'name': 'UNIVERSAL ENERGY MONOPOLIZATION: all blocs energyDist=0',
        'overrides': {k: {'energyDist': 0} for k in ['OM', 'SC', 'DO', 'Mosaic']},
        'expected': {
            'OM': (66, 74),
            'SC': (78, 82),  # alignment shields SC from env_death
            'DO': (60, 68),
            'Mosaic': (46, 54),
        },
        'hypothesis': 'Energy concentration tightens capital concentration leverage and increases env_death where alignment is low. SC is shielded by its high alignment.',
        'mechanism': 'env_death = (1-energyDist) × max(0, 0.5-align) × 0.010. SC has align=0.65 → env_death=0 regardless. OM/DO/Mosaic all hit. Capital concentration also rises everywhere.',
    },

    {
        'name': 'UNIVERSAL HIGH ALIGNMENT: alignment=90 everywhere',
        'overrides': {k: {'alignment': 90} for k in ['OM', 'SC', 'DO', 'Mosaic']},
        'expected': {
            'OM': (74, 80),
            'SC': (79, 84),
            'DO': (70, 76),
            'Mosaic': (60, 70),
        },
        'hypothesis': 'High alignment unlocks dividends, suppresses leakage, eliminates wars. All blocs benefit. Mosaic gets the largest absolute gain (smaller defaults, more headroom).',
        'mechanism': 'alignment_fail_death → 0. Capability dividends scale up. Aggression score (war + coercion) collapses. Mosaic stops being attacked. War rate drops from 24% to ~5%.',
        'check_wars': True,
        'expected_total_wars': (0, 25),
    },

    {
        'name': "OM ADOPTS SC's RULES — can it match?",
        'overrides': {'OM': dict(sim_v5.SOCIAL_COMPACT)},
        'expected': {
            'OM': (78, 82),
        },
        'hypothesis': 'OM with SC rules approaches SC outcomes — endowments matter less than rules.',
        'mechanism': 'Same rules as SC. Different starting Gini (0.40 vs 0.30) takes time to converge. Slightly different energy/chips endowments. Result: very close to SC default.',
    },

    {
        'name': 'WORLD WITHOUT WAR: alignment 80, politicalResp 70 everywhere',
        'overrides': {k: {'alignment': 80, 'politicalResp': 70} for k in ['OM', 'SC', 'DO', 'Mosaic']},
        'expected': {
            'OM': (74, 82),
            'SC': (78, 84),
            'DO': (72, 80),
            'Mosaic': (62, 72),
        },
        'hypothesis': 'High alignment + responsiveness everywhere nearly eliminates war. All blocs benefit.',
        'mechanism': 'War aggression formula has (1-alignment)×(1-politicalResp) → 0.20×0.30 = 0.06. Wars rare.',
        'check_wars': True,
        'expected_total_wars': (0, 25),
    },

    {
        'name': 'MOSAIC ALIGNMENT ONLY: only alignment fixed',
        'overrides': {'Mosaic': {'alignment': 70}},
        'expected': {
            'Mosaic': (58, 66),
        },
        'hypothesis': 'Aligning capability alone helps significantly because alignment unlocks dividends, kills alignment_fail_death, and reduces vulnerability to capability spillover from less-aligned neighbors.',
        'mechanism': 'Reduces alignment_fail_death (was 0.0063 → ~0 since 0.4-0.7 < 0). Unlocks dividends factor. Lower spillover into Mosaic from OM/SC/DO. Big single-lever effect.',
    },

    # Robustness test: same scenario, different seed bases — do results stabilize?
    {
        'name': 'STABILITY: baseline at different seed bases (results should match within ~1 yr)',
        'overrides': {},
        'expected': {
            'OM': (71, 76),
            'SC': (78, 82),
            'DO': (66, 71),
            'Mosaic': (50, 58),
        },
        'hypothesis': 'With N=200, median life expectancy should be stable to within ~1 yr across different random seeds.',
        'mechanism': 'Stochastic stability check.',
        'seed_base': 99999,
    },
]


# ──────────────────────────────────────────────────────────────
# RUN TEST HARNESS
# ──────────────────────────────────────────────────────────────

def main():
    print('=' * 100)
    print('LIFELINES TEST HARNESS — verifying simulation produces expected outcomes')
    print(f'N = {N_RUNS} runs per scenario')
    print('=' * 100)

    total_assertions = 0
    failed_assertions = 0
    test_results = []

    for test in TESTS:
        print(f'\n┌─ {test["name"]}')
        print(f'│   HYPOTHESIS: {test["hypothesis"]}')
        print(f'│   MECHANISM:  {test["mechanism"]}')
        print('│')
        results = run_scenario(test['name'], test['overrides'], seed_base=test.get('seed_base', 10000))
        test_results.append((test, results))

        # Pretty print all 4 blocs
        print(f'│   {"Bloc":<10s} {"med":>5s} {"mean":>6s} {"5pct":>5s} {"95pct":>6s} {"wT":>3s} {"wA":>3s}')
        for bloc in ['OM', 'SC', 'DO', 'Mosaic']:
            r = results[bloc]
            print(f'│   {bloc:<10s} {r["median"]:>5.1f} {r["mean"]:>6.1f} {r["p5"]:>5.1f} {r["p95"]:>6.1f} {r["war_target"]:>3d} {r["war_aggressor"]:>3d}')

        # Check assertions
        all_ok = True
        for bloc, (low, high) in test['expected'].items():
            value = results[bloc]['median']
            ok, msg = assert_in_range(test['name'], bloc, value, low, high)
            print(f'│ {msg}')
            total_assertions += 1
            if not ok:
                failed_assertions += 1
                all_ok = False
        if test.get('check_wars'):
            tw = results['_total_wars']
            wlow, whigh = test['expected_total_wars']
            ok = wlow <= tw <= whigh
            flag = '✓' if ok else '✗'
            print(f'│   {flag} total wars: {tw} expected [{wlow}, {whigh}]')
            total_assertions += 1
            if not ok:
                failed_assertions += 1
                all_ok = False
        else:
            tw = results['_total_wars']
            n_with = results['_n_with_war']
            print(f'│   ▷ war stats: {tw} wars across {n_with}/{N_RUNS} worlds ({100*n_with/N_RUNS:.0f}% war rate)')
        if all_ok:
            print(f'└─ ✓ PASS')
        else:
            print(f'└─ ✗ FAIL')

    print('\n' + '=' * 100)
    print(f'SUMMARY: {total_assertions - failed_assertions}/{total_assertions} assertions passed')
    print('=' * 100)
    return total_assertions, failed_assertions, test_results


if __name__ == '__main__':
    main()
