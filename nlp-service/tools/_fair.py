import json
import sys

data = json.load(open(sys.argv[1], encoding='utf-8'))
rows = [r for r in data['rows'] if 'blurred' not in r['file'].lower()]
total = len(rows)
print(f'Non-blurred files: {total}')
for field in ('name', 'email', 'phone', 'address', 'education_n', 'years', 'work_history'):
    ok = sum(1 for r in rows if r.get(field))
    print(f'{field:<14} {ok}/{total} = {round(100.0*ok/total,1)}%')
print()
print('=== FILES WITH MISSING FIELDS (non-blurred) ===')
for r in rows:
    missing = [f for f in ('name', 'email', 'phone', 'address') if not r.get(f)]
    if missing:
        print(f"{r['file'][:70]:<72} missing={missing} method={r['extract_method']}")
