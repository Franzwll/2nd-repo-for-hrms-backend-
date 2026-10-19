from pathlib import Path

P = Path(__file__).resolve().parent / "src" / "components" / "modules" / "ess" / "EssManagement.tsx"
text = P.read_text(encoding="utf-8")

old_header = """      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin \\u00b7 Core HR" : "Admin \\u00b7 Core HR"}
        title="ESS Management"
        description={
          role === "superadmin"
            ? "Organization-wide monitoring, bulk processing, workflow and policy configuration."
            : "Process, approve and track employee self-service requests for your departments."
        }
        actions={"""

new_header = """      <PageHeader
        title="ESS Management"
        actions={"""

assert old_header in text, "header block not found - check encoding"
text = text.replace(old_header, new_header, 1)
P.write_text(text, encoding="utf-8")
print("OK: header eyebrow + description removed")
