import { getBtcPrice, getCurrency } from "./lib/btcPriceHelper";
import { currencyRepository } from "./repository/currencyRepository";
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
    const bitcoin = await currencyRepository.getByTicker("BTC");

    bitcoin.currentPrice = price;

    await currencyRepository.update(bitcoin.id, bitcoin);

    console.log(`Updated Btc price to ${bitcoin.currentPrice}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}

export async function getAndUpdateCZK() {
  try {
    const price = await getCurrency("EUR");
    const currency = await currencyRepository.getByTicker("EUR");

    currency.currentPrice = price;

    await currencyRepository.update(currency.id, currency);

    console.log(`Updated EUR price to ${currency.currentPrice}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}
