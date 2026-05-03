"""LIFELINES v0.5 — four-bloc simulation prototype.

Adds the Mosaic bloc (Africa + Middle East + adjacent developing regions).
Geographic mapping:
  OM     = Americas (USA-led)
  SC     = Europe (EU + UK + Nordic)
  DO     = China-Russia bloc
  Mosaic = Africa + ME + South Asia (the resource-rich periphery)

Mosaic-specific dynamics:
  - Low starting capability, low starting median income
  - Massive minerals + solar/wind endowment
  - Weak chip manufacturing (chip endowment 0.4)
  - Food security as a mortality driver
  - Capital inflows mostly extractive (smaller multiplier on income)
  - Higher coercion vulnerability
  - Variable political responsiveness across the bloc
"""

import math
import random
import statistics

# ─── Bloc presets ─────────────────────────────────────────────────
OPEN_MARKET = {
    'aiGrowth': 60, 'robotGrowth': 50, 'capitalTax': 28, 'wealthTax': 5,
    'ubiLevel': 18, 'energyDist': 35, 'laborProt': 50, 'retraining': 35,
    'alignment': 45, 'politicalResp': 55,
}
SOCIAL_COMPACT = {
    'aiGrowth': 60, 'robotGrowth': 50, 'capitalTax': 55, 'wealthTax': 30,
    'ubiLevel': 50, 'energyDist': 70, 'laborProt': 75, 'retraining': 70,
    'alignment': 65, 'politicalResp': 75,
}
DIRECTED_ORDER = {
    'aiGrowth': 60, 'robotGrowth': 50, 'capitalTax': 35, 'wealthTax': 10,
    'ubiLevel': 25, 'energyDist': 20, 'laborProt': 40, 'retraining': 55,
    'alignment': 45, 'politicalResp': 20,
}
MOSAIC = {
    'aiGrowth': 40, 'robotGrowth': 30, 'capitalTax': 25, 'wealthTax': 5,
    'ubiLevel': 10, 'energyDist': 35, 'laborProt': 30, 'retraining': 30,
    'alignment': 30, 'politicalResp': 35,
}

ENDOWMENTS = {
    # infrastructure: structural development level (capital per worker, roads, healthcare,
    # education, grid). Multiplies labor income — keeps Mosaic structurally below developed blocs.
    'OM':     {'energy': 1.0, 'chips': 1.2, 'minerals': 0.7, 'agriculture': 1.1, 'infrastructure': 1.00},
    'SC':     {'energy': 1.1, 'chips': 0.8, 'minerals': 0.6, 'agriculture': 0.9, 'infrastructure': 1.05},
    'DO':     {'energy': 0.9, 'chips': 1.0, 'minerals': 1.4, 'agriculture': 1.0, 'infrastructure': 0.85},
    'Mosaic': {'energy': 1.4, 'chips': 0.4, 'minerals': 1.8, 'agriculture': 0.8, 'infrastructure': 0.72},
}

# Initial conditions per bloc — Mosaic starts substantially behind
INITIAL_CONDITIONS = {
    'OM':     {'aiCap': 0.10, 'robotCap': 0.04, 'medianIncome': 1.00, 'unemployment': 0.05,
               'gini': 0.40, 'polStability': 0.70, 'capitalConc': 0.45},
    'SC':     {'aiCap': 0.10, 'robotCap': 0.04, 'medianIncome': 1.05, 'unemployment': 0.05,
               'gini': 0.30, 'polStability': 0.75, 'capitalConc': 0.42},
    'DO':     {'aiCap': 0.10, 'robotCap': 0.04, 'medianIncome': 0.85, 'unemployment': 0.05,
               'gini': 0.45, 'polStability': 0.65, 'capitalConc': 0.55},
    'Mosaic': {'aiCap': 0.05, 'robotCap': 0.02, 'medianIncome': 0.55, 'unemployment': 0.08,
               'gini': 0.50, 'polStability': 0.55, 'capitalConc': 0.65},
}

