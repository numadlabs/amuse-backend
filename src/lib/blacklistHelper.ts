import logger from "../config/winston";
import { redis } from "../server";

const BLACKLIST_SET = "ip_blacklist";

export const addToBlacklist = async (ip: string) => {
  try {
    await redis.sadd(BLACKLIST_SET, ip);
    logger.info(`IP ${ip} added to blacklist`);
  } catch (error) {
    logger.warn("Error adding IP to blacklist:", error);
  }
};

// Function to remove an IP from the blacklist
export const removeFromBlacklist = async (ip: string) => {
  try {
    await redis.srem(BLACKLIST_SET, ip);
    logger.info(`IP ${ip} removed from blacklist`);
  } catch (error) {
    logger.warn("Error removing IP from blacklist:", error);
  }
};
