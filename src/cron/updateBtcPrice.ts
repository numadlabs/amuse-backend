import { getBtcPrice } from "../lib/btcPriceHelper";
import { currencyRepository } from "../repository/currencyRepository";
import cron from "node-cron";

export async function updateCurrencyPrice() {
  console.log("Cron working inside updateCurrencyPrice()");
  cron.schedule("* * * * *", async () => {
    console.log("Cron working inside cron.schedule()");
    await getAndUpdateBitcoinPrice();
  });
}

export async function getAndUpdateBitcoinPrice() {
  try {
    const price = await getBtcPrice();
    console.log(price);
    const bitcoin = await currencyRepository.getByName("Bitcoin");
    console.log(bitcoin);

    bitcoin.price = price;

    await currencyRepository.update(bitcoin.id, bitcoin);

    console.log(`Updated Btc price to ${bitcoin.price}`);
  } catch (e) {
    console.log("Cron error catched.");
    console.log(e);
  }
}
