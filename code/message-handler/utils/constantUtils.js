const REGISTER_PURCHASE_COMMAND = "🛒 Registrar compra";
const REPORT_COMMAND = "📊 Relatório";
const START_COMMAND = "/start";
const TODAY_PURCHASE_COMMAND = "📅 Hoje";
const YESTERDAY_PURCHASE_COMMAND = "📅 Ontem";
const CUSTOM_PURCHASE_COMMAND = "📅 Outra Data";

function WELCOME_MESSAGE(first_name) {
  return `Ola! Seja bem-vindo(a) ${first_name}`;
}

function CONTACT_DETAILS({
  phone_number,
  first_name,
  last_purchase_date,
  total_purchases,
  total_quantity,
}) {
  return `Cliente: ${first_name} \nTelefone: ${phone_number} \nÚltima compra: ${last_purchase_date} \nTotal de compras: ${total_purchases} \nTotal de gás: ${total_quantity}`;
}

const USER_NOT_ACTIVE_MESSAGE = "Usuário inativo! Entre em contato com o admin";
const INVALID_REGISTRATION_DATE_MESSAGE = "Data inválida! Tente novamente";
const CONTACT_SENT_MESSAGE = "Selecione uma das opções";
const PURCHASE_REGISTRATION_QUANTITY_MESSAGE =
  "Digite a quantidade de gás comprada";
const PURCHASE_REGISTRATION_DATE_MESSAGE = "Quando a compra foi feita?";
const PURCHASE_REGISTRATION_SUCCESS_MESSAGE = "Compra registrada com sucesso!";
const PUCHASE_REGISTRATION_CUSTOM_DATE_MESSAGE =
  "Digite a data da compra (ex: 31/01/2021)";

module.exports = {
  USER_NOT_ACTIVE_MESSAGE,
  REGISTER_PURCHASE_COMMAND,
  REPORT_COMMAND,
  START_COMMAND,
  TODAY_PURCHASE_COMMAND,
  YESTERDAY_PURCHASE_COMMAND,
  CUSTOM_PURCHASE_COMMAND,

  WELCOME_MESSAGE,
  CONTACT_DETAILS,

  INVALID_REGISTRATION_DATE_MESSAGE,
  CONTACT_SENT_MESSAGE,
  PURCHASE_REGISTRATION_QUANTITY_MESSAGE,
  PURCHASE_REGISTRATION_DATE_MESSAGE,
  PURCHASE_REGISTRATION_SUCCESS_MESSAGE,
  PUCHASE_REGISTRATION_CUSTOM_DATE_MESSAGE,
};
