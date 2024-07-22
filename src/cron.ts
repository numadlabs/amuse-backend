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

    bitcoin.price = price;
    bitcoin.updatedAt = new Date();

    await currencyRepository.update(bitcoin.id, bitcoin);

    console.log(`Updated Btc price to ${bitcoin.price}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}

export async function getAndUpdateCZK() {
  try {
    const price = await getCurrency("EUR");
    const currency = await currencyRepository.getByTicker("EUR");

    currency.price = price;
    currency.updatedAt = new Date();

    await currencyRepository.update(currency.id, currency);

    console.log(`Updated EUR price to ${currency.price}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}
