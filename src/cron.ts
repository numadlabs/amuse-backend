import logger from "./config/winston";
import { getBtcPrice, getCurrency } from "./lib/btcPriceHelper";
import { currencyRepository } from "./repository/currencyRepository";
import cron from "node-cron";

export async function updateCurrencyPrice() {
  cron.schedule("0 * * * *", async () => {
    await getAndUpdateBitcoinPrice();
    await getAndUpdateEUR();
  });
}

export async function getAndUpdateBitcoinPrice() {
  try {
    const price = await getBtcPrice();
    const bitcoin = await currencyRepository.getByTicker("BTC");

    bitcoin.price = price;
    bitcoin.updatedAt = new Date();

    await currencyRepository.update(bitcoin.id, bitcoin);

    logger.info(`Updated bitcoin price to ${bitcoin.price}`);
  } catch (e) {
    logger.error(`Error updating bitcoin price: ${e}`);
  }
}

export async function getAndUpdateEUR() {
  try {
    const price = await getCurrency("EUR");
    const currency = await currencyRepository.getByTicker("EUR");

    currency.price = price;
    currency.updatedAt = new Date();

    await currencyRepository.update(currency.id, currency);

    logger.info(`Updated EUR price to ${currency.price}`);
  } catch (e) {
    logger.error(`Error updating EUR price: ${e}`);
  }
}
