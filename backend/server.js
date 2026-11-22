const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
const DATA = path.join(__dirname, "data", "reviews.json");
const load = () => (fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, "utf8")) : []);

let Review = null; // set when MongoDB is connected, otherwise JSON fallback is used
async function initMongo() {
  if (!process.env.MONGO_URI) return console.log("No MONGO_URI -> using local JSON store");
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    Review = mongoose.model("Review", new mongoose.Schema({
      review_id: Number, product: String, reviewer: String, rating: Number, text: String,
      sentiment: String, confidence: Number, suspicious: Boolean, flags: [String],
    }));
    if ((await Review.countDocuments()) === 0) await Review.insertMany(load());
    console.log("MongoDB connected");
  } catch (e) { Review = null; console.log("MongoDB unavailable, using JSON fallback:", e.message); }
}

const all = async () => (Review ? Review.find().lean() : load());

app.get("/api/reviews", async (req, res) => {
  const { sentiment, product, search, hideSuspicious } = req.query;
  const page = +req.query.page || 1, limit = +req.query.limit || 10;
  let rows = await all();
  if (sentiment) rows = rows.filter(r => r.sentiment === sentiment);
  if (product) rows = rows.filter(r => r.product === product);
  if (hideSuspicious === "true") rows = rows.filter(r => !r.suspicious);
  if (search) rows = rows.filter(r => r.text.toLowerCase().includes(search.toLowerCase()));
  res.json({ total: rows.length, page, limit, data: rows.slice((page - 1) * limit, page * limit) });
});

app.get("/api/stats", async (req, res) => {
  const { product, search, hideSuspicious } = req.query;
  const rows = await all();
  const products = [...new Set(rows.map(r => r.product))].sort();

  // Scoped rows based on selected product & search query
  let scoped = rows;
  if (product) scoped = scoped.filter(r => r.product === product);
  if (search) scoped = scoped.filter(r => r.text.toLowerCase().includes(search.toLowerCase()));

  const genuine = scoped.filter(r => !r.suspicious);
  const targetForSentiment = hideSuspicious === "true" ? genuine : scoped;

  const count = (arr, k) => arr.reduce((m, r) => ((m[r[k]] = (m[r[k]] || 0) + 1), m), {});

  // byProduct breakdown: keep all products available for bar chart comparison
  let baseForProducts = rows;
  if (search) baseForProducts = baseForProducts.filter(r => r.text.toLowerCase().includes(search.toLowerCase()));
  if (hideSuspicious === "true") baseForProducts = baseForProducts.filter(r => !r.suspicious);

  const byProduct = products.map(p => {
    const g = baseForProducts.filter(r => r.product === p);
    const c = count(g, "sentiment");
    return {
      product: p,
      Positive: c.Positive || 0,
      Neutral: c.Neutral || 0,
      Negative: c.Negative || 0,
      total: g.length,
      avgRating: g.length ? +(g.reduce((s, r) => s + r.rating, 0) / g.length).toFixed(2) : 0
    };
  });

  const flagCounts = {};
  scoped.forEach(r => (r.flags || []).forEach(f => (flagCounts[f] = (flagCounts[f] || 0) + 1)));

  res.json({
    total: scoped.length,
    suspicious: scoped.length - genuine.length,
    genuine: genuine.length,
    sentiment: count(targetForSentiment, "sentiment"),
    byProduct,
    products,
    selectedProduct: product || null,
    flagCounts
  });
});

initMongo().then(() => app.listen(5000, () => console.log("API on http://localhost:5000")));
