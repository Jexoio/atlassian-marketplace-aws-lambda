const { postEventDB, fetchEventDB } = require('./services/DynamoDB');
const {
  getNewTrials,
  getTransactions,
  getExpiredAndCancelledTrials,
  getChurnedSubscriptions
} = require('./services/Marketplace');
const {
  sendNewTrial,
  sendTransaction,
  sendExpiredAndCancelledTrial,
  sendChurnedSubscription
} = require('./services/Destination');
const { convertDate } = require('./services/Date');

const checkNewTrials = async () => {
  const licenses = await getNewTrials();
  if(!licenses || licenses.length == 0) return;
  for(let index of Object.keys(licenses)){
    const license = licenses[index];
    const eventName = 'trial_started';
    const dbRecordKey = `${eventName}-${license.addonLicenseId}-${license.lastUpdated}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const wasSent = await sendNewTrial({license, eventName});
      if(!wasSent) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};
const checkTransactions = async () => {
  const transactions = await getTransactions();
  if(!transactions || transactions.length == 0) return;
  for(let index of Object.keys(transactions)){
    const transaction = transactions[index];
    const eventName = 'subscription_paid';
    const dbRecordKey = `${eventName}-${transaction.transactionId}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const wasSent = await sendTransaction({transaction, eventName});
      if(!wasSent) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};
const checkExpiredAndCancelledTrials = async () => {
  const licenses = await getExpiredAndCancelledTrials();
  if(!licenses || licenses.length == 0) return;
  for(let index of Object.keys(licenses)){
    const license = licenses[index];
    const eventName = (license.status == 'cancelled')? 'trial_cancelled': 'trial_expired';
    const dbRecordKey = `${eventName}-${license.addonLicenseId}-${license.lastUpdated}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const wasSent = await sendExpiredAndCancelledTrial({license, eventName});
      if(!wasSent) return;
      await postEventDB({
        key: dbRecordKey,
        value: convertDate(new Date())
      });
    }
  }
};
const checkChurnedSubscriptions = async () => {
  const licenses = await getChurnedSubscriptions();
  if(!licenses || licenses.length == 0) return;
  for(let index of Object.keys(licenses)){
    const license = licenses[index];
    const eventName = 'subscription_churned';
    const dbRecordKey = `${eventName}-${license.addonLicenseId}-${license.lastUpdated}`;
    const isEventRegistered = await fetchEventDB({
      key: dbRecordKey
    });
    if(!isEventRegistered || !isEventRegistered.Item) {
      const wasSent = await sendChurnedSubscription({license, eventName});
      if(!wasSent) return;
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
    await checkChurnedSubscriptions();
    callback(null);
};
