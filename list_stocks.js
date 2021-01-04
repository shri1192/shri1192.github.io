// tickers are assumed to be from NSE
const tickers = ['BRITANNIA', 'AVANTIFEED'];
const indicators =
    ['open', 'high', 'low', 'close', 'EMA20', 'EMA50', 'EMA200', 'RSI'];

process_response_text = function(responseText) {
  // parsed_response is a list of ticker results
  const parsed_response = JSON.parse(responseText)['data'];
  const result = parsed_response.map((ticker_result) => {
    const indicator_keys = indicators;
    const indicator_values_list = ticker_result['d'];
    const indicator_values = {};
    for (let i = 0; i < indicator_keys.length; i++) {
      indicator_values[indicator_keys[i]] = indicator_values_list[i];
    }
    const result = {};
    result['ticker'] = ticker_result['s']
    result['indicators'] = indicator_values;
    return result;
  });
  return result;
};

display_stocks_table = (stocksData) => {
  // create the table header
  let tableData = '<thead>' +
      '<tr>' +
      '<th>' +
      'Ticker' +
      '</th>';
  for (let i = 0; i < indicators.length; i++) {
    tableData += '<th>' + indicators[i] + '</th>';
  }
  tableData += '</thead>';

  // create the table rows
  tableData += '<tbody>';
  for (let i = 0; i < stocksData.length; i++) {
    tableData += '<tr>';
    tableData += '<td>' + stocksData[i]['ticker'].split(':')[1] + '</td>';
    const stock_indicators = stocksData[i]['indicators'];
    for (let j = 0; j < indicators.length; j++) {
      tableData += '<td>' + stock_indicators[indicators[j]] + '</td>';
    }
    tableData += '</tr>';
  }
  tableData += '</tbody>'

  document.getElementById('table-stocks').innerHTML = tableData;
};

// send the request
const scan_url = 'https://scanner.tradingview.com/india/scan';
const post_request_data = {
  'symbols':
      {'tickers': tickers.map((t) => 'NSE:' + t), 'query': {'types': []}},
  'columns': indicators
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
