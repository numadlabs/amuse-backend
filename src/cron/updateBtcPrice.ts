import { getBtcPrice, getCurrency } from "../lib/btcPriceHelper";
import { currencyRepository } from "../repository/currencyRepository";
import cron from "node-cron";

export async function updateCurrencyPrice() {
  cron.schedule("0 * * * *", async () => {
    await getAndUpdateBitcoinPrice();
    await getAndUpdateCZK();
  });
}

export async function getAndUpdateBitcoinPrice() {
  try {
    const price = await getBtcPrice();
    const bitcoin = await currencyRepository.getByName("BTC");

    bitcoin.priceInUSD = price;

    await currencyRepository.update(bitcoin.id, bitcoin);

    console.log(`Updated Btc price to ${bitcoin.priceInUSD}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}

export async function getAndUpdateCZK() {
  try {
    const price = await getCurrency("CZK");
    const currency = await currencyRepository.getByName("CZK");

    currency.priceInUSD = price;

    await currencyRepository.update(currency.id, currency);

    console.log(`Updated CZK price to ${currency.priceInUSD}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}
