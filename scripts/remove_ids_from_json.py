import json
import os

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
json_path = os.path.join(base, "datasets", "_datasets.json")

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

if isinstance(data, list):
    for item in data:
        if isinstance(item, dict) and "id" in item:
            item.pop("id", None)

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Removed 'id' keys from _datasets.json")

