# Lint as: python3
"""TODO(adarshsaraf): DO NOT SUBMIT without one-line documentation for temp.

TODO(adarshsaraf): DO NOT SUBMIT without a detailed description of temp.
"""

# from __future__ import absolute_import
# from __future__ import division
# from __future__ import google_type_annotations
# from __future__ import print_function

import requests, json, datetime, warnings

from nsepy import get_history
from datetime import date, timedelta, datetime

tickers = ["NSE:BRITANNIA", "NSE:AVANTIFEED"]
scan_url = "https://scanner.tradingview.com/india/scan"
indicators = [
    "open", "high", "low", "close", "EMA20", "EMA50", "EMA200", "RSI", "RSI[1]", "price_book_fq"
]
data_json = {
    "symbols": {
        "tickers": tickers,
        "query": {
            "types": []
        }
    },
    "columns": indicators
}
response = requests.post(scan_url, json=data_json)

response.raise_for_status()
# raise Exception("Error: can't access TradingView's API. Error code: {} {}".format(response.status_code, response))

result = json.loads(response.text)["data"]
ticker_data = {
    ticker_data["s"]:
    {indicators[i]: ticker_data["d"][i] for i in range(len(indicators))}
    for ticker_data in result
}
print(ticker_data)
