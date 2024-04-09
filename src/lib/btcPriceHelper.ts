import axios from "axios";

const apiUrl = process.env.BITCOIN_API_URL;
const apiKey = process.env.BITCOIN_API_KEY;

console.log(apiKey, apiUrl);

export async function getBtcPrice() {
  if (!apiUrl) throw new Error("Error retrieving BTC price.");

  const response = await axios.get(apiUrl, {
    headers: { "X-CMC_PRO_API_KEY": apiKey },
  });

  return response.data.data[0].quote.USD.price;
}
