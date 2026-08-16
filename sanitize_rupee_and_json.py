import os, json, re

theme_dirs = ['d:/Example/dawn_theme', 'd:/Example']

print("=== SANITIZING RUPEE SYMBOLS AND AUDITING INDEX.JSON ===")

modified_files = []

for base_dir in theme_dirs:
    for root, dirs, files in os.walk(base_dir):
        if '.git' in root or 'node_modules' in root:
            continue
        for file in files:
            if not file.endswith(('.liquid', '.json')):
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if '\u20b9' in content or '₹' in content:
                    count = content.count('\u20b9') + content.count('₹')
                    
                    if file.endswith('.json'):
                        # In JSON, replace raw rupee with 'Rs. ' or clean string so Shopify JSON parser doesn't reject it
                        new_content = content.replace('₹', 'Rs. ').replace('\u20b9', 'Rs. ')
                    else:
                        # In Liquid, replace raw rupee with HTML entity '&#8377;' or 'Rs. '
                        new_content = content.replace('₹', '&#8377;').replace('\u20b9', '&#8377;')
                    
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    rel = os.path.relpath(path, 'd:/Example')
                    modified_files.append((rel, count))
            except Exception as e:
                print(f"Error in {path}: {e}")

print(f"Sanitized {len(modified_files)} files containing raw rupee symbols:")
for f, cnt in modified_files:
    print(f"  - {f} ({cnt} replacements)")

# Re-validate templates/index.json
for idx_path in ['d:/Example/dawn_theme/templates/index.json', 'd:/Example/templates/index.json']:
    if os.path.exists(idx_path):
        with open(idx_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Validated {idx_path}: valid JSON with {len(data['order'])} sections.")
