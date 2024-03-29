// tickers are assumed to be from NSE
const stable_tickers = [
    // Banks
    'HDFCBANK',
    'ICICIBANK',
    'KOTAKBANK',
    'AXISBANK',

    // Financial Services
    'BAJFINANCE',
    'BAJAJFINSV',
    'BAJAJHLDNG',
    'MUTHOOTFIN',
    'CHOLAFIN',
    'AAVAS',
    'CANFINHOME',

    // AMCs
    'HDFCAMC',
    'ISEC',

    // Cards
    'SBICARD',

    // IT
    'TCS',
    'INFY',
    'HCLTECH',
    'LTIM',
    'TECHM',
    
    // Pharma
    'ABBOTINDIA',
    'SANOFI',
    'PFIZER',
    'CAPLIPOINT',
    'AJANTPHARM',
    'TORNTPHARM',
    'SUNPHARMA',
    
    // Healthcare
    'LALPATHLAB',
    'ALKEM',
    'DIVISLAB',
    'ERIS',
    'IPCALAB',
    'APOLLOHOSP',

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
    'NESTLEIND',
    'PGHH',

    // Consumer Durables
    'TITAN',
    'WHIRLPOOL',
    'TTKPRESTIG',
    'VOLTAS',
    'HAVELLS',
    'GILLETTE',
    '3MINDIA',
    'HONAUT',
    'BOSCHLTD',
    'SIEMENS',
    'VGUARD',
    'VIPIND',
    'RELAXO',
    'LAOPALA',
    'KAJARIACER',

    // Garments/Textile
    'PAGEIND',
    'SFL',
    'LUXIND',

    // Chemicals
    'PIDILITIND',
    'ATUL',

    // Specialty Chemicals
    'VINATIORGA',
    'NAVINFLUOR',
    'DEEPAKNTR',
    'AARTIIND',
    'ALKYLAMINE',
    'IOLCP',
    'FINEORG',
    'BALAMINES',
    'SRF',
    'SOLARINDS',
    'CLEAN',
    'GALAXYSURF',
    'AMIORG',
    'NEOGEN',

    // Agro Chemicals
    'BAYERCROP',
    'PIIND',
    'BHARATRAS',
    'SUMICHEM',

    // Gas Distribution
    'MGL',
    'IGL',
    'GUJGASLTD',
    'GSPL',
    'GAIL',

    // Retail
    'DMART',

    // Telecom
    'BHARTIARTL',

    // Petroleum
    'RELIANCE',

    // Food Processing
    'AVANTIFEED',

    // Auto
    'MARUTI',

    // Metal
    'MAITHANALL',

    // Agritech
    'DHANUKA',
    ];

const greedy_tickers = [
    // Banks
    'RBLBANK',
    'PNB',
    'BANKBARODA',
    'CANBK',
    
    // Financial Services
    'IRFC', 
    'IBULHSGFIN',
    
    // AMCs
    'ABSLAMC',
    // 'NAM-INDIA', some error with NSE not returning data
    
    // IT
    'OFSS',
    'PERSISTENT',
    'MPHASIS',
    'SONATSOFTW',
    'COFORGE',
    'LTTS',
    'TATAELXSI',  
    'HAPPSTMNDS',

    // Pharma
    'GLAXO',
    'LUPIN',
    'GLENMARK',
    'ZYDUSLIFE',
    'AARTIDRUGS',
    'GLAND',
    'BIOCON',

    // HEALTHCARE
    'LAURUSLABS',
    'PGHL',
    'KIMS',

    // PAINTS
    'KANSAINER',
    
    // FMCG
    'VSTIND',
    'TASTYBITE',

    // Speciality Chemicals
    'SUDARSCHEM',
    'LXCHEM',
    'ADVENZYMES',

    // Gas
    'ATGL',

    'AFFLE',
];

const all_tickers = stable_tickers.concat(greedy_tickers);

const fetched_indicators =
['sector', 'industry', 'open', 'high', 'low', 'close', 'EMA200', 'RSI'];
const additional_indicators = ['closeToEMA200 (%)', 'Links'];
const additional_indicators_calculators = [
    (ticker, indicators) => {
      // indicators should be a map of fetched_indicators and
      // additional_indicators occuring before this indicator keys to their values
      return ((indicators['close'] - indicators['EMA200']) /
          indicators['EMA200']) *
          100;
    },
    (ticker, indicators) => {
      const trading_view_chart_url =
          `https://www.tradingview.com/chart?symbol=NSE:${ticker}`;
      const trading_view_details_url =
          `https://www.tradingview.com/symbols/NSE:${ticker}`;
      const screener_details_url =
          `https://www.screener.in/company/${ticker}/consolidated/`;
      const nse_page_url =
          `https://www.nseindia.com/get-quotes/equity?symbol=${ticker}`;

      create_link_list_item = (url, display_text) => {
        return `<li><a href="${url}" target="_blank">${display_text}</a></li>`;
      };

      return '<ul>' +
          create_link_list_item(trading_view_chart_url, 'Trading View Chart') +
          create_link_list_item(
              trading_view_details_url, 'Trading View Details') +
          create_link_list_item(screener_details_url, 'Screener Details') +
          create_link_list_item(nse_page_url, 'NSE Page') + '</ul>';
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

update_stocks_tab = (tickers, ticker_indicators, near_ema_table_id, far_ema_table_id) => {
  // create the table header
  const tableHeader = get_table_header();
  // stocks close to ema200
  const sorted_tickers =
      tickers
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

  document.getElementById(near_ema_table_id).innerHTML =
      tableHeader + get_table_body(near_ema200_tickers, ticker_indicators);
  document.getElementById(far_ema_table_id).innerHTML =
      tableHeader + get_table_body(far_ema200_tickers, ticker_indicators);
};

display_stocks_table = (ticker_indicators) => {
  update_stocks_tab(stable_tickers, ticker_indicators, 'table-stable-stocks-near-ema200','table-stable-stocks-far-ema200' );
  update_stocks_tab(greedy_tickers, ticker_indicators, 'table-greedy-stocks-near-ema200', 'table-greedy-stocks-far-ema200');
};

/** Returns a string with the html table head element */
get_table_header = () => {
  let tableHead = '<thead class="thead-light">' +
      '<tr>' +
      '<th>S.No.</th>' +
      '<th>Ticker</th>';
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
    tableRow += `<td>${i + 1}</td><td>${current_ticker}</td>`;
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

// set the last updated time
document.getElementById('last_updated_time').innerHTML =
new Date().toLocaleTimeString();

// send the request
const scan_url = 'https://scanner.tradingview.com/india/scan';
const post_request_data = {
  'symbols':
  {'tickers': all_tickers.map((t) => 'NSE:' + t), 'query': {'types': []}},
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
