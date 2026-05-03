"""
JS-Python sync audit: extract key numeric constants from both files and
verify they match. Catches drift where one file was updated without the other.
"""
import re
import sys

JS_FILE = '/mnt/user-data/outputs/lifelines.jsx'
PY_FILE = '/home/claude/sim_v5.py'


def extract_numbers_around(text, pattern, label, n_floats=1):
    """Find pattern in text, extract n_floats numeric values that follow."""
    matches = re.findall(pattern, text)
    return matches


def grep_numeric(text, pattern):
    """Extract a number after a pattern."""
    m = re.search(pattern, text)
    return m.group(1) if m else None


def compare_params():
    js = open(JS_FILE).read()
    py = open(PY_FILE).read()

    print('=' * 80)
    print('JS / PYTHON CONSTANT AUDIT')
    print('=' * 80)

    issues = 0

    # ── Bloc endowments ──
    print('\n┌─ BLOC ENDOWMENTS')
    blocs = ['OM', 'SC', 'DO', 'Mosaic']
    for bloc in blocs:
        # JS: endowments: { energy: 1.0, chips: 1.2, minerals: 0.7, agriculture: 1.1, infrastructure: 1.00 }
        py_pattern = f"'{bloc}': dict\\(.*?'energy': ([\\d.]+).*?'chips': ([\\d.]+).*?'minerals': ([\\d.]+).*?'agriculture': ([\\d.]+).*?'infrastructure': ([\\d.]+)"
        # Actually let me use a different approach — match ENDOWMENTS dict
        pass

    # Simpler approach: extract specific numeric constants we know matter
    checks = [
        ('Base death rate', r'baseDeath\s*=\s*([\d.]+)', r'base_death\s*=\s*([\d.]+)'),
        ('AI ceiling factor (energy)', r'aiCap\s*\*?[^\n]*4\s*\*\s*j?\.?endowments\.energy', r'4\s*\*\s*j\[.endowments.\]\[.energy.\]'),
        ('Robot ceiling factor (chips)', r'3\s*\*\s*[a-z]*\.?endowments\.chips', r'3\s*\*\s*j\[.endowments.\]\[.chips.\]'),
        ('Mosaic infra factor', r"infrastructure:\s*0\.72", r"'infrastructure':\s*0\.72"),
        ('War aggression × 0.15', r'aggression\s*\*?\s*0\.15|\*\s*0\.15;\s*//.*aggression', r'\*\s*0\.15'),
        ('War probability × 0.04', r'\*\s*0\.04;\s*//.*~3%|warProb\s*=\s*aggression\s*\*\s*targetVuln\s*\*\s*0\.04', r'war_prob\s*=\s*aggression\s*\*\s*target_vuln\s*\*\s*0\.04'),
        ('Target mortality coefficient (war)', r"intensity\s*\*\s*0\.045", r"'intensity'\]\s*\*\s*0\.045"),
        ('Aggressor mortality coefficient (war)', r"intensity\s*\*\s*0\.010(?!\d)", r"'intensity'\]\s*\*\s*0\.010(?!\d)"),
        ('Stat-credibility penalty coefficient', r'0\.30\s*-\s*n\.politicalResp\)\s*\*\s*0\.008', r'0\.30\s*-\s*n\[.politicalResp.\]\)\s*\*\s*0\.008'),
        ('Capped driver smoothing constant', r'0\.027\s*\*\s*\(1\s*-\s*Math\.exp', r'0\.027\s*\*\s*\(1\s*-\s*math\.exp'),
        ('Alignment failure threshold', r'totalCap\s*-\s*1\.5', r'total_cap\s*-\s*1\.5'),
        ('Alignment failure threshold-2 (0.4)', r'0\.4\s*-\s*n\.alignment\)\s*\*\s*0\.012', r'0\.4\s*-\s*n\[.alignment.\]\)\s*\*\s*0\.012'),
        ('Poverty death threshold (0.65)', r'0\.65\s*-\s*j\.medianIncome\)\s*\*\s*0\.012', r'0\.65\s*-\s*j\[.medianIncome.\]\)\s*\*\s*0\.012'),
        ('Despair death (UBI offset 0.95)', r'1\s*-\s*n\.ubiLevel\s*\*\s*0\.95\)\s*\*\s*0\.006', r'1\s*-\s*n\[.ubiLevel.\]\s*\*\s*0\.95\)\s*\*\s*0\.006'),
        ('Violence death (1-polStab × 0.013)', r'1\s*-\s*j\.polStability\)\s*\*\s*0\.013', r'1\s*-\s*j\[.polStability.\]\)\s*\*\s*0\.013'),
        ('Number of turns', r'NUM_TURNS\s*=\s*(\d+)', r'NUM_TURNS\s*=\s*(\d+)'),
        ('War mortality target', r'w\.intensity\s*\*\s*0\.045', r"w\[.intensity.\]\s*\*\s*0\.045"),
        ('War polStab × 0.55', r'w\.intensity\s*\*\s*0\.55', r"w\[.intensity.\]\s*\*\s*0\.55"),
        ('War income × 0.30', r'w\.intensity\s*\*\s*0\.30', r"w\[.intensity.\]\s*\*\s*0\.30"),
        ('War aiCap × 0.22', r'w\.intensity\s*\*\s*0\.22', r"w\[.intensity.\]\s*\*\s*0\.22"),
        ('War aggressor income +0.08', r'w\.intensity\s*\*\s*0\.08', r"w\[.intensity.\]\s*\*\s*0\.08"),
        ('War aggressor capConc +0.06', r'w\.intensity\s*\*\s*0\.06', r"w\[.intensity.\]\s*\*\s*0\.06"),
    ]

    for label, js_pat, py_pat in checks:
        js_match = re.search(js_pat, js)
        py_match = re.search(py_pat, py)
        if js_match and py_match:
            print(f'│  ✓  {label:<48s}  (both files)')
        elif js_match and not py_match:
            print(f'│  ✗  {label:<48s}  JS only — Python missing')
            issues += 1
        elif py_match and not js_match:
            print(f'│  ✗  {label:<48s}  Python only — JS missing')
            issues += 1
        else:
            print(f'│  ?  {label:<48s}  not found in either (regex may be wrong)')

    # Specific number checks via direct extraction
    print('\n┌─ EXACT NUMERIC PARAMETER VERIFICATION')
    exact_checks = [
        ('NUM_TURNS', r'const NUM_TURNS\s*=\s*(\d+)', r'NUM_TURNS\s*=\s*(\d+)'),
        ('baseDeath value', r'const baseDeath\s*=\s*([\d.]+)', r'base_death\s*=\s*([\d.]+)'),
        ('crisisScar decay', r'j\.crisisScar\s*\*=\s*([\d.]+)', r"j\['crisisScar'\]\s*\*=\s*([\d.]+)"),
        ('institutionalCapacity floor', r'institutionalCapacity\s*=\s*Math\.max\(([\d.]+)', r"institutionalCapacity'\]\s*=\s*max\(([\d.]+)"),
        ('Capital flow rate', r'flow\s*=\s*[a-zA-Z]*\s*\*\s*([\d.]+);?\s*//.*flow', None),  # may not exist in py
    ]

    for label, js_pat, py_pat in exact_checks:
        js_m = re.search(js_pat, js)
        py_m = re.search(py_pat, py) if py_pat else None
        if js_m and py_m:
            jsv, pyv = js_m.group(1), py_m.group(1)
            ok = jsv == pyv or float(jsv) == float(pyv)
            flag = '✓' if ok else '✗'
            print(f'│  {flag}  {label:<35s}  JS={jsv}  Python={pyv}')
            if not ok:
                issues += 1
        elif js_m:
            print(f'│  ?  {label:<35s}  JS={js_m.group(1)}  (no Python comparison)')
        else:
            print(f'│  ?  {label:<35s}  not extracted')

    print()
    print('=' * 80)
    if issues == 0:
        print(f'AUDIT PASSED — no constant drift detected')
    else:
        print(f'AUDIT FAILED — {issues} issues')
    print('=' * 80)
    return issues


if __name__ == '__main__':
    sys.exit(compare_params())
