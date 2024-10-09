import axios from "axios";
import logger from "../config/winston";
import { config } from "../config/config";

export async function getGoogleUserInfo(accessToken: string) {
  try {
    const response = await axios.get(config.OAUTH_GOOGLE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    logger.warn(
      `Error fetching Google user info: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}
