import os, zipfile, datetime

theme_dir = 'd:/Example/dawn_theme'
zips = [
    'd:/Example/purelane-shopify-live-theme.zip',
    'd:/Example/purelane-dawn-production.zip'
]

for zip_path in zips:
    if os.path.exists(zip_path):
        os.remove(zip_path)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(theme_dir):
            for file in files:
                if file in ['.DS_Store', 'Thumbs.db']:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, theme_dir)
                zipf.write(full_path, rel_path)

    time_str = datetime.datetime.now().strftime("%I:%M:%S %p")
    print(f"Successfully packaged {zip_path} at {time_str} (Size: {os.path.getsize(zip_path)} bytes)")
