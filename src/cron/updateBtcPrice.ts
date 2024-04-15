import { getBtcPrice } from "../lib/btcPriceHelper";
import { currencyRepository } from "../repository/currencyRepository";
import cron from "node-cron";

export async function updateCurrencyPrice() {
  cron.schedule("*/10 * * * *", async () => {
    await getAndUpdateBitcoinPrice();
  });
}

export async function getAndUpdateBitcoinPrice() {
  try {
    const price = await getBtcPrice();
    const bitcoin = await currencyRepository.getByName("Bitcoin");

    bitcoin.price = price;

    await currencyRepository.update(bitcoin.id, bitcoin);

    console.log(`Updated Btc price to ${bitcoin.price}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}