REGIME_NAMES = {
    'OM': 'Open Market (Americas)',
    'SC': 'Social Compact (Europe)',
    'DO': 'Directed Order (China-Russia)',
    'Mosaic': 'Mosaic (Africa + ME + S.Asia)',
}
KEYS = ['OM', 'SC', 'DO', 'Mosaic']


def stat_credibility_penalty(n):
    return max(0, 0.30 - n['politicalResp']) * 0.008


def init_bloc(key, rules, rng):
    n = {k: v / 100 for k, v in rules.items()}
    ic = INITIAL_CONDITIONS[key]
    return {
        'key': key, 'rules': rules, 'n': n, 'endowments': ENDOWMENTS[key],
        'aiCap': ic['aiCap'] + (rng.random() - 0.5) * 0.04,
        'robotCap': ic['robotCap'] + (rng.random() - 0.5) * 0.02,
        'unemployment': ic['unemployment'] + (rng.random() - 0.5) * 0.02,
        'medianIncome': ic['medianIncome'] + (rng.random() - 0.5) * 0.10,
        'gini': ic['gini'] + (rng.random() - 0.5) * 0.06,
        'polStability': ic['polStability'] + (rng.random() - 0.5) * 0.10,
        'capitalConc': ic['capitalConc'] + (rng.random() - 0.5) * 0.06,
        'crisisScar': 0.0, 'institutionalCapacity': 1.0,
        'cumulativeMortality': 0.0,
        'history': [],
    }


