"""LIFELINES audit_sync — verify JS and Python constants are in sync.

Parses the CONSTANT_DEFS catalog from both lifelines.jsx (JS) and sim_v5.py (Py)
and compares them by key. Reports:
  - Missing keys (in JS but not Py, or vice versa)
  - Value mismatches (e.g., JS says 0.012, Py says 0.013)
  - Class disagreements (e.g., JS says Calibrated, Py says Empirical)

Exits 0 on success, 1 on any mismatch.

Both catalogs use the same dict-of-dict structure with:
  KEY: { value: <number>, group: '<name>', class: '<Empirical|Calibrated|Structural>' }

The JS version has additional metadata (label, unit, description, rationale, range)
that we don't compare here — those are documentation-only fields not used by the
simulation. Only `value`, `group`, and `class` need to match.
"""
import os
import re
import sys
import importlib.util

# ─── Paths ──────────────────────────────────────────────────────────
HERE = os.path.dirname(os.path.abspath(__file__))
PY_FILE = os.path.join(HERE, 'sim_v5.py')

# JSX lives at the root of the LIFELINES repo (one level up from validation/)
# but in the standalone working directory it might be in /mnt/user-data/outputs.
# Try both.
JS_CANDIDATES = [
    os.path.normpath(os.path.join(HERE, '..', 'src', 'lifelines.jsx')),
    os.path.normpath(os.path.join(HERE, '..', 'lifelines.jsx')),
    '/mnt/user-data/outputs/lifelines.jsx',
]
JS_FILE = next((p for p in JS_CANDIDATES if os.path.exists(p)), JS_CANDIDATES[-1])


