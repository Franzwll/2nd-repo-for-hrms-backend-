import json
import sys

data = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'quality_after.json', encoding='utf-8'))
rows = data['rows']
print(f"Total rows: {len(rows)}")
for r in rows:
    missing = [f for f in ('name', 'email', 'phone', 'address') if not r.get(f)]
    wh = r.get('work_history', 0)
    if missing or wh == 0:
        print(f"{r['file'][:55]:<57} missing={missing} wh={wh} edu={r.get('education_n')} yr={r.get('years')} method={r.get('method')}")

