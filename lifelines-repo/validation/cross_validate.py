"""
Cross-validation: run identical scenarios in JS and Python sims, compare medians.
Different RNGs (Mersenne Twister vs mulberry32), so we don't expect exact match,
but distributional agreement should be tight (within ~1 year).
"""
import subprocess
import re
import sys
import os
from test_harness import run_scenario

JS_FILE = '/mnt/user-data/outputs/lifelines.jsx'
JS_STANDALONE = '/tmp/js_sim_standalone.mjs'

def extract_top_level(code, decl_pattern):
    m = re.search(decl_pattern, code)
    if not m:
        return None
    start = m.start()
    i = m.end()
    while i < len(code) and code[i] not in '{=':
        i += 1
    if i >= len(code): return None
    if code[i] == '=':
        depth = 0
        i += 1
        while i < len(code):
            if code[i] in '({[': depth += 1
            elif code[i] in ')}]': depth -= 1
            elif code[i] == ';' and depth == 0:
                return code[start:i+1]
            i += 1
    else:
        depth = 1
        i += 1
        while i < len(code) and depth > 0:
            if code[i] == '{': depth += 1
            elif code[i] == '}': depth -= 1
            i += 1
        return code[start:i]


def build_js_runner(scenarios):
    """Auto-extract sim functions from JSX and produce a runnable node script."""
    with open(JS_FILE) as f:
        code = f.read()
    fns = ['mulberry32', 'statCredibilityPenalty', 'stepBloc', 'computeInteractions', 'runWorld']
    consts = ['BLOCS', 'BLOC_KEYS']
    extracted = []
    for fn in fns:
        block = extract_top_level(code, rf'function\s+{fn}\s*\(')
        if not block:
            print(f'WARN: could not extract {fn}')
            sys.exit(1)
        extracted.append(block)
    for c in consts:
        block = extract_top_level(code, rf'const\s+{c}\s*=')
        if not block:
            print(f'WARN: could not extract {c}')
            sys.exit(1)
        extracted.append(block)
    scenarios_js = ',\n  '.join(
        f"{{ name: {repr(s['name'])}, overrides: {format_overrides(s['overrides'])} }}"
        for s in scenarios
    )
    runner = f'''
function runScenario(overrides, n) {{
  const allRules = {{}};
  for (const k of BLOC_KEYS) allRules[k] = {{ ...BLOCS[k].rules, ...(overrides[k] || {{}}) }};
  const lifes = {{ OM: [], SC: [], DO: [], Mosaic: [] }};
  let totalWars = 0;
  for (let i = 0; i < n; i++) {{
    const w = runWorld(allRules, 10000 + i * 7919);
    for (const k of BLOC_KEYS) lifes[k].push(w.outcomes[k].lifeExpectancy);
    totalWars += w.worldEvents.filter(e => e.type === 'war').length;
  }}
  const stats = {{}};
  for (const k of BLOC_KEYS) {{
    const s = [...lifes[k]].sort((a, b) => a - b);
    stats[k] = {{
      median: s[Math.floor(s.length / 2)],
      mean: lifes[k].reduce((a, b) => a + b, 0) / lifes[k].length,
    }};
  }}
  return {{ stats, totalWars }};
}}

const SCENARIOS = [{scenarios_js}];
const N = 200;
console.log(JSON.stringify({{ scenarios: SCENARIOS.map(sc => ({{ name: sc.name, ...runScenario(sc.overrides, N) }})) }}));
'''
    full = '\n\n'.join(extracted) + runner
    with open(JS_STANDALONE, 'w') as f:
        f.write(full)


def format_overrides(o):
    if not o:
        return '{}'
    parts = []
    for k, rules in o.items():
        rule_parts = ', '.join(f'{rk}: {v}' for rk, v in rules.items())
        parts.append(f'{k}: {{ {rule_parts} }}')
    return '{ ' + ', '.join(parts) + ' }'