# ─── Parse JS CONSTANT_DEFS ─────────────────────────────────────────
def parse_js_constants(path):
    """Extract CONSTANT_DEFS catalog from lifelines.jsx as a {key: {value, group, class}} dict."""
    with open(path) as f:
        code = f.read()
    # Locate `const CONSTANT_DEFS = { ... };` and extract the brace block
    m = re.search(r'const\s+CONSTANT_DEFS\s*=\s*\{', code)
    if not m:
        raise ValueError(f'Could not find `const CONSTANT_DEFS` in {path}')
    start = m.end() - 1  # at the opening `{`
    depth = 0
    i = start
    while i < len(code):
        if code[i] == '{':
            depth += 1
        elif code[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
        i += 1
    else:
        raise ValueError('Unbalanced braces in CONSTANT_DEFS')

    body = code[start + 1: end - 1]  # contents between outer braces
    # Strip line comments
    body = re.sub(r'//.*?$', '', body, flags=re.MULTILINE)

    constants = {}
    # Each entry: KEY: { value: NUM, group: '<g>', label: ..., unit: ..., class: '<c>', ... }
    # We extract value, group, class. Find each top-level key by tracking brace depth.
    i = 0
    while i < len(body):
        # Skip whitespace
        while i < len(body) and body[i] in ' \t\r\n,':
            i += 1
        # Read a key (identifier)
        km = re.match(r'([A-Z_][A-Z0-9_]*)\s*:\s*\{', body[i:])
        if not km:
            break
        key = km.group(1)
        # Locate the closing brace of this entry
        i += km.end()
        depth = 1
        entry_start = i
        while i < len(body) and depth > 0:
            if body[i] == '{':
                depth += 1
            elif body[i] == '}':
                depth -= 1
            i += 1
        entry = body[entry_start: i - 1]

        # Pull `value` (number), `group` (string), `class` (string) from the entry
        value_m = re.search(r"value:\s*(-?[0-9]*\.?[0-9]+(?:e-?\d+)?)", entry)
        group_m = re.search(r"group:\s*['\"]([a-zA-Z_]+)['\"]", entry)
        class_m = re.search(r"class:\s*['\"]([A-Za-z]+)['\"]", entry)
        if value_m and group_m and class_m:
            constants[key] = {
                'value': float(value_m.group(1)),
                'group': group_m.group(1),
                'class': class_m.group(1),
            }
        else:
            missing = []
            if not value_m: missing.append('value')
            if not group_m: missing.append('group')
            if not class_m: missing.append('class')
            print(f'  WARN: JS CONSTANT_DEFS[{key}] missing fields: {", ".join(missing)}')

    return constants


# ─── Load Python CONSTANT_DEFS via import ───────────────────────────
def load_py_constants(path):
    spec = importlib.util.spec_from_file_location('sim_v5_audit', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    raw = mod.CONSTANT_DEFS
    out = {}
    for key, defn in raw.items():
        out[key] = {
            'value': float(defn['value']),
            'group': defn['group'],
            'class': defn['class'],
        }
    return out


# ─── Comparison ─────────────────────────────────────────────────────
def main():
    print('=' * 84)
    print('LIFELINES — JS↔Python constants audit')
    print('=' * 84)
    print(f'  JS:     {JS_FILE}')
    print(f'  Python: {PY_FILE}')
    print()

    if not os.path.exists(JS_FILE):
        print(f'  ✗ JS file not found at {JS_FILE}')
        return 1
    if not os.path.exists(PY_FILE):
        print(f'  ✗ Python file not found at {PY_FILE}')
        return 1

    try:
        js_consts = parse_js_constants(JS_FILE)
    except Exception as e:
        print(f'  ✗ Failed to parse JS CONSTANT_DEFS: {e}')
        return 1
    try:
        py_consts = load_py_constants(PY_FILE)
    except Exception as e:
        print(f'  ✗ Failed to load Python CONSTANT_DEFS: {e}')
        return 1

    print(f'  JS catalog size:     {len(js_consts)} constants')
    print(f'  Python catalog size: {len(py_consts)} constants')
    print()

    issues = []

    # Missing keys
    js_only = set(js_consts) - set(py_consts)
    py_only = set(py_consts) - set(js_consts)
    for key in sorted(js_only):
        issues.append(('missing-py', key, f'in JS, missing in Python'))
    for key in sorted(py_only):
        issues.append(('missing-js', key, f'in Python, missing in JS'))

    # Common keys: compare value, group, class
    common = sorted(set(js_consts) & set(py_consts))
    value_mismatches = []
    group_mismatches = []
    class_mismatches = []
    for key in common:
        j = js_consts[key]
        p = py_consts[key]
        # Float compare with tolerance to allow for representation noise
        if abs(j['value'] - p['value']) > 1e-9:
            value_mismatches.append((key, j['value'], p['value']))
        if j['group'] != p['group']:
            group_mismatches.append((key, j['group'], p['group']))
        if j['class'] != p['class']:
            class_mismatches.append((key, j['class'], p['class']))

    # ─── Report ─────────────────────────────────────────────────────
    if not issues and not value_mismatches and not group_mismatches and not class_mismatches:
        print(f'  ✓ All {len(common)} shared constants match (value + group + class)')
        print()
        print('=' * 84)
        print('AUDIT PASSED — JS and Python constants are in sync')
        print('=' * 84)
        return 0

    if js_only:
        print(f'  ✗ {len(js_only)} key(s) in JS but missing in Python:')
        for key in sorted(js_only):
            print(f'      - {key}')
        print()
    if py_only:
        print(f'  ✗ {len(py_only)} key(s) in Python but missing in JS:')
        for key in sorted(py_only):
            print(f'      - {key}')
        print()
    if value_mismatches:
        print(f'  ✗ {len(value_mismatches)} value mismatch(es):')
        print(f'      {"KEY":<32}  {"JS":>14}  {"PY":>14}  diff')
        for key, jv, pv in value_mismatches:
            print(f'      {key:<32}  {jv:>14.6g}  {pv:>14.6g}  Δ={(jv-pv):+.4g}')
        print()
    if group_mismatches:
        print(f'  ✗ {len(group_mismatches)} group mismatch(es):')
        for key, jg, pg in group_mismatches:
            print(f'      {key:<32}  JS={jg:<12}  PY={pg}')
        print()
    if class_mismatches:
        print(f'  ✗ {len(class_mismatches)} class mismatch(es):')
        for key, jc, pc in class_mismatches:
            print(f'      {key:<32}  JS={jc:<12}  PY={pc}')
        print()

    n_total = (len(js_only) + len(py_only) + len(value_mismatches)
               + len(group_mismatches) + len(class_mismatches))
    print('=' * 84)
    print(f'AUDIT FAILED — {n_total} issue(s) found')
    print('=' * 84)
    return 1


if __name__ == '__main__':
    sys.exit(main())
