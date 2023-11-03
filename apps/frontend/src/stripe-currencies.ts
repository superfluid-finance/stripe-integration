const twoDecimalCurrencies = [
  'USD',
  'AED',
  'ALL',
  'AMD',
  'ANG',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BIF',
  'BMD',
  'BND',
  'BSD',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ETB',
  'EUR',
  'FJD',
  'GBP',
  'GEL',
  'GIP',
  'GMD',
  'GYD',
  'HKD',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JMD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KRW',
  'KYD',
  'KZT',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NOK',
  'NPR',
  'NZD',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SEK',
  'SGD',
  'SLE',
  'SOS',
  'SZL',
  'THB',
  'TJS',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'UZS',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XCD',
  'YER',
  'ZAR',
  'ZMW',
];

const threeDecimalCurrencies = ['BHD', 'JOD', 'KWD', 'OMR', 'TND'];

const zeroDecimalCurrencies = [
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'JPY',
  'KMF',
  'KRW',
  'MGA',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
];

export const currencyDecimalMapping: Map<string, 0 | 2 | 3> = new Map([
  ...twoDecimalCurrencies.map((x) => [x, 2] as [string, 2]),
  ...threeDecimalCurrencies.map((x) => [x, 3] as [string, 3]),
  ...zeroDecimalCurrencies.map((x) => [x, 0] as [string, 0]),
]);