import os

files = ["get_score.js", "get_score_with_detail.js"]

for file in files:
    with open(file, 'r') as f:
        data = f.read()
    data = data.replace("    ", "")
    data = data.replace("\n", "")
    with open("../" + file, mode='w') as f:
        f.write(data)
