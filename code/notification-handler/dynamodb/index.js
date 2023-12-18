const aws = require("aws-sdk");
const https = require("https");

const documentClient = new aws.DynamoDB.DocumentClient();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const USER_DATA_TABLE = process.env.USER_DATA_TABLE;
const CONTACT_DATA_TABLE = process.env.CONTACT_DATA_TABLE;

function sendMessage(chat_id, text, message_metadata = {}) {
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

async function listActiveUsers() {
  const params = {
    TableName: USER_DATA_TABLE,
    FilterExpression: `active = :active`,
    ExpressionAttributeValues: {
      ":active": true,
    },
    ConsistentRead: true,
  };

  const users = await documentClient.scan(params).promise();
  return users.Items;
}

async function listContactsThatCouldBeWithoutGasNotNotified({ user_id }) {
  const alert_date = new Date();
  alert_date.setDate(alert_date.getDate() + 3);

  const params = {
    TableName: CONTACT_DATA_TABLE,
    KeyConditionExpression: `user_id = :user_id`,
    FilterExpression: `expected_purchase_date <= :alert_date AND (attribute_not_exists(notified) OR notified = :notified)`,
    ExpressionAttributeValues: {
      ":user_id": user_id,
      ":alert_date": alert_date.toISOString(),
      ":notified": false,
    },
    ConsistentRead: true,
  };

  const contacts = await documentClient.query(params).promise();
  return contacts.Items;
}

async function updateContact({ user_id, phone_number, notified }) {
  const params = {
    TableName: CONTACT_DATA_TABLE,
    Key: {
      user_id,
      phone_number,
    },
    UpdateExpression: `set notified = :notified`,
    ExpressionAttributeValues: {
      ":notified": notified,
    },
    ReturnValues: "UPDATED_NEW",
  };

  return documentClient.update(params).promise();
}

module.exports = {
  sendMessage,
  listActiveUsers,
  listContactsThatCouldBeWithoutGasNotNotified,
  updateContact,
};
