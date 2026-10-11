from pathlib import Path

P = Path(__file__).resolve().parent / "src" / "components" / "modules" / "ess" / "EssManagement.tsx"
text = P.read_text(encoding="utf-8")
i = text.index("<PageHeader")
print(repr(text[i:i + 700]))
