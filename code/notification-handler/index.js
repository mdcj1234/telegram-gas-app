const {
  sendMessage,
  listContacts,
  listActiveUsers,
  updateContact,
} = require("./dynamodb");

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event));

  const users = await listActiveUsers();
  console.log(users);

  for (const user of users) {
    const contacts = await listContacts({ user_id: user.user_id });
    console.log(contacts);

    const updateContactsPromises = [];

    if (contacts.length > 0) {
      const message = `Olá, ${user.first_name}! Estamos passando para avisar que alguns de seus clientes podem estar ficando sem gás.`;
      await sendMessage(user.chat_id, message);
    }

    for (const contact of contacts) {
      const { last_purchase_date, phone_number, first_name, user_id } = contact;
      const message = `O contato ${first_name} telefone ${phone_number} fez a última compra no dia ${last_purchase_date}`;
      await sendMessage(contact.chat_id, message);
      updateContactsPromises.push(
        updateContact({
          user_id,
          phone_number,
          notified: true,
        })
      );
    }

    await Promise.all(updateContactsPromises);
  }

  return { statusCode: 200 };
};
