import os, json

manifest = {}
for country in os.listdir("."):
    folder = os.path.join(".", country)
    if os.path.isdir(folder):
        manifest[country] = [f for f in os.listdir(folder) if f.endswith(".pdf")]

with open("./manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)