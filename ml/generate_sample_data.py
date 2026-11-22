"""Creates a synthetic raw review CSV (with noise, duplicates, spam) for demo/testing."""
import random, os
import pandas as pd
random.seed(42)
products = ["Wireless Earbuds", "Smart Watch", "Laptop Backpack", "Bluetooth Speaker", "Phone Case"]
pos = ["works perfectly and the quality is excellent", "absolutely love it, totally worth the money",
       "fast delivery and great build quality", "exceeded my expectations, very happy", "sound is crisp and battery lasts long"]
neu = ["it is okay, does the job but nothing special", "average quality for the price",
       "decent product, some good and some bad points", "works fine but packaging was plain", "not bad, not great either"]
neg = ["stopped working after two days, very disappointed", "poor quality and a waste of money",
       "terrible battery, broke within a week", "does not match the description, want a refund", "cheap material and bad customer support"]
closers = ["", " Would recommend to a friend.", " Delivery took 3 days.", " Using it daily now.", " Packaging was fine.", " Customer care replied quickly.", " Ordered the black one."]
openers = ["", "Honestly, ", "Update: ", "After a month, ", "Bought this last week. "]
rows, rid = [], 1
def add(p, who, rating, text):
    global rid
    rows.append(dict(review_id=rid, product=p, reviewer=who, rating=rating, text=text)); rid += 1
for _ in range(600):
    p = random.choice(products); r = random.choices([1, 2, 3, 4, 5], [12, 12, 18, 28, 30])[0]
    pool = neg if r <= 2 else neu if r == 3 else pos
    t = random.choice(openers) + random.choice(pool) + (", and " + random.choice(pool) if random.random() < .5 else "") + random.choice(closers)
    if random.random() < .1: t = f"<p>{t}</p><br>"
    add(p, f"user{random.randint(1, 400)}", r, t)
for i in range(25): add(random.choice(products), f"bot{i}", 5, "Great product highly recommend")
for i in range(15): add(random.choice(products), f"promo{i}", 5, f"BUY NOW!!! best deals at http://cheap-deals{i}.biz click here!!!")
for i in range(10): add(random.choice(products), f"spam{i}", random.choice([1, 5]), "GOOD")
os.makedirs("data", exist_ok=True)
pd.DataFrame(rows).sample(frac=1, random_state=1).to_csv("data/reviews_raw.csv", index=False)
print("wrote data/reviews_raw.csv", len(rows))
