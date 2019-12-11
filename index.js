const request = require('request-promise-native');
const { addNewPayWellTrial, addNewPayWellPayment, churnPayWellSubscription } = require('./services/ProfitWell');
const { addNewUserListRecord, updateUserListRecord, registerUserListEvent } = require('./services/UserList');
const { postEventDB, fetchEventDB } = require('./services/DynamoDB');
const { sendErrorNotification } = require('./services/Slack');
const { today, yesterday, twoDaysAgo, fiveDaysAgo, twoWeeksAgo, convertDate } = require('./services/Date');
const MP_AUTH = "Basic " + Buffer.from(process.env.MP_AUTH_USER + ":" + process.env.MP_AUTH_PASS).toString("base64");
const MP_PATH = "https://marketplace.atlassian.com/rest/2";
const VENDOR_ID = process.env.VENDOR_ID;

const checkNewTrials = async () => {
  let licenses;
  try {
    const getLicenses = await request.get({
        url: `${MP_PATH}/vendors/${VENDOR_ID}/reporting/licenses/export?accept=json&sortBy=startDate&order=asc&licenseType=evaluation&status=active&startDate=${fiveDaysAgo()}&endDate=${today()}&dateType=start`,
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
  if(!licenses || licenses.length == 0) return;
  for(let index of Object.keys(licenses)){
    const license = licenses[index];
    const eventName = 'trial_started';
    const dbRecordKey = `${eventName}-${license.addonLicenseId}-${license.lastUpdated}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const addNewPayWellTrialResponse = await addNewPayWellTrial(license);
      const addNewUserListRecordResponse = await addNewUserListRecord(license);
      const registerUserListEventResponse = await registerUserListEvent(eventName, license);
      if(
        addNewPayWellTrialResponse instanceof Error ||
        addNewUserListRecordResponse instanceof Error ||
        registerUserListEventResponse instanceof Error
      ) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};
const checkTransactions = async () => {
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
  if(!transactions || transactions.length == 0) return;
  for(let index of Object.keys(transactions)){
    const transaction = transactions[index];
    const eventName = 'subscription_paid';
    const dbRecordKey = `${eventName}-${transaction.transactionId}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const addNewPayWellPaymentResponse = await addNewPayWellPayment(transaction);
      const updateUserListRecordResponse = await updateUserListRecord(transaction);
      const registerUserListEventResponse = await registerUserListEvent(eventName, transaction);
      if(
        addNewPayWellPaymentResponse instanceof Error ||
        updateUserListRecordResponse instanceof Error ||
        registerUserListEventResponse instanceof Error
      ) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};
const checkExpiredAndCancelledTrials = async () => {
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
  if(!licenses || licenses.length == 0) return;
  for(let index of Object.keys(licenses)){
    const license = licenses[index];
    const eventName = (license.status == 'cancelled')? 'trial_cancelled': 'trial_expired';
    const dbRecordKey = `${eventName}-${license.addonLicenseId}-${license.lastUpdated}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const churnPayWellSubscriptionResponse = await churnPayWellSubscription(license);
      const updateUserListRecordResponse = await updateUserListRecord(license);
      const registerUserListEventResponse = await registerUserListEvent(eventName, license);
      if(
        churnPayWellSubscriptionResponse instanceof Error ||
        updateUserListRecordResponse instanceof Error ||
        registerUserListEventResponse instanceof Error
      ) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};
const checkChurnedLicenses = async () => {
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
  if(!licenses || licenses.length == 0) return;
  for(let index of Object.keys(licenses)){
    const license = licenses[index];
    const eventName = 'subscription_churned';
    const dbRecordKey = `${eventName}-${license.addonLicenseId}-${license.lastUpdated}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const churnPayWellSubscriptionResponse = await churnPayWellSubscription(license);
      const updateUserListRecordResponse = await updateUserListRecord(license);
      const registerUserListEventResponse = await registerUserListEvent(eventName, license);
      if(
        churnPayWellSubscriptionResponse instanceof Error ||
        updateUserListRecordResponse instanceof Error ||
        registerUserListEventResponse instanceof Error
      ) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};

exports.handler = async (event, context, callback) => {
    await checkNewTrials();
    await checkTransactions();
    await checkExpiredAndCancelledTrials();
    await checkChurnedLicenses();
    callback(null);
};
