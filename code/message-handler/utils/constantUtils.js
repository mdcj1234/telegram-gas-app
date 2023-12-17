export const REGISTER_PURCHASE_COMMAND = "🛒 Registrar compra";
export const REPORT_COMMAND = "📊 Relatório";
export const START_COMMAND = "/start";
export const TODAY_PURCHASE_COMMAND = "📅 Hoje";
export const YESTERDAY_PURCHASE_COMMAND = "📅 Ontem";
export const CUSTOM_PURCHASE_COMMAND = "📅 Outra Data";

export const WELCOME_MESSAGE = (first_name) => {
  return `Ola! Seja bem-vindo(a) ${first_name}`;
};

export const CONTACT_DETAILS = ({
  phone_number,
  first_name,
  last_purchase_date,
  total_purchases,
  total_quantity,
}) => {
  return `Cliente: ${first_name} \nTelefone: ${phone_number} \nÚltima compra: ${last_purchase_date} \nTotal de compras: ${total_purchases} \nTotal de gás: ${total_quantity}`;
};

export const CONTACT_SENT_MESSAGE = "Selecione uma das opções";
export const PURCHASE_REGISTRATION_QUANTITY_MESSAGE =
  "Digite a quantidade de gás comprada";
export const PURCHASE_REGISTRATION_DATE_MESSAGE = "Quando a compra foi feita?";
export const PURCHASE_REGISTRATION_SUCCESS_MESSAGE =
  "Compra registrada com sucesso!";
export const PUCHASE_REGISTRATION_CUSTOM_DATE_MESSAGE =
  "Digite a data da compra (ex: 31/01/2021)";
