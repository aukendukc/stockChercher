from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import io

from curl_cffi import requests
#create a sesison to lool like a real browser, avoiding being blocked by yfinance server
session = requests.Session(impersonate="Safari15_5")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/stock/{ticker}")
def get_stock_data(ticker: str):
    try:
        ticker_obj = yf.Ticker(ticker, session=session)         
        data = ticker_obj.history(period="1mo", interval="1d") 

        if data.empty:
            return {"error": f"No data found for ticker: {ticker}"}

        return {
            "dates": data.index.strftime("%Y-%m-%d").tolist(),
            "close": data["Close"].tolist(),
        }
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/stock/{ticker}/plot")
def get_stock_plot(ticker: str):
    ticker_obj = yf.Ticker(ticker, session=session)         
    df = ticker_obj.history(period="1mo", interval="1d") 

    if df.empty:
        return {"error": f"No data found for ticker: {ticker}"}
    
    df["MA5"] = df["Close"].rolling(5).mean()
    fig, ax = plt.subplots(figsize=(8,4))
    ax.plot(df.index, df["Close"])
    ax.set_title(f"{ticker.upper()} Stock Price")
    ax.plot(df.index, df["Close"], label="Close Price")
    ax.plot(df.index, df["MA5"], label="MA5")
    ax.legend()
    ax.set_xlabel("Date")
    ax.set_ylabel("Price")
    ax.grid(True)

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close(fig)

    return StreamingResponse(buf, media_type="image/png")