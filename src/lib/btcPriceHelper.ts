import axios from "axios";

const cryptoApiURL = process.env.BITCOIN_API_URL;
const cryptoApiKey = process.env.BITCOIN_API_KEY;
const currencyApiURL = process.env.CURRENCY_API_URL;

export async function getBtcPrice() {
  if (!cryptoApiURL) throw new Error("Error retrieving BTC price.");

  const response = await axios.get(cryptoApiURL, {
    headers: { "X-CMC_PRO_API_KEY": cryptoApiKey },
  });

  return response.data.data[0].quote.USD.price;
}

export async function getCurrency(ticker: string) {
  if (!currencyApiURL) throw new Error("Error retrieving BTC price.");

  const response = await axios.get(currencyApiURL);

  return response.data.conversion_rates[ticker];
}
