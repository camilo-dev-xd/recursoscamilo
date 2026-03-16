import os
import re
import json
import shutil

base_dir = r"c:\Users\Neyder Arias\Documents\rescursos web utiles\MULTIMEDIA Y WEB"
anexos_dir = os.path.join(base_dir, "ANEXOS")
output_dir = r"c:\Users\Neyder Arias\Documents\rescursos web utiles\sitio_web"
img_dir = os.path.join(output_dir, "img")

if not os.path.exists(output_dir):
    os.makedirs(output_dir)
if not os.path.exists(img_dir):
    os.makedirs(img_dir)

resources = []

# copy images
if os.path.exists(anexos_dir):
    for filename in os.listdir(anexos_dir):
        if filename.endswith((".png", ".jpg", ".jpeg", ".svg", ".webp", ".gif")):
            src = os.path.join(anexos_dir, filename)
            dst = os.path.join(img_dir, filename)
            shutil.copy2(src, dst)

for filename in os.listdir(base_dir):
    if not filename.endswith(".md"):
        continue
    
    filepath = os.path.join(base_dir, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filename}: {e}")
        continue
    
    # Extract frontmatter
    match = re.search(r'^---\s*(.*?)\s*---', content, re.DOTALL)
    if not match:
        continue
        
    frontmatter = match.group(1)
    
    name_match = re.search(r'^Nombre:\s*(.+)$', frontmatter, re.MULTILINE | re.IGNORECASE)
    url_match = re.search(r'^Url:\s*(.+)$', frontmatter, re.MULTILINE | re.IGNORECASE)
    desc_match = re.search(r'^Descri[p]?ci[oó]n:\s*(.+)$', frontmatter, re.MULTILINE | re.IGNORECASE)
    
    # Extract categories
    cat_match = re.search(r'^Categoria:\s*\n((?:\s+-\s+.*\n?)*)', frontmatter, re.MULTILINE | re.IGNORECASE)
    categories = []
    if cat_match:
        cats_raw = cat_match.group(1)
        categories = [c.strip().strip('-').strip() for c in re.findall(r'^\s+-(.+)$', cats_raw, re.MULTILINE)]
    
    # Extract image
    # Match something that looks like an image file
    img_match = re.search(r'([a-zA-Z0-9_\-\s]+\.(?:png|jpg|jpeg|svg|webp))', frontmatter, re.IGNORECASE)
    image_name = img_match.group(1).strip() if img_match else ""
    
    # If not found in frontmatter, maybe find the ![[imagen 5.png]] outside
    if not image_name:
        img_match_outside = re.search(r'!\[\[(.*?\.(?:png|jpg|jpeg|svg|webp))\]\]', content, re.IGNORECASE)
        if img_match_outside:
             image_name = img_match_outside.group(1).strip()
    
    name = name_match.group(1).strip() if name_match else filename.replace('.md', '')
    url = url_match.group(1).strip() if url_match else ""
    description = desc_match.group(1).strip() if desc_match else ""
    
    # Clean up image link which might have trailing characters if regex was greedy
    image_name = image_name.replace(']', '')
    
    if name and url:
        resources.append({
            "id": re.sub(r'[\W_]+', '-', name.lower()).strip('-'),
            "name": name,
            "url": url,
            "categories": categories,
            "description": description,
            "image": image_name
        })

with open(os.path.join(output_dir, "data.json"), 'w', encoding='utf-8') as f:
    json.dump(resources, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(resources)} resources out of {len(os.listdir(base_dir))} files.")
