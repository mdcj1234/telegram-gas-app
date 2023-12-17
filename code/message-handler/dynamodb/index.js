const aws = require("aws-sdk");
const https = require("https");

const documentClient = new aws.DynamoDB.DocumentClient();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const USER_DATA_TABLE = process.env.USER_DATA_TABLE;
const PURCHASE_DATA_TABLE = process.env.PURCHASE_DATA_TABLE;
const CONTACT_DATA_TABLE = process.env.CONTACT_DATA_TABLE;

export function sendMessage(chat_id, text, message_metadata = {}) {
  const apiUrl = new URL(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  );

  apiUrl.searchParams.append("chat_id", chat_id);
  apiUrl.searchParams.append("text", text);
  apiUrl.searchParams.append("allow_sending_without_reply", true);
  if (message_metadata.messageId)
    apiUrl.searchParams.append(
      "reply_to_message_id",
      message_metadata.messageId
    );
  if (message_metadata.reply_markup)
    apiUrl.searchParams.append("reply_markup", message_metadata.reply_markup);

  return new Promise((resolve, reject) => {
    https
      .get(apiUrl, (response) => {
        resolve(response);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export async function createUser({
  user_id,
  is_bot,
  first_name,
  username,
  language_code,
}) {
  const params = {
    TableName: USER_DATA_TABLE,
    Item: {
      user_id,
      is_bot,
      first_name,
      username,
      language_code,
    },
  };

  return documentClient.put(params).promise();
}

export async function getUser(user_id) {
  const params = {
    TableName: USER_DATA_TABLE,
    KeyConditionExpression: `user_id = :user_id`,
    ExpressionAttributeValues: {
      ":user_id": user_id,
    },
    ConsistentRead: true,
  };

  const user = await documentClient.query(params).promise();
  if (user.Items.length === 0) return null;

  return user.Items[0];
}

export async function updateUserState(user_id, state, state_metadata) {
  const params = {
    TableName: USER_DATA_TABLE,
    Key: {
      user_id: user_id,
    },
    UpdateExpression: `set current_state = :current_state, state_metadata = :state_metadata`,
    ExpressionAttributeValues: {
      ":current_state": state,
      ":state_metadata": state_metadata,
    },
    ReturnValues: "UPDATED_NEW",
  };

  return documentClient.update(params).promise();
}

export async function getContact({ user_id, phone_number }) {
  const params = {
    TableName: CONTACT_DATA_TABLE,
    KeyConditionExpression: `user_id = :user_id AND phone_number = :phone_number`,
    ExpressionAttributeValues: {
      ":user_id": user_id,
      ":phone_number": phone_number,
    },
    ConsistentRead: true,
  };

  const contact = await documentClient.query(params).promise();
  if (contact.Items.length === 0) return null;

  return contact.Items[0];
}

export async function updateContact({
  user_id,
  phone_number,
  last_purchase_date,
  total_purchases,
  total_quantity,
  expected_purchase_date,
}) {
  const params = {
    TableName: CONTACT_DATA_TABLE,
    Key: {
      user_id,
      phone_number,
    },
    UpdateExpression: `set last_purchase_date = :last_purchase_date, total_purchases = :total_purchases, total_quantity = :total_quantity, expected_purchase_date = :expected_purchase_date`,
    ExpressionAttributeValues: {
      ":last_purchase_date": last_purchase_date.toISOString(),
      ":total_purchases": total_purchases,
      ":total_quantity": total_quantity,
      ":expected_purchase_date": expected_purchase_date
        ? expected_purchase_date.toISOString()
        : null,
    },
    ReturnValues: "UPDATED_NEW",
  };

  return documentClient.update(params).promise();
}

export async function registerContact({ user_id, first_name, phone_number }) {
  const params = {
    TableName: CONTACT_DATA_TABLE,
    Item: {
      user_id,
      first_name,
      phone_number,
      last_purchase_date: null,
      total_purchases: 0,
      total_quantity: 0,
    },
    ReturnValues: "ALL_OLD",
  };

  const result = await documentClient.put(params).promise();
  return result.Attributes;
}

export async function registerPurchase({
  user_id,
  chat_id,
  phone_number,
  first_name,
  quantity,
  purchase_date,
}) {
  const params = {
    TableName: PURCHASE_DATA_TABLE,
    Item: {
      user_id,
      chat_id,
      phone_number,
      first_name,
      register_date: new Date().toISOString(),
      quantity,
      purchase_date: purchase_date.toISOString(),
    },
  };

  return documentClient.put(params).promise();
}
