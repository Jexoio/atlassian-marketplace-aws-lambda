module.exports.convertDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
};

module.exports.today = () => {
  const todayDate = new Date();
  todayDate.setHours(todayDate.getHours() - 1);
  return module.exports.convertDate(todayDate);
};
module.exports.yesterday = () => {
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate()-1);
  yesterdayDate.setHours(yesterdayDate.getHours() - 1);
  return module.exports.convertDate(yesterdayDate);
};
module.exports.twoDaysAgo = () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate()-1);
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 1);
  return module.exports.convertDate(twoDaysAgo);
};
module.exports.fiveDaysAgo = () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate()-5);
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 1);
  return module.exports.convertDate(twoDaysAgo);
};
module.exports.twoWeeksAgo = () => {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
  twoWeeksAgo.setHours(twoWeeksAgo.getHours() - 1);
  return module.exports.convertDate(twoWeeksAgo);
};
