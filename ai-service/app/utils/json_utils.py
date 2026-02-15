import json


def extract_json(text: str):
    start = text.find("{")
    end = text.rfind("}") + 1
    return json.loads(text[start:end])