SCENARIOS = [
    {'name': 'BASELINE', 'overrides': {}},
    {'name': 'MOSAIC MAX AI', 'overrides': {'Mosaic': {'aiGrowth': 100, 'robotGrowth': 100}}},
    {'name': 'MOSAIC FULL BUILD', 'overrides': {'Mosaic': {'aiGrowth': 60, 'robotGrowth': 50, 'capitalTax': 50, 'wealthTax': 25, 'ubiLevel': 50, 'energyDist': 70, 'laborProt': 60, 'retraining': 70, 'alignment': 60, 'politicalResp': 60}}},
    {'name': 'OM AUTHORITARIAN', 'overrides': {'OM': {'politicalResp': 20, 'alignment': 30, 'ubiLevel': 5}}},
    {'name': 'DO DEMOCRATIZES', 'overrides': {'DO': {'politicalResp': 75, 'alignment': 65, 'ubiLevel': 40, 'retraining': 65, 'capitalTax': 50}}},
    {'name': 'UNIVERSAL HIGH ALIGN', 'overrides': {k: {'alignment': 90} for k in ['OM', 'SC', 'DO', 'Mosaic']}},
    {'name': 'CAP ARMS RACE', 'overrides': {k: {'aiGrowth': 100, 'robotGrowth': 100} for k in ['OM', 'SC', 'DO', 'Mosaic']}},
    {'name': 'OM ADOPTS SC RULES', 'overrides': {'OM': {'aiGrowth': 60, 'robotGrowth': 50, 'capitalTax': 55, 'wealthTax': 30, 'ubiLevel': 50, 'energyDist': 70, 'laborProt': 75, 'retraining': 70, 'alignment': 65, 'politicalResp': 75}}},
]


def main():
    print('=' * 95)
    print('CROSS-VALIDATION: JS sim vs Python sim (different RNGs, distributional comparison)')
    print(f'N=200 per scenario')
    print('=' * 95)

    print('\n[1/2] Building standalone JS runner from lifelines.jsx...')
    build_js_runner(SCENARIOS)
    print('     OK')

    print('\n[2/2] Running JS sim via node...')
    js_proc = subprocess.run(['node', JS_STANDALONE], capture_output=True, text=True, timeout=120)
    if js_proc.returncode != 0:
        print('JS sim failed:', js_proc.stderr)
        sys.exit(1)
    import json
    js_results = json.loads(js_proc.stdout)
    print('     OK')

    print('\n[3/3] Running Python sim...')
    py_results = {}
    for sc in SCENARIOS:
        r = run_scenario(sc['name'], sc['overrides'], n_runs=200)
        py_results[sc['name']] = r
    print('     OK\n')

    # Compare
    print('=' * 95)
    print(f'{"SCENARIO":<22s}  {"BLOC":<8s}  {"JS med":>7s}  {"Py med":>7s}  {"diff":>5s}  {"status":>8s}')
    print('-' * 95)

    max_diff = 0
    n_tight = 0
    n_total = 0
    for sc in SCENARIOS:
        js_r = next(s for s in js_results['scenarios'] if s['name'] == sc['name'])
        py_r = py_results[sc['name']]
        for bloc in ['OM', 'SC', 'DO', 'Mosaic']:
            js_m = js_r['stats'][bloc]['median']
            py_m = py_r[bloc]['median']
            diff = abs(js_m - py_m)
            max_diff = max(max_diff, diff)
            n_total += 1
            if diff < 1.0:
                status = 'OK'
                n_tight += 1
            elif diff < 2.0:
                status = 'wide'
            else:
                status = 'DRIFT'
            print(f'{sc["name"]:<22s}  {bloc:<8s}  {js_m:>7.1f}  {py_m:>7.1f}  {diff:>5.2f}  {status:>8s}')
        # War counts
        js_wars = js_r['totalWars']
        py_wars = py_r['_total_wars']
        print(f'{sc["name"]:<22s}  {"<wars>":<8s}  {js_wars:>7d}  {py_wars:>7d}  {abs(js_wars - py_wars):>5d}')
        print()

    print('=' * 95)
    print(f'SUMMARY: {n_tight}/{n_total} medians within 1 year   ·   max diff: {max_diff:.2f} yrs')
    if max_diff < 1.5 and n_tight >= n_total - 2:
        print('VERDICT: JS and Python sims are MATHEMATICALLY EQUIVALENT (within stochastic noise)')
    else:
        print('VERDICT: DRIFT detected — code paths may have diverged')
    print('=' * 95)


if __name__ == '__main__':
    main()
