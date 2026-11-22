"""Clean -> dedupe -> flag suspicious (rules) -> TF-IDF + Logistic Regression -> export JSON."""
import re, json, html, os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

RAW, OUT = "data/reviews_raw.csv", "../backend/data/reviews.json"
PROMO = re.compile(r"(http\S+|www\.\S+|buy now|click here|discount|free gift|whatsapp|promo code)", re.I)

def clean(t):
    t = html.unescape(str(t))
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()

def norm(t):
    return re.sub(r"[^a-z0-9 ]", "", t.lower()).strip()

def rule_flags(text, raw_dup_count):
    flags, words = [], text.split()
    letters = [c for c in text if c.isalpha()]
    if raw_dup_count >= 5: flags.append("copy-pasted")
    if len(words) < 3: flags.append("too-short")
    if letters and sum(c.isupper() for c in letters) / len(letters) > 0.6 and len(words) > 1: flags.append("all-caps")
    if text.count("!") >= 3: flags.append("excess-punctuation")
    if PROMO.search(text): flags.append("promotional/link")
    return flags

df = pd.read_csv(RAW).dropna(subset=["text", "rating"])
df["text"] = df["text"].map(clean)
df["norm"] = df["text"].map(norm)
df = df[df["norm"] != ""]
df["dup_count"] = df.groupby("norm")["review_id"].transform("count")
df["flags"] = [rule_flags(t, c) for t, c in zip(df["text"], df["dup_count"])]
before = len(df)
df = df.drop_duplicates(subset=["norm", "product"]).reset_index(drop=True)
print(f"deduplicated: {before} -> {len(df)}")

df["label"] = df["rating"].map(lambda r: "Negative" if r <= 2 else "Neutral" if r == 3 else "Positive")
vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2, stop_words="english", sublinear_tf=True)
X = vec.fit_transform(df["norm"])
Xtr, Xte, ytr, yte = train_test_split(X, df["label"], test_size=0.2, random_state=42, stratify=df["label"])
clf = LogisticRegression(max_iter=1000, class_weight="balanced").fit(Xtr, ytr)
pred = clf.predict(Xte)
report = f"Accuracy: {accuracy_score(yte, pred):.3f}\n\n" + classification_report(yte, pred)
print(report); open("metrics.txt", "w").write(report)

df["sentiment"] = clf.predict(X)
df["confidence"] = clf.predict_proba(X).max(axis=1).round(3)
for i, r in df.iterrows():
    if r["sentiment"] != r["label"] and r["confidence"] > 0.85 and "rating-text-mismatch" not in r["flags"]:
        df.at[i, "flags"] = r["flags"] + ["rating-text-mismatch"]
df["suspicious"] = df["flags"].map(len) > 0

os.makedirs(os.path.dirname(OUT), exist_ok=True)
cols = ["review_id", "product", "reviewer", "rating", "text", "sentiment", "confidence", "suspicious", "flags"]
json.dump(df[cols].to_dict("records"), open(OUT, "w"), indent=1)
print(f"exported {len(df)} reviews ({int(df.suspicious.sum())} suspicious) -> {OUT}")