def step_bloc(j, t, rng, ext, ai_shock_active=True):
    n = j['n']
    AI_CEILING = 4.0 * j['endowments']['energy']
    ROBOT_CEILING = 3.0 * j['endowments']['chips']

    if ai_shock_active:
        ai_r = n['aiGrowth'] * 0.06 * (1 - 0.5 * n['alignment'])
        robot_r = n['robotGrowth'] * 0.04 * (1 - 0.5 * n['alignment'])
        j['aiCap'] += j['aiCap'] * ai_r * (1 - j['aiCap'] / AI_CEILING) * (1 + 0.5 * (rng.random() - 0.5))
        j['robotCap'] += j['robotCap'] * robot_r * (1 - j['robotCap'] / ROBOT_CEILING) * (1 + 0.5 * (rng.random() - 0.5))
        j['aiCap'] += ext.get('aiCap_boost', 0)
        j['robotCap'] += ext.get('robotCap_boost', 0)
        j['aiCap'] = min(AI_CEILING, j['aiCap'])
        j['robotCap'] = min(ROBOT_CEILING, j['robotCap'])

        if rng.random() < 0.04:
            jump = 0.25 + rng.random() * 0.45
            j['aiCap'] = min(AI_CEILING, j['aiCap'] * (1 + jump))
        if rng.random() < 0.025 and t > 20:
            jump = 0.20 + rng.random() * 0.35
            j['robotCap'] = min(ROBOT_CEILING, j['robotCap'] * (1 + jump))

    total_cap = j['aiCap'] + j['robotCap']

    macro_shock = 0
    if rng.random() < 0.030:
        macro_shock = 0.10 + rng.random() * 0.25
    macro_shock += ext.get('shock_modifier', 0)

    # Food security shocks: hit Mosaic harder due to low agriculture endowment
    food_vuln = max(0, 0.85 - j['endowments']['agriculture']) * 0.5
    if rng.random() < (0.015 + food_vuln * 0.04):
        food_shock = 0.05 + rng.random() * 0.15
        macro_shock += food_shock

    share_to_society = ((1 - j['capitalConc'] * 0.7) * (0.3 + 0.7 * n['alignment']) * j['institutionalCapacity'])
    medical_dividend = total_cap * 0.30 * share_to_society
    productivity_dividend = total_cap * 0.40 * share_to_society

    capability_pressure = math.tanh(total_cap / 2.5)
    raw_displacement = capability_pressure * 0.55
    retraining_mit = n['retraining'] * 0.30
    labor_mit = n['laborProt'] * 0.10
    capital_flow_effect = -ext.get('capital_flow', 0) * 0.08
    target_unemp = max(0.03, raw_displacement - retraining_mit - labor_mit
                       + capital_flow_effect + (rng.random() - 0.5) * 0.06)
    j['unemployment'] = 0.65 * j['unemployment'] + 0.35 * target_unemp + macro_shock * 0.30
    j['unemployment'] = max(0.02, min(0.55, j['unemployment']))

    base_conc = 0.45 + 0.35 * capability_pressure
    tax_force = n['capitalTax'] * 0.5 + n['wealthTax'] * 0.4
    dist_force = n['energyDist'] * 0.4
    political_force = n['politicalResp'] * 0.2 + n['laborProt'] * 0.15
    capture_penalty = max(0, j['capitalConc'] - 0.7) * 1.5
    eff_redist = max(0, tax_force + dist_force + political_force - capture_penalty)
    redist_capacity = math.tanh(eff_redist * 1.0)
    target_conc = base_conc * (1 - 0.65 * redist_capacity)
    target_conc = max(0.15, min(0.95, target_conc))
    j['capitalConc'] = 0.78 * j['capitalConc'] + 0.22 * target_conc + (rng.random() - 0.5) * 0.025
    j['capitalConc'] = max(0.10, min(0.97, j['capitalConc']))

    # Income — Mosaic has lower benefit from capital inflows (extraction premise)
    extraction_factor = 0.05 if j['key'] != 'Mosaic' else 0.015
    infra = j['endowments'].get('infrastructure', 1.0)
    labor_income = (1 - j['unemployment']) * infra * (1 + productivity_dividend * 0.4)
    tax_revenue = (j['aiCap'] * n['capitalTax'] * 0.4
                   + j['robotCap'] * n['capitalTax'] * 0.3
                   + j['capitalConc'] * n['wealthTax'] * 0.5)
    ubi_target = n['ubiLevel'] * 0.6
    ubi_payout = min(ubi_target, tax_revenue * 1.2 + 0.05)
    extraction = j['capitalConc'] * 0.5 * (1 - n['capitalTax'] * 0.6) * (1 - n['wealthTax'] * 0.5)
    capital_inflow_bonus = max(0, ext.get('capital_flow', 0)) * extraction_factor
    target_income = labor_income + ubi_payout - extraction + capital_inflow_bonus
    target_income = max(0.15, target_income)
    j['medianIncome'] = 0.75 * j['medianIncome'] + 0.25 * target_income - macro_shock * 0.15
    j['medianIncome'] = max(0.10, min(3.5, j['medianIncome']))

    target_gini = (0.30 + j['capitalConc'] * 0.45
                   - n['capitalTax'] * 0.12 - n['ubiLevel'] * 0.18
                   - n['energyDist'] * 0.08 - n['wealthTax'] * 0.10)
    target_gini = max(0.18, min(0.85, target_gini))
    j['gini'] = 0.78 * j['gini'] + 0.22 * target_gini + (rng.random() - 0.5) * 0.012

    stress = (j['unemployment'] * 0.4
              + max(0, j['gini'] - 0.40) * 0.55
              + max(0, 0.75 - j['medianIncome']) * 0.5
              + max(0, j['capitalConc'] - 0.70) * 0.4
              + macro_shock * 0.6
              + j['crisisScar'] * 0.3)
    response = (n['politicalResp'] * 0.5 + n['energyDist'] * 0.15) * j['institutionalCapacity']
    response = math.tanh(response * 1.5) * 0.6
    target_stability = max(0, min(1, 1 - stress + response))
    bistable_pull = 0
    if j['polStability'] < 0.30:
        bistable_pull = -0.04 * math.sqrt(0.30 - j['polStability'])
    elif j['polStability'] > 0.65:
        bistable_pull = 0.02 * math.sqrt(j['polStability'] - 0.65)
    j['polStability'] = 0.70 * j['polStability'] + 0.30 * target_stability + bistable_pull + (rng.random() - 0.5) * 0.04
    j['polStability'] = max(0, min(1, j['polStability']))

    if j['polStability'] < 0.40 and rng.random() < 0.10:
        sev = 0.5 + rng.random() * 0.30
        j['polStability'] *= sev
        j['crisisScar'] += 0.10
    if rng.random() < 0.008:
        j['polStability'] *= 0.4 + rng.random() * 0.3
        j['unemployment'] = min(0.55, j['unemployment'] + 0.10)
        j['crisisScar'] += 0.20

    j['crisisScar'] *= 0.985
    if j['polStability'] < 0.40:
        j['institutionalCapacity'] *= 0.99
    elif j['polStability'] > 0.60 and j['institutionalCapacity'] < 1.0:
        j['institutionalCapacity'] = min(1.0, j['institutionalCapacity'] * 1.005)
    j['institutionalCapacity'] = max(0.3, j['institutionalCapacity'])

    # War effects
    war_mortality = 0
    war_target = ext.get('warAsTarget')
    war_aggressor = ext.get('warAsAggressor')
    if war_target:
        w = war_target
        j['polStability'] *= (1 - w['intensity'] * 0.55)
        j['medianIncome'] *= (1 - w['intensity'] * 0.30)
        j['aiCap'] *= (1 - w['intensity'] * 0.22)
        j['robotCap'] *= (1 - w['intensity'] * 0.22)
        j['institutionalCapacity'] *= (1 - w['intensity'] * 0.15)
        j['crisisScar'] += w['intensity'] * 0.45
        war_mortality = w['intensity'] * 0.045
        j['unemployment'] = min(0.55, j['unemployment'] + w['intensity'] * 0.15)
        if 'wars_as_target' not in j: j['wars_as_target'] = []
        j['wars_as_target'].append((t, w['aggressor'], w['intensity']))
    if war_aggressor:
        w = war_aggressor
        j['polStability'] *= (1 - w['intensity'] * 0.10)
        j['aiCap'] *= (1 - w['intensity'] * 0.05)
        j['medianIncome'] *= (1 + w['intensity'] * 0.08)
        j['capitalConc'] = min(0.97, j['capitalConc'] + w['intensity'] * 0.06)
        j['crisisScar'] += w['intensity'] * 0.10
        war_mortality = w['intensity'] * 0.010
        if 'wars_as_aggressor' not in j: j['wars_as_aggressor'] = []
        j['wars_as_aggressor'].append((t, w['target'], w['intensity']))

    j['polStability'] = max(0, j['polStability'])
    j['medianIncome'] = max(0.10, j['medianIncome'])
    j['aiCap'] = max(0.01, j['aiCap'])
    j['robotCap'] = max(0.01, j['robotCap'])
    j['institutionalCapacity'] = max(0.3, j['institutionalCapacity'])

    base_death = 0.0125
    medical_offset = -min(0.004, medical_dividend * 0.0015)
    poverty_death = max(0, 0.65 - j['medianIncome']) * 0.012
    despair_death = j['unemployment'] * max(0, 1 - n['ubiLevel'] * 0.95) * 0.006
    violence_death = max(0, 1 - j['polStability']) * 0.013
    env_death = (1 - n['energyDist']) * max(0, 0.5 - n['alignment']) * 0.010
    alignment_fail = max(0, total_cap - 1.5) * max(0, 0.4 - n['alignment']) * 0.012

    # Food insecurity (Mosaic-relevant) — low income + low agriculture endowment
    food_insec = (max(0, 0.65 - j['medianIncome'])
                  * max(0, 1.2 - j['endowments']['agriculture'])
                  * 0.012)

    unreported = stat_credibility_penalty(n)

    raw_drivers = poverty_death + despair_death + violence_death + env_death + alignment_fail + food_insec
    capped_drivers = 0.027 * (1 - math.exp(-raw_drivers / 0.027))

    mort_rate = max(0.005, base_death + medical_offset + capped_drivers + unreported + war_mortality)
    j['cumulativeMortality'] += mort_rate

    j['history'].append({
        'turn': t, 'aiCap': j['aiCap'], 'robotCap': j['robotCap'],
        'unemployment': j['unemployment'], 'medianIncome': j['medianIncome'],
        'gini': j['gini'], 'polStability': j['polStability'],
        'capitalConc': j['capitalConc'], 'mortRate': mort_rate,
        'food_death': food_insec,
    })


