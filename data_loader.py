import time
import yfinance as yf
import pandas as pd

def get_data(ticker="IPXHY", start="2020-01-01", retries=3, wait=10):
    for i in range(retries):
        try:
            df = yf.download(ticker, 
                             start = start,
                             auto_adjust = False,
                             progress=False,
                             threads=False)
            if not df.empty:
                return df
            print("No darta retrieved, retrying...")
        except Exception as e:
            print(f"Error fetching error: {e}")

        time.sleep(wait)
    return pd.DataFrame()            

if __name__ == "__main__":
    df = get_data()
    print(df.head())
    df.to_csv("stock_data.csv")