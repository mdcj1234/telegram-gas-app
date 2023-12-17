//
// Application config
//
export const AWSAccount = process.env.AWS_ACCOUNT || "";

export const AWSRegion = process.env.AWS_REGION || "";

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export const SECRET_TOKEN = process.env.SECRET_TOKEN || "";

interface Configuration {
  [key: string]: string;
}

export const ENV = (): string => {
  const config: Configuration = {
    "730154109642": "-prod",
  };
  return config[AWSAccount];
};

export const APP_NAME = "cooking-gas-app";

//
// stack domain config
//
export const API_GATEWAY_STACK = `${APP_NAME}-api`;

export const USER_DATA_STACK = `${APP_NAME}-user-data`;

export const PURCHASE_DATA_STACK = `${APP_NAME}-purchase-data`;

export const CONTACT_DATA_STACK = `${APP_NAME}-contact-data`;

export const NOTIFICATION_STACK = `${APP_NAME}-notification-rule`;

export const NOTIFICATION_HANDLER_STACK = `${APP_NAME}-notification-handler`;

export const MESSAGE_HANDLER_STACK = `${APP_NAME}-message-handler`;

export const INFRA_ARTIFACTS_STACK = `${APP_NAME}-infra-artifacts`;
