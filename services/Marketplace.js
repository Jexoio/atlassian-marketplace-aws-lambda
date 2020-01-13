const request = require('request-promise-native');
const { today, fiveDaysAgo } = require('./Date');
const { sendErrorNotification } = require('./Slack');
const MP_AUTH = "Basic " + Buffer.from(process.env.MP_AUTH_USER + ":" + process.env.MP_AUTH_PASS).toString("base64");
const MP_PATH = "https://marketplace.atlassian.com/rest/2";
const VENDOR_ID = process.env.VENDOR_ID;

module.exports.getNewTrials = async () => {
  let licenses;
  try {
    const getLicenses = await request.get({
        url: `${MP_PATH}/vendors/${VENDOR_ID}/reporting/licenses/export?accept=json&sortBy=startDate&order=asc&licenseType=evaluation&status=active&startDate=${fiveDaysAgo()}&endDate=${today()}&dateType=start&withAttribution=true`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: MP_AUTH
        },
      });
    licenses = JSON.parse(getLicenses);
  }
  catch(error) {
    console.error('ERROR: Cannot retrieve Marketplace Licenses!', error);
    sendErrorNotification(`ERROR: Cannot retrieve Marketplace Licenses!`);
  }
  return licenses;
};

module.exports.getTransactions = async () => {
  let transactions;
  try {
    const getTransactions = await request.get({
        url: `${MP_PATH}/vendors/${VENDOR_ID}/reporting/sales/transactions/export?accept=json&sortBy=transactionId&order=asc&lastUpdated=${fiveDaysAgo()}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: MP_AUTH
        },
      });
    transactions = JSON.parse(getTransactions);
  }
  catch(error) {
    console.error('ERROR: Cannot retrieve Marketplace Transactions!', error);
    sendErrorNotification(`ERROR: Cannot retrieve Marketplace Transactions!`);
  }
  return transactions;
};

module.exports.getExpiredAndCancelledTrials = async () => {
  let licenses;
  try {
    const getLicenses = await request.get({
        url: `${MP_PATH}/vendors/${VENDOR_ID}/reporting/licenses/export?accept=json&sortBy=startDate&order=asc&licenseType=evaluation&status=inactive&status=cancelled&lastUpdated=${fiveDaysAgo()}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: MP_AUTH
        },
      });
    licenses = JSON.parse(getLicenses);
  }
  catch(error) {
    console.error('ERROR: Cannot retrieve Marketplace Licenses!', error);
    sendErrorNotification(`ERROR: Cannot retrieve Marketplace Licenses!`);
  }
  return licenses;
};

module.exports.getChurnedSubscriptions = async () => {
  let licenses;
  try {
    const getLicenses = await request.get({
        url: `${MP_PATH}/vendors/${VENDOR_ID}/reporting/licenses/export?accept=json&sortBy=startDate&order=asc&licenseType=commercial&status=inactive&status=cancelled&lastUpdated=${fiveDaysAgo()}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: MP_AUTH
        },
      });
    licenses = JSON.parse(getLicenses);
  }
  catch(error) {
    console.error('ERROR: Cannot retrieve Marketplace Licenses!', error);
    sendErrorNotification(`ERROR: Cannot retrieve Marketplace Licenses!`);
  }
  return licenses;
};
