import re

with open("backend/app/application/use_cases/sync.py", "r") as f:
    content = f.read()

# item["systolic_bp"] larni item["payload"]["systolic_bp"] ga aylantirish
content = re.sub(
    r'item\["(systolic_bp|diastolic_bp|heart_rate|body_temp|proteinuria|respiratory_rate|blood_sugar)"\]',
    r'item.get("payload", item).get("\1")',
    content,
)
content = re.sub(
    r'item\.get\("(body_temp|respiratory_rate|blood_sugar|local_id)"',
    r'item.get("payload", item).get("\1"',
    content,
)

with open("backend/app/application/use_cases/sync.py", "w") as f:
    f.write(content)
