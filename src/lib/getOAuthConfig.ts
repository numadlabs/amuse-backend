import { config } from "../config/config";

export interface GoogleOAuthConfig {
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  OAUTH_REDIRECT_URI: string;
}

export function getGoogleOAuthConfig(appType: string) {
  const oauthConfig: Record<string, GoogleOAuthConfig> = {
    default: {
      OAUTH_CLIENT_ID: config.OAUTH_GOOGLE_WEB_CLIENT_ID,
      OAUTH_CLIENT_SECRET: config.OAUTH_GOOGLE_WEB_CLIENT_SECRET,
      OAUTH_REDIRECT_URI: config.OAUTH_GOOGLE_WEB_REDIRECT_URI,
    },
    ios: {
      OAUTH_CLIENT_ID: config.OAUTH_GOOGLE_IOS_CLIENT_ID,
      OAUTH_CLIENT_SECRET: config.OAUTH_GOOGLE_IOS_CLIENT_SECRET,
      OAUTH_REDIRECT_URI: config.OAUTH_GOOGLE_IOS_REDIRECT_URI,
    },
    android: {
      OAUTH_CLIENT_ID: config.OAUTH_GOOGLE_ANDROID_CLIENT_SECRET,
      OAUTH_CLIENT_SECRET: config.OAUTH_GOOGLE_ANDROID_CLIENT_SECRET,
      OAUTH_REDIRECT_URI: config.OAUTH_GOOGLE_ANDROID_REDIRECT_URI,
    },
  };

  return oauthConfig[appType] || oauthConfig.default;
}
