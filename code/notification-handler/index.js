const aws = require("aws-sdk");
const https = require("https");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const USER_DATA_TABLE = process.env.USER_DATA_TABLE;
const PURCHASE_DATA_TABLE = process.env.PURCHASE_DATA_TABLE;
const CONTACT_DATA_TABLE = process.env.CONTACT_DATA_TABLE;

const documentClient = new aws.DynamoDB.DocumentClient();

function sendMessage(chatId, text, message_metadata = {}) {
  const apiUrl = new URL(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  );

  apiUrl.searchParams.append("chat_id", chatId);
  apiUrl.searchParams.append("text", text);
  apiUrl.searchParams.append("allow_sending_without_reply", true);
  apiUrl.searchParams.append("reply_to_message_id", message_metadata.messageId);
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

async function getContact(userId, phoneNumber) {
  const params = {
    TableName: CONTACT_DATA_TABLE,
    KeyConditionExpression: `user_id = :user_id AND phone_number = :phone_number`,
    ExpressionAttributeValues: {
      ":user_id": userId,
      ":phone_number": phoneNumber,
    },
    ConsistentRead: true,
  };

  const contact = await documentClient.query(params).promise();
  if (contact.Items.length === 0) return null;

  return contact.Items[0];
}

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event));

  // Accessing event properties
  const { detail, source, time } = event;

  // Use the properties as needed
  console.log("Event Detail:", detail);
  console.log("Event Source:", source);
  console.log("Event Time:", time);

  return { statusCode: 200 };
};