def compute_interactions(blocs, t, rng):
    inputs = {k: {'capital_flow': 0, 'talent_flow': 0,
                  'aiCap_boost': 0, 'robotCap_boost': 0,
                  'shock_modifier': 0} for k in blocs}
    keys = list(blocs.keys())

    # Capital flow
    for src in keys:
        for dst in keys:
            if src == dst: continue
            jSrc = blocs[src]; jDst = blocs[dst]
            tax_diff = jSrc['n']['capitalTax'] - jDst['n']['capitalTax']
            wealth_diff = jSrc['n']['wealthTax'] - jDst['n']['wealthTax']
            if tax_diff + wealth_diff <= 0: continue
            openness_src = 0.3 + 0.7 * jSrc['n']['energyDist']
            openness_dst = 0.3 + 0.7 * jDst['n']['energyDist']
            stab_factor = (1 - jSrc['polStability']) * 0.5 + 0.5
            # Resource attraction: capital also flows to high-mineral blocs (extraction motive)
            resource_pull = 1.0 + max(0, jDst['endowments']['minerals'] - 1.0) * 0.4
            flow = (tax_diff * 0.4 + wealth_diff * 0.3) * 0.04 * openness_src * openness_dst * stab_factor * resource_pull
            flow *= jSrc['aiCap'] / max(0.5, jDst['aiCap'])
            flow = max(0, min(0.05, flow))
            inputs[src]['capital_flow'] -= flow
            inputs[dst]['capital_flow'] += flow

    # Talent migration — MUCH stronger from Mosaic to anywhere developed (brain drain)
    for src in keys:
        for dst in keys:
            if src == dst: continue
            jSrc = blocs[src]; jDst = blocs[dst]
            push = (max(0, 0.8 - jSrc['medianIncome']) * 0.4
                    + max(0, jSrc['unemployment'] - 0.10) * 0.5
                    + max(0, 0.7 - jSrc['polStability']) * 0.6)
            pull = (max(0, jDst['medianIncome'] - 0.8) * 0.3
                    + max(0, 0.6 - jDst['unemployment']) * 0.2
                    + max(0, jDst['polStability'] - 0.5) * 0.4)
            friction = 1 - jSrc['n']['politicalResp'] * 0.5
            reception = max(0.1, min(1.0, 1 - max(0, jDst['unemployment'] - 0.20) * 2))
            flow = push * pull * 0.003 * (1 - friction * 0.5) * reception
            flow = max(0, min(0.02, flow))
            inputs[src]['talent_flow'] -= flow
            inputs[dst]['talent_flow'] += flow

    # Capability spillover
    for src in keys:
        for dst in keys:
            if src == dst: continue
            jSrc = blocs[src]; jDst = blocs[dst]
            cap_diff_ai = max(0, jSrc['aiCap'] - jDst['aiCap'])
            cap_diff_robot = max(0, jSrc['robotCap'] - jDst['robotCap'])
            leakage = (1 - jSrc['n']['alignment'] * 0.3) * 0.005
            absorption = 0.5 + jDst['n']['retraining'] * 0.5
            inputs[dst]['aiCap_boost'] += cap_diff_ai * leakage * absorption
            inputs[dst]['robotCap_boost'] += cap_diff_robot * leakage * absorption

    # Coercion — same logic, but with 4 blocs more pairs and Mosaic is most-vulnerable
    if rng.random() < 0.03 and t > 20:
        pairs = [(a, b) for a in keys for b in keys if a < b]
        gaps = [(abs(blocs[a]['aiCap'] - blocs[b]['aiCap']), a, b) for a, b in pairs]
        gaps.sort(reverse=True)
        if gaps[0][0] > 0.4:
            _, a, b = gaps[0]
            agg_score = lambda j: j['aiCap'] * (1 - j['n']['alignment'])
            aggressor, target = (a, b) if agg_score(blocs[a]) > agg_score(blocs[b]) else (b, a)
            target_damage = 0.10 + rng.random() * 0.15
            agg_cost = 0.03 + rng.random() * 0.05
            inputs[target]['shock_modifier'] += target_damage
            inputs[aggressor]['shock_modifier'] += agg_cost

    # War — capability + chips + low-alignment + low-political-responsiveness
    inputs_war = {k: {'as_target': None, 'as_aggressor': None} for k in keys}
    if t > 15:
        best_prob = 0
        best_pair = None
        best_intensity_cap = 0
        for src in keys:
            for dst in keys:
                if src == dst: continue
                jSrc = blocs[src]; jDst = blocs[dst]
                aggression = (jSrc['aiCap']
                              * (1 - jSrc['n']['alignment'])
                              * (1 - jSrc['n']['politicalResp'])
                              * jSrc['endowments']['chips']
                              * jSrc['institutionalCapacity']
                              * 0.15)
                cap_gap = max(0, 1 - jDst['aiCap'] / max(0.5, jSrc['aiCap']))
                target_vuln = (cap_gap * 0.5
                               + max(0, 0.6 - jDst['polStability']) * 0.4
                               + max(0, jDst['endowments']['minerals'] - 0.8) * 0.3)
                war_prob = aggression * target_vuln * 0.04
                if war_prob > best_prob:
                    best_prob = war_prob
                    best_pair = (src, dst)
                    best_intensity_cap = min(1.0, aggression * 1.5 + cap_gap)
        if best_pair and rng.random() < best_prob:
            src, dst = best_pair
            intensity = (0.4 + rng.random() * 0.5) * best_intensity_cap
            inputs_war[dst]['as_target'] = {'intensity': intensity, 'aggressor': src}
            inputs_war[src]['as_aggressor'] = {'intensity': intensity, 'target': dst}
    for k in keys:
        inputs[k]['warAsTarget'] = inputs_war[k]['as_target']
        inputs[k]['warAsAggressor'] = inputs_war[k]['as_aggressor']

    return inputs


def run_world(rule_overrides=None, seed=42, num_turns=150, ai_shock_active=True):
    rng = random.Random(seed)
    rules = {
        'OM': {**OPEN_MARKET, **(rule_overrides or {}).get('OM', {})},
        'SC': {**SOCIAL_COMPACT, **(rule_overrides or {}).get('SC', {})},
        'DO': {**DIRECTED_ORDER, **(rule_overrides or {}).get('DO', {})},
        'Mosaic': {**MOSAIC, **(rule_overrides or {}).get('Mosaic', {})},
    }
    blocs = {k: init_bloc(k, rules[k], rng) for k in rules}
    for t in range(1, num_turns + 1):
        inputs = compute_interactions(blocs, t, rng)
        for k in blocs:
            step_bloc(blocs[k], t, rng, inputs[k], ai_shock_active=ai_shock_active)

    outcomes = {}
    for k, j in blocs.items():
        avg_mort = j['cumulativeMortality'] / num_turns
        life_exp = max(28, min(90, 1 / avg_mort))
        last30 = j['history'][-30:]
        outcomes[k] = {
            'lifeExpectancy': life_exp,
            'avgGini': sum(h['gini'] for h in last30) / 30,
            'avgUnemp': sum(h['unemployment'] for h in last30) / 30,
            'avgIncome': sum(h['medianIncome'] for h in last30) / 30,
            'avgStab': sum(h['polStability'] for h in last30) / 30,
            'avgConc': sum(h['capitalConc'] for h in last30) / 30,
            'finalAiCap': j['history'][-1]['aiCap'],
        }
    return {'outcomes': outcomes}


