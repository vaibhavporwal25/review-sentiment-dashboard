# E-Commerce Product Review Sentiment Dashboard

**Department of Computer Applications**  
**Galgotias College of Engineering & Technology (GCET), Greater Noida**  
**Mini Project (BMC353) — MCA 3rd Semester | Session: 2026–27**  
**Group:** C2-G4 | **Section:** C  

---

##  Project Team & Supervision

* **Project Supervisor:** Mr. Avijit Sasmal (Assistant Professor, Department of Computer Applications)
* **Team Members:**
  * **Vaishnavi** (Roll No: `2500970140208`) — *Data & NLP Lead*
  * **Vivek Kumar** (Roll No: `2500970140211`) — *Backend & Database Architect*
  * **Vaibhav** (Roll No: `2500970140206`) — *Frontend & UI/UX Engineer*

---

##  Project Overview & Problem Statement

E-commerce marketplaces host hundreds of user comments per product. Shoppers face difficulty distinguishing genuine customer feedback from fake, spam, and duplicate reviews, while sellers lack a clean, consolidated overview of customer sentiment.

This project delivers an interactive, end-to-end full-stack web application that:
1. **Screens Deceptive Reviews**: Applies heuristic anomaly detection (flags copy-pasting, excessive punctuation, all-caps text, promotional links).
2. **Classifies Sentiment**: Uses sublinear TF-IDF vectorization with class-weighted Logistic Regression to categorize clean reviews into *Positive*, *Neutral*, and *Negative* with 99.2% evaluation accuracy.
3. **Presents Actionable Intelligence**: Features a responsive React dashboard with Recharts visualizations, interactive cross-filtering, active filter chips, and paginated review tracking.
4. **Resilient Dual Storage**: Automatically defaults to a local JSON fallback store when MongoDB is not connected.

---

##  UN Sustainable Development Goal Alignment

* **Primary SDG:** **SDG 12 — Responsible Consumption and Production** (*Target 12.8*)
* Promotes transparent, reliable purchasing decisions by highlighting genuine customer satisfaction scores and filtering out manipulative spam.

---

##  Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Machine Learning & NLP** | Python 3.10+, pandas, scikit-learn, TF-IDF Vectorizer, Logistic Regression |
| **Backend REST API** | Node.js (v24), Express.js (v4.19), Mongoose (v8.4), CORS |
| **Frontend Web Client** | React 18, Vite 5, Recharts (v2.12), Axios, CSS3 Grid/Flexbox |
| **Storage Engine** | MongoDB with automatic flat-file JSON fallback (`reviews.json`) |

---

##  Getting Started & Execution

### 1. Machine Learning Pipeline (`/ml`)
```bash
cd ml
pip install -r requirements.txt
python review_analysis.py
```
*Outputs cleaned and enriched data to `../backend/data/reviews.json` and performance metrics to `metrics.txt`.*

### 2. Backend Server (`/backend`)
```bash
cd ../backend
npm install
npm start
```
*Runs on `http://localhost:5000`. If `MONGO_URI` is provided in environment variables, it connects to MongoDB; otherwise, it operates seamlessly on the local JSON store.*

### 3. Frontend Web Dashboard (`/frontend`)
```bash
cd ../frontend
npm install
npm run dev
```
*Launches Vite dev server on `http://localhost:5173/` with built-in API proxy routing to `http://localhost:5000`.*

---

##  REST API Endpoints

* `GET /api/stats` — Fetches aggregate metrics (Total, Genuine, Suspicious, Positive Share, per-product distribution, and rule flag breakdown). Accepts optional query parameters: `product`, `search`, and `hideSuspicious=true`.
* `GET /api/reviews` — Paginated and filterable customer review ledger. Accepts `page`, `limit`, `product`, `sentiment`, `search`, and `hideSuspicious`.

---

##  Academic License & Integrity

Developed for academic evaluation under **Mini Project (BMC353)** at Galgotias College of Engineering & Technology. All rights reserved by the student team.
