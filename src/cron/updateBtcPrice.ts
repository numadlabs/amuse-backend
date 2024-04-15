import { getBtcPrice } from "../lib/btcPriceHelper";
import { currencyRepository } from "../repository/currencyRepository";
import cron from "node-cron";

export async function updateCurrencyPrice() {
  cron.schedule("* * * * *", async () => {
    await getAndUpdateBitcoinPrice();
  });
}

export async function getAndUpdateBitcoinPrice() {
  const price = await getBtcPrice();
  const bitcoin = await currencyRepository.getByName("Bitcoin");

  bitcoin.price = price;

  await currencyRepository.update(bitcoin.id, bitcoin);

  console.log(`Updated Btc price to ${bitcoin.price}`);
}
