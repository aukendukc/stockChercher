import { useState } from "react";
import { Profile } from "./profile";
import "./App.css";

type StockData = {
  dates: string[];
  close: number[];
};

function App() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<StockData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedTicker, setSubmittedTicker] = useState("");

  const fetchStock = () => {
    if (!ticker.trim()) {
      setError("銘柄コードを入力してください。");
      return;
    }

    const upperTicker = ticker.toUpperCase();

    setError("");
    setLoading(true);
    setData(null);
    setSubmittedTicker(upperTicker);

    fetch(`http://localhost:8000/stock/${upperTicker}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch stock data");
        }

        return res.json();
      })
      .then((json: StockData) => {
        setData(json);
        setLoading(false);
      })
      .catch((fetchError) => {
        console.log("Error fetching data:", fetchError);
        setError("データを取得できませんでした。");
        setLoading(false);
      });
  };

  return (
    <main className="app-shell">
      <div className="app-layout">
        <section className="hero-card">
          <Profile />
          <div className="hero-copy">
            <h1>StockSpace</h1>
            <p>
              証券コード(AAPL, 7203.Tなど)を入力してチャートを表示させましょう。
            </p>
          </div>
        </section>

        <section className="search-card">
          <div className="search-header">
            <div>
              <h2>銘柄を検索</h2>
              <p>例: AAPL, MSFT, NVDA, 7203.T</p>
            </div>
          </div>

          <div className="ticker-form">
            <label className="field-label">
              証券コード
              <input
                className="ticker-input"
                name="myInput"
                placeholder="AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchStock();
                  }
                }}
              />
            </label>

            <button className="search-button" onClick={fetchStock} disabled={loading}>
              {loading ? "読み込み中..." : "検索"}
            </button>
          </div>

          {loading && <p className="status-message loading">データを取得しています。</p>}
          {error && <p className="status-message error">{error}</p>}
        </section>

        <section className="chart-card">
          <h2>チャート</h2>
          <p>{submittedTicker ? `${submittedTicker} の推移` : "検索後にチャートを表示します。"}</p>

          {submittedTicker ? (
            <div className="chart-frame">
              <img
                className="chart-image"
                src={`http://localhost:8000/stock/${submittedTicker}/plot`}
                alt={`${submittedTicker} stock chart`}
              />
            </div>
          ) : (
            <div className="empty-state">まだチャートは表示されていません。</div>
          )}
        </section>

        <section className="data-card">
          <h2>終値データ</h2>
          <p>{submittedTicker ? `${submittedTicker} の取得結果` : "検索後に一覧を表示します。"}</p>

          {data?.close?.length ? (
            <ul className="data-list">
              {data.close.map((price, i) => (
                <li className="data-row" key={data.dates[i] ?? i}>
                  <span className="data-date">{data.dates[i]}</span>
                  <span className="data-price">{price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">表示できるデータはまだありません。</div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
