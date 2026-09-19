with open("backend/app/application/use_cases/sync.py", "r") as f:
    code = f.read()

# Proteinuria parsingini xavfsiz qilish (agar yo'q bo'lsa yoki noto'g'ri bo'lsa default negative)
safe_proteinuria = """proteinuria_raw = item.get("payload", item).get("proteinuria")
                if not proteinuria_raw or str(proteinuria_raw).lower() in ("none", "null", ""):
                    proteinuria_val = ProteinuriaLevel.NEGATIVE
                else:
                    proteinuria_val = ProteinuriaLevel(proteinuria_raw)"""

import re

code = re.sub(
    r"proteinuria=ProteinuriaLevel\([^)]+\),", "proteinuria=proteinuria_val,", code
)
code = re.sub(
    r"try:\s+vitals",
    f"try:\n                {safe_proteinuria}\n                vitals",
    code,
)

# client_local_id ni to'g'ri olish (item["client_local_id"] yoki item["local_id"])
code = code.replace(
    'item.get("local_id")', 'item.get("client_local_id") or item.get("local_id")'
)

with open("backend/app/application/use_cases/sync.py", "w") as f:
    f.write(code)
print("[*] sync.py xavfsiz proteinuria va local_id bilan yangilandi.")
