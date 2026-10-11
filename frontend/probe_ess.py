from pathlib import Path

P = Path(__file__).resolve().parent / "src" / "components" / "modules" / "ess" / "EssManagement.tsx"
LINES = P.read_text(encoding="utf-8").splitlines()
print("TOTAL:", len(LINES))

def show(lo, hi, tag):
    print(f"--- {tag} [{lo}-{hi}] ---")
    for i in range(max(1, lo) - 1, min(hi, len(LINES))):
        print(f"{i + 1}: {LINES[i]}")

print("=== reportOptions / o.help / o.name hits ===")
for i, l in enumerate(LINES, 1):
    if "reportOptions" in l or "o.help" in l or "o.name" in l or "o.icon" in l or "o.desc" in l:
        print(f"{i}: {l}")

show(915, 930, "requests pagination")
show(1375, 1392, "activity pagination")
show(1203, 1225, "settings card + intake")
show(1540, 1562, "reports dialog list")
