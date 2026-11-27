import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

const COLORS = { Positive: "#16836b", Neutral: "#c58b35", Negative: "#c65b52" };

export default function App() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState({ data: [], total: 0 });
  const [f, setF] = useState({
    product: "",
    sentiment: "",
    search: "",
    hideSuspicious: false,
    page: 1
  });
  const [error, setError] = useState("");
  const limit = 10;

  // Fetch stats whenever product, search, or hideSuspicious changes
  useEffect(() => {
    axios
      .get("/api/stats", {
        params: {
          product: f.product,
          search: f.search,
          hideSuspicious: f.hideSuspicious
        }
      })
      .then((r) => setStats(r.data))
      .catch(() => setError("Cannot reach API. Is the backend running?"));
  }, [f.product, f.search, f.hideSuspicious]);

  // Fetch reviews whenever filters or page change
  useEffect(() => {
    axios
      .get("/api/reviews", { params: { ...f, limit } })
      .then((r) => setReviews(r.data))
      .catch(() => setError("Cannot reach API. Is the backend running?"));
  }, [f]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v, page: 1 }));
  const resetFilters = () =>
    setF({ product: "", sentiment: "", search: "", hideSuspicious: false, page: 1 });

  if (error) return <div className="wrap"><p className="err">{error}</p></div>;
  if (!stats) return <div className="wrap">Loading…</div>;

  const pie = Object.entries(stats.sentiment || {}).map(([name, value]) => ({
    name,
    value
  }));
  const totalPie = pie.reduce((sum, d) => sum + d.value, 0);
  const pages = Math.max(1, Math.ceil(reviews.total / limit));
  const hasActiveFilters = Boolean(f.product || f.sentiment || f.search || f.hideSuspicious);

  return (
    <div className="wrap">
      <div className="header-row">
        <div>
          <p className="eyebrow">REVIEW INTELLIGENCE <span>·</span> OVERVIEW</p>
          <h1>Customer review pulse</h1>
          <p className="subtitle">Sentiment trends and review quality across your products.</p>
        </div>
        {hasActiveFilters && (
          <button className="reset-btn" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpis">
        <div className="card">
          <span>{f.product ? `Reviews · ${f.product}` : "Reviews analysed"}</span>
          <b>{stats.total}</b>
        </div>
        <div className="card">
          <span>Unflagged reviews</span>
          <b>{stats.genuine}</b>
        </div>
        <div className="card warn">
          <span>Flagged for review</span>
          <b>{stats.suspicious}</b>
        </div>
        <div className="card">
          <span>Positive sentiment</span>
          <b>
            {Math.round(
              ((stats.sentiment?.Positive || 0) / (totalPie || 1)) * 100
            )}
            %
          </b>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="card filter-card">
        <div className="filters">
          <input
            placeholder="Search review text"
            aria-label="Search review text"
            value={f.search}
            onChange={(e) => set("search", e.target.value)}
          />
          <select
            value={f.product}
            onChange={(e) => set("product", e.target.value)}
          >
            <option value="">All products</option>
            {stats.products?.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={f.sentiment}
            onChange={(e) => set("sentiment", e.target.value)}
          >
            <option value="">All sentiments</option>
            {Object.keys(COLORS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={f.hideSuspicious}
              onChange={(e) => set("hideSuspicious", e.target.checked)}
            />
            Exclude flagged reviews
          </label>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="active-chips">
            <span className="chips-label">Filters</span>
            {f.product && (
              <button className="chip" onClick={() => set("product", "")}>
                Product: <b>{f.product}</b> ✕
              </button>
            )}
            {f.sentiment && (
              <button className="chip" onClick={() => set("sentiment", "")}>
                Sentiment: <b>{f.sentiment}</b> ✕
              </button>
            )}
            {f.search && (
              <button className="chip" onClick={() => set("search", "")}>
                Search: "<b>{f.search}</b>" ✕
              </button>
            )}
            {f.hideSuspicious && (
              <button className="chip" onClick={() => set("hideSuspicious", false)}>
                Hidden Suspicious ✕
              </button>
            )}
          </div>
        )}

        <div className="interactive-hint">
          Select a sentiment or product in either chart to narrow the review list. Select it again to clear that filter.
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts">
        <div className="card chart-card">
          <div className="chart-header">
            <h3>
              {f.product ? `Sentiment · ${f.product}` : "Sentiment distribution"}
              <span className="chart-sub">
                {f.hideSuspicious ? " · Unflagged only" : " · All reviews"}
              </span>
            </h3>
            {f.sentiment && (
              <span className="badge-highlight">
                Filtered: {f.sentiment} (Click to toggle)
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            {totalPie === 0 ? (
              <div className="empty-chart">No reviews match current filters</div>
            ) : (
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  cursor="pointer"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      set("sentiment", f.sentiment === entry.name ? "" : entry.name);
                    }
                  }}
                >
                  {pie.map((d) => {
                    const isSelected = f.sentiment === d.name;
                    const isDimmed = f.sentiment && !isSelected;
                    return (
                      <Cell
                        key={d.name}
                        fill={COLORS[d.name]}
                        opacity={isDimmed ? 0.35 : 1}
                        stroke={isSelected ? "#0f172a" : "#fff"}
                        strokeWidth={isSelected ? 3 : 1}
                      />
                    );
                  })}
                </Pie>
                <Tooltip />
                <Legend
                  onClick={(e) => {
                    if (e && e.dataKey) {
                      set("sentiment", f.sentiment === e.dataKey ? "" : e.dataKey);
                    }
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="chart-header">
            <h3>
              Product comparison
              {f.product ? (
                <span className="badge-highlight">Selected: {f.product}</span>
              ) : (
                <span className="chart-sub"> (Click bar to select)</span>
              )}
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={stats.byProduct}
              onClick={(state) => {
                if (state && state.activeLabel) {
                  set("product", f.product === state.activeLabel ? "" : state.activeLabel);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <XAxis dataKey="product" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(COLORS).map((k) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="a"
                  fill={COLORS[k]}
                  onClick={(_data, index) => {
                    const item = stats.byProduct?.[index];
                    if (item) {
                      set("product", f.product === item.product ? "" : item.product);
                    }
                  }}
                >
                  {stats.byProduct?.map((entry) => {
                    const isSelected = f.product === entry.product;
                    const isDimmed = f.product && !isSelected;
                    const isSentimentDimmed = f.sentiment && f.sentiment !== k;
                    return (
                      <Cell
                        key={`cell-${entry.product}-${k}`}
                        fill={COLORS[k]}
                        opacity={isDimmed || isSentimentDimmed ? 0.3 : 1}
                        stroke={isSelected ? "#0f172a" : "none"}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="card">
        <div className="table-header">
          <h3>
            Filtered Customer Reviews
              <span className="table-count">{reviews.total.toLocaleString()} results</span>
          </h3>
        </div>

        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Sentiment</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {reviews.data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "24px", color: "#64748b" }}
                >
                  No reviews match the selected filter criteria.
                </td>
              </tr>
            ) : (
              reviews.data.map((r) => (
                <tr key={r.review_id} className={r.suspicious ? "sus" : ""}>
                  <td><b>{r.product}</b></td>
                  <td>{"★".repeat(r.rating)}</td>
                  <td>{r.text}</td>
                  <td>
                    <span
                      className="pill"
                      style={{ background: COLORS[r.sentiment] }}
                    >
                      {r.sentiment}
                    </span>
                  </td>
                  <td>{r.suspicious ? r.flags.join(", ") : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        <div className="pager">
          <button
            disabled={f.page <= 1}
            onClick={() => setF((p) => ({ ...p, page: p.page - 1 }))}
          >
            Prev
          </button>
          <span>
            Page {f.page} of {pages} ({reviews.total} reviews)
          </span>
          <button
            disabled={f.page >= pages}
            onClick={() => setF((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
