import axios, { AxiosError } from "axios";
import logger from "../config/winston";
import { config } from "../config/config";
import { GoogleOAuthConfig } from "./getOAuthConfig";

export async function verifyGoogleAuthCode(
  authCode: string,
  oauthConfig: GoogleOAuthConfig
) {
  try {
    const tokenResponse = await axios.post(
      config.OAUTH_GOOGLE_TOKEN_URL,
      {
        code: authCode,
        client_id: oauthConfig.OAUTH_CLIENT_ID,
        client_secret: oauthConfig.OAUTH_CLIENT_SECRET,
        redirect_uri: oauthConfig.OAUTH_REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    logger.info(
      `Google verify google auth token response: ${tokenResponse.data}`
    );
    logger.info(
      `Google verify google auth token response status: ${tokenResponse.status}`
    );

    const { access_token, id_token } = tokenResponse.data;

    return { accessToken: access_token, idToken: id_token };
  } catch (e) {
    logger.warn(`Error on google authorization code verification req: ${e}`);
  }
}

export async function getGoogleUserInfo(accessToken: string) {
  try {
    const userInfoResponse = await axios.get(
      config.OAUTH_GOOGLE_USER_INFO_URL,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    logger.info(`Google get user info response: ${userInfoResponse.data}`);
    logger.info(
      `Google verify google auth token response status: ${userInfoResponse.status}`
    );

    const userInfo = userInfoResponse.data;

    return userInfo;
  } catch (e) {
    logger.warn(`Error on google get user info req: ${e}`);
  }
}