def run_world_batch(n=50, rule_overrides=None, seed_base=1000, ai_shock_active=True):
    return [run_world(rule_overrides, seed_base + i * 7919, ai_shock_active=ai_shock_active) for i in range(n)]


def summarize_batch(results, label=''):
    if label:
        print(f"\n{label}")
    print(f"  {'Bloc':<32} {'Med LE':>7} {'StDev':>6} {'Range':>13} {'Gini':>6} {'Unemp':>6} {'Income':>7} {'Stab':>6} {'AICap':>6}")
    print('  ' + '─' * 105)
    for k in KEYS:
        lifes = [r['outcomes'][k]['lifeExpectancy'] for r in results]
        ginis = [r['outcomes'][k]['avgGini'] for r in results]
        unemps = [r['outcomes'][k]['avgUnemp'] for r in results]
        incomes = [r['outcomes'][k]['avgIncome'] for r in results]
        stabs = [r['outcomes'][k]['avgStab'] for r in results]
        aicaps = [r['outcomes'][k]['finalAiCap'] for r in results]
        print(f"  {REGIME_NAMES[k]:<32} "
              f"{statistics.median(lifes):>7.1f} "
              f"{statistics.stdev(lifes):>6.1f} "
              f"{min(lifes):>5.1f}─{max(lifes):>5.1f}  "
              f"{statistics.mean(ginis):>6.3f} "
              f"{statistics.mean(unemps):>6.3f} "
              f"{statistics.mean(incomes):>7.3f} "
              f"{statistics.mean(stabs):>6.3f} "
              f"{statistics.mean(aicaps):>6.2f}")


