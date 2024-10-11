import logger from "../config/winston";
import { config } from "../config/config";
import { OAuth2Client } from "google-auth-library";

export async function verifyGoogleOauthIdToken(idToken: string) {
  try {
    const client = new OAuth2Client();
    const CLIENT_IDs = [
      config.OAUTH_GOOGLE_WEB_CLIENT_ID,
      config.OAUTH_GOOGLE_IOS_CLIENT_ID,
      config.OAUTH_GOOGLE_ANDROID_CLIENT_ID,
    ];

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_IDs,
    });

    return ticket;
  } catch (e) {
    logger.warn(`Google OAuth idToken verification error: ${e}`);
    return false;
  }
}
