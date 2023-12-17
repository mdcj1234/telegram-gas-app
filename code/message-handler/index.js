const { isValidDateRegex, convertTextToDate } = require("./utils/formatUtils");

const {
  START_STATE,
  CONTACT_SENT_STATE,
  REGISTER_PURCHASE_VALUE_STATE,
  REGISTER_PURCHASE_DATE_STATE,
  REPORT_STATE,
} = require("./config/stateConfig");

const {
  sendMessage,
  createUser,
  getUser,
  updateUserState,
  registerPurchase,
  getContact,
  registerContact,
  updateContact,
} = require("./dynamodb/dynamodbUtils");

const {
  REGISTER_PURCHASE_COMMAND,
  REPORT_COMMAND,
  START_COMMAND,
  TODAY_PURCHASE_COMMAND,
  YESTERDAY_PURCHASE_COMMAND,
  CUSTOM_PURCHASE_COMMAND,
  WELCOME_MESSAGE,
  CONTACT_DETAILS,
  PURCHASE_REGISTRATION_QUANTITY_MESSAGE,
  PURCHASE_REGISTRATION_DATE_MESSAGE,
  PURCHASE_REGISTRATION_SUCCESS_MESSAGE,
  PUCHASE_REGISTRATION_CUSTOM_DATE_MESSAGE,
  CONTACT_SENT_MESSAGE,
} = require("./utils/constantUtils");

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  console.log(body);

  if (!body || !body.message) {
    return { statusCode: 400 };
  }

  const { contact, from, chat, message_id, text } = body.message;

  const user = await getUser(from.id.toString());
  console.log(user);

  let user_metadata = {};
  let user_current_state = START_STATE;
  if (user) {
    user_metadata = user.state_metadata;
    user_current_state = user.current_state;
  }

  if (text) {
    if (text === START_COMMAND) {
      console.log(" --- /start command --- ");
      if (!user) {
        await createUser({
          user_id: from.id.toString(),
          is_bot: from.from,
          first_name: from.first_name,
          username: from.username,
          language_code: from.language_code,
          current_state: START_STATE,
          state_metadata: {},
        });
        await sendMessage(chat.id.toString(), WELCOME_MESSAGE(from.first_name));
      }
    }

    switch (user_current_state) {
      case CONTACT_SENT_STATE:
        if (text === REGISTER_PURCHASE_COMMAND) {
          console.log(" --- Registrar Compra command --- ");
          console.log(user_metadata);
          await sendMessage(
            chat.id.toString(),
            PURCHASE_REGISTRATION_QUANTITY_MESSAGE
          );
          updateUserState(from.id.toString(), REGISTER_PURCHASE_VALUE_STATE, {
            ...user_metadata,
          });
        } else if (text === REPORT_COMMAND) {
          console.log(" --- Relatório do cliente command --- ");
          console.log(user_metadata);
          sendMessage(from.id.toString(), CONTACT_DETAILS(user_metadata));
          updateUserState(from.id.toString(), REPORT_STATE, {});
        }
        break;
      case REGISTER_PURCHASE_VALUE_STATE:
        if (!isNaN(text)) {
          console.log(" --- Registrar quantidade da compra command --- ");
          console.log(user_metadata);
          const quantity = parseFloat(text);

          await sendMessage(
            chat.id.toString(),
            PURCHASE_REGISTRATION_DATE_MESSAGE,
            {
              reply_markup: JSON.stringify({
                keyboard: [
                  [
                    {
                      text: TODAY_PURCHASE_COMMAND,
                    },
                    {
                      text: YESTERDAY_PURCHASE_COMMAND,
                    },
                    {
                      text: CUSTOM_PURCHASE_COMMAND,
                    },
                  ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true,
              }),
              message_id,
            }
          );

          updateUserState(from.id.toString(), REGISTER_PURCHASE_DATE_STATE, {
            ...user_metadata,
            quantity,
          });
        }
        break;
      case REGISTER_PURCHASE_DATE_STATE:
        if (
          text === TODAY_PURCHASE_COMMAND ||
          text === YESTERDAY_PURCHASE_COMMAND ||
          isValidDateRegex(text)
        ) {
          console.log(" --- Registrar compra command --- ");
          console.log(user_metadata);

          const {
            phone_number,
            first_name,
            quantity,
            total_purchases,
            total_quantity,
            last_purchase_date,
          } = user_metadata;

          let purchase_date = new Date();
          if (text === YESTERDAY_PURCHASE_COMMAND)
            purchase_date.setDate(purchase_date.getDate() - 1);
          else if (isValidDateRegex(text))
            purchase_date = convertTextToDate(text);

          await process_purchase_data({
            user_id: from.id.toString(),
            chat_id: chat.id.toString(),
            quantity: parseFloat(quantity),
            first_name,
            purchase_date,
            total_purchases: parseFloat(total_purchases),
            total_quantity: parseFloat(total_quantity),
            last_purchase_date,
            phone_number,
          });

          await updateUserState(from.id.toString(), START_STATE, {});
          await sendMessage(
            chat.id.toString(),
            PURCHASE_REGISTRATION_SUCCESS_MESSAGE
          );
        } else if (text === CUSTOM_PURCHASE_COMMAND) {
          console.log(" --- Registrar compra outra data command --- ");
          console.log(user_metadata);

          await sendMessage(
            chat.id.toString(),
            PUCHASE_REGISTRATION_CUSTOM_DATE_MESSAGE
          );
        }

        break;
    }
  }

  if (contact) {
    console.log(" --- New contact received --- ");
    const { phone_number, first_name } = contact;

    let registered_contact = await getContact({
      user_id: from.id.toString(),
      phone_number,
    });

    if (!registered_contact) {
      console.log(" --- New contact registered --- ");
      registered_contact = await registerContact({
        user_id: from.id.toString(),
        first_name,
        phone_number,
      });
    }

    console.log(registered_contact);
    const { last_purchase_date, total_purchases, total_quantity } =
      registered_contact;

    await sendMessage(chat.id.toString(), CONTACT_SENT_MESSAGE, {
      reply_markup: JSON.stringify({
        keyboard: [
          [
            {
              text: REGISTER_PURCHASE_COMMAND,
            },
            {
              text: REPORT_COMMAND,
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      }),
      message_id,
    });

    await updateUserState(from.id.toString(), CONTACT_SENT_STATE, {
      phone_number,
      first_name,
      last_purchase_date,
      total_purchases,
      total_quantity,
    });
  }

  return { statusCode: 200 };
};

async function process_purchase_data({
  user_id,
  chat_id,
  quantity,
  first_name,
  purchase_date,
  total_purchases,
  total_quantity,
  last_purchase_date,
  phone_number,
}) {
  await registerPurchase({
    user_id,
    chat_id,
    first_name,
    phone_number,
    quantity,
    purchase_date,
  });

  total_purchases += 1;
  total_quantity += quantity;

  let expected_purchase_date = null;

  if (last_purchase_date) {
    const purchaseDate = new Date(purchase_date);
    const lastPurchaseDate = new Date(last_purchase_date);
    const differenceInTime =
      purchaseDate.getTime() - lastPurchaseDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays > 0) {
      expected_purchase_date = new Date();
      expected_purchase_date.setDate(
        expected_purchase_date.getDate() + differenceInDays
      );
    }

    if (purchaseDate > lastPurchaseDate) {
      last_purchase_date = purchaseDate;
    }
  } else {
    last_purchase_date = purchase_date;
  }

  await updateContact({
    user_id,
    chat_id,
    phone_number,
    last_purchase_date,
    total_purchases: parseFloat(total_purchases),
    total_quantity: parseFloat(total_quantity),
    expected_purchase_date,
  });
}