if __name__ == '__main__':
    print("=" * 110)
    print("LIFELINES v0.5 — four-bloc simulation, N=50")
    print("=" * 110)

    print("\nReal-world baseline targets:")
    print("  USA ~78  ·  Nordic ~83  ·  China-system ~71-76  ·  sub-Saharan Africa ~62-66")
    summarize_batch(run_world_batch(50, ai_shock_active=False),
        '┌─ BASELINE (no AI shock) ──────────────────────────────────────────────────────────────────────────')

    summarize_batch(run_world_batch(50, ai_shock_active=True),
        '┌─ DEFAULT (AI shock active) ──────────────────────────────────────────────────────────────────────')

    summarize_batch(run_world_batch(50, rule_overrides={
        'Mosaic': {'capitalTax': 50, 'retraining': 70, 'energyDist': 70, 'politicalResp': 60, 'alignment': 55}
    }), '┌─ COUNTERFACTUAL: Mosaic builds capacity (Africa develops with rents from extraction) ───────────')

    summarize_batch(run_world_batch(50, rule_overrides={
        'OM': {'capitalTax': 45, 'laborProt': 70, 'alignment': 60, 'ubiLevel': 35, 'retraining': 60}
    }), '┌─ COUNTERFACTUAL: Americas adopt EU-style protections ───────────────────────────────────────────')

    summarize_batch(run_world_batch(50, rule_overrides={
        'DO': {'politicalResp': 55, 'energyDist': 45}
    }), '┌─ COUNTERFACTUAL: China-Russia bloc opens politically ───────────────────────────────────────────')
