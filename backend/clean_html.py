import re

with open(r"C:\Users\Shrihari\.gemini\antigravity\brain\2cd36e36-bd97-44ed-9dab-3b86b7ece697\.system_generated\steps\666\content.md", "r", encoding="utf-8") as f:
    html_content = f.read()

keywords = ["partner", "program", "grow", "aidc", "join", "value", "benefit"]
for kw in keywords:
    matches = [m.start() for m in re.finditer(kw, html_content, re.IGNORECASE)]
    print(f"Keyword '{kw}' found {len(matches)} times")
    
for m in list(re.finditer(r'partner', html_content, re.IGNORECASE))[:10]:
    start = max(0, m.start() - 100)
    end = min(len(html_content), m.end() + 200)
    context = html_content[start:end]
    text_context = re.sub(r'<.*?>', ' ', context)
    text_context = re.sub(r'\s+', ' ', text_context).strip()
    print(f"Context: ...{''.join(c if ord(c) < 128 else '?' for c in text_context)}...")
    print("-" * 50)
