// tickers are assumed to be from NSE
const tickers = [
  // Banks
  'HDFCBANK',
  'ICICIBANK',
  'KOTAKBANK',
  'AXISBANK',

  // Financial Services
  'BAJFINANCE',
  'BAJAJFINSV',
  'HDFC',

  // AMCs
  'HDFCAMC',

  // IT
  'TCS',
  'INFY',
  'HCLTECH',

  // Pharma
  'ABBOTINDIA',
  'SANOFI',
  'PFIZER',
  'DIVISLAB',

  // Insurance
  'HDFCLIFE',
  'SBILIFE',
  'ICICIPRULI',
  'ICICIGI',

  // Paint
  'ASIANPAINT',
  'BERGEPAINT',
  'AKZOINDIA',

  // FMCG
  'BRITANNIA',
  'HINDUNILVR',
  'ITC',
  'BATAINDIA',
  'COLPAL',
  'MARICO',
  'DABUR',
  'PIDILITIND',
  'NESTLEIND',
  'PGHH',

  // Consumer Durables
  'TITAN',
  'WHIRLPOOL',
  'TTKPRESTIG',
  'VOLTAS',
  'HAVELLS',
  'GILLETTE',

  // Specialty Chemicals
  'VINATIORGA',
  'NAVINFLUOR',
  'DEEPAKNTR',
  'SUDARSCHEM',
  'AARTIIND',

  // MISC
  'RELIANCE',
  'SBICARD',
  'BAJAJHLDNG',
  'AVANTIFEED',
  'MARUTI',
  'BHARTIARTL',

  // Agro Chemicals
  'BAYERCROP',
  'PIIND',
  'BHARATRAS',
  'SUMICHEM',
];
const fetched_indicators =
    ['sector', 'industry', 'open', 'high', 'low', 'close', 'EMA200', 'RSI'];
const additional_indicators =
    ['closeToEMA200 (%)', 'Trading View Chart Link', 'Screener Details Link'];
const additional_indicators_calculators = [
  (ticker, indicators) => {
    // indicators should be a map of fetched_indicators and
    // additional_indicators occuring before this indicator keys to their values
    return ((indicators['close'] - indicators['EMA200']) /
            indicators['EMA200']) *
        100;
  },
  (ticker, indicators) => {
    return `<a href="https://www.tradingview.com/chart?symbol=NSE:${
        ticker}" target="_blank">Trading View Chart</a>`;
  },
  (ticker, indicators) => {
    return `<a href="https://www.screener.in/company/${
        ticker}/consolidated/" target="_blank">Screener Details</a>`;
  },
];
const all_indicators = fetched_indicators.concat(additional_indicators);

process_response_text = function(responseText) {
  // parsed_response is a list of ticker results
  const parsed_response = JSON.parse(responseText)['data'];
  const ticker_indicators = {};
  for (let i = 0; i < parsed_response.length; i++) {
    const ticker = parsed_response[i]['s'].split(':')[1];
    const fetched_indicators_values = parsed_response[i]['d'];
    // set the fetched indicators
    const current_indicators = {};
    for (let j = 0; j < fetched_indicators.length; j++) {
      current_indicators[fetched_indicators[j]] = fetched_indicators_values[j];
    }
    // set the additional indicators
    for (let j = 0; j < additional_indicators.length; j++) {
      current_indicators[additional_indicators[j]] =
          additional_indicators_calculators[j](ticker, current_indicators);
    }
    ticker_indicators[ticker] = current_indicators;
  }
  return ticker_indicators;
};

display_stocks_table = (ticker_indicators) => {
  // create the table header
  const tableHeader = get_table_header();
  // stocks close to ema200
  const sorted_tickers =
      tickers.concat()
          .sort(
              (ticker1, ticker2) =>
                  ticker_indicators[ticker1]['closeToEMA200 (%)'] -
                  ticker_indicators[ticker2]['closeToEMA200 (%)'])
          .sort(
              (ticker1, ticker2) =>
                  ticker_indicators[ticker1]['industry'].localeCompare(
                      ticker_indicators[ticker2]['industry']))
          .sort(
              (ticker1, ticker2) =>
                  ticker_indicators[ticker1]['sector'].localeCompare(
                      ticker_indicators[ticker2]['sector']));

  const near_ema200_condition = (ticker) =>
      ticker_indicators[ticker]['closeToEMA200 (%)'] <= 1;
  const near_ema200_tickers = sorted_tickers.filter(near_ema200_condition);
  const far_ema200_tickers =
      sorted_tickers.filter((ticker) => !near_ema200_condition(ticker));

  document.getElementById('table-stocks-near-ema200').innerHTML =
      tableHeader + get_table_body(near_ema200_tickers, ticker_indicators);
  document.getElementById('table-stocks-far-ema200').innerHTML =
      tableHeader + get_table_body(far_ema200_tickers, ticker_indicators);
};

/** Returns a string with the html table head element */
get_table_header = () => {
  let tableHead = '<thead class="thead-light">' +
      '<tr>' +
      '<th>' +
      'Ticker' +
      '</th>';
  for (let i = 0; i < all_indicators.length; i++) {
    tableHead += '<th>' + all_indicators[i] + '</th>';
  }
  tableHead += '</thead>';
  return tableHead;
};

/**
 * Returns a string with the html table body element containing rows for all the
 *  tickers specified as the param and in that order.
 *
 *  @param tickers_for_table_body Ordered list of tickers for which to create
 * the table body
 *  @param ticker_indicators Map from ticker to the ticker's indicators
 */
get_table_body = (tickers_for_table_body, ticker_indicators) => {
  let tableBody = '<tbody>';
  for (let i = 0; i < tickers_for_table_body.length; i++) {
    const current_ticker = tickers_for_table_body[i];
    const current_indicators = ticker_indicators[current_ticker];

    let tableRow = '<tr';
    if (current_indicators['closeToEMA200 (%)'] <= 10) {
      tableRow += ' class="table-success"';
      }
    tableRow += '>';
    tableRow += '<td>' + current_ticker + '</td>';
    for (let j = 0; j < all_indicators.length; j++) {
      tableRow += '<td>'
      const indicator = current_indicators[all_indicators[j]];
      if (typeof indicator === 'number') {
        tableRow += indicator.toFixed(3);
      } else {
        tableRow += indicator;
      }
      tableRow += '</td>';
    }
    tableRow += '</tr>';

    tableBody += tableRow;
  }
  tableBody += '</tbody>';
  return tableBody;
};

// send the request
const scan_url = 'https://scanner.tradingview.com/india/scan';
const post_request_data = {
  'symbols':
      {'tickers': tickers.map((t) => 'NSE:' + t), 'query': {'types': []}},
  'columns': fetched_indicators
};
const xhttp = new XMLHttpRequest();
xhttp.onload = function() {
  const processed_response = process_response_text(this.responseText);
  display_stocks_table(processed_response);
};
xhttp.onerror = function() {
  alert(`XHR to ${scan_url} failed; status code = ${this.statusText}`);
};
xhttp.open('POST', scan_url);
xhttp.send(JSON.stringify(post_request_data));
