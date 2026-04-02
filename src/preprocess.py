import unicodedata
from bs4 import BeautifulSoup
from underthesea import text_normalize

def preprocess_text(text):
    text = BeautifulSoup(text, "html.parser").get_text()
    text = unicodedata.normalize("NFC", text)
    text = text_normalize(text)
    return text.strip()

def preprocess_list(texts):
    return [preprocess_text(t) for t in texts]