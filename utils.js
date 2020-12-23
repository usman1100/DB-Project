const get_current_date = () => {
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  let new_date = year + "-" + month + "-" + date;

  return new_date;
};

const get_formated_date = (date_unf) => {
  let date = String(date_unf);
  return date.slice(3, 15);
};

module.exports = {
  get_current_date: get_current_date,
  get_formated_date: get_formated_date,
};
