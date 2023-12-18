function isValidDateRegex(text) {
  const regex = new RegExp(
    "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/(19|20)[0-9]{2}$"
  );
  return regex.test(text);
}

function convertTextToDate(text) {
  const dateParts = text.split("/");
  const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  return date;
}

module.exports = {
  isValidDateRegex,
  convertTextToDate,
};
