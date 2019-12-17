const {
  addNewPayWellTrial,
  addNewPayWellPayment,
  churnPayWellSubscription
} = require('./ProfitWell');
const {
  addNewUserListRecord,
  updateUserListRecord,
  registerUserListEvent
} = require('./UserList');
const {
  sendErrorNotification,
  sendNewTrialNotification, 
  sendNewClientNotification,
  sendCancelledNotification,
  sendChurnedNotification
} = require('./Slack');


module.exports.sendNewTrial = async ({license, eventName}) => {
  const addNewPayWellTrialResponse = await addNewPayWellTrial(license);
  const addNewUserListRecordResponse = await addNewUserListRecord(license);
  const registerUserListEventResponse = await registerUserListEvent(eventName, license);
  if(
    addNewPayWellTrialResponse instanceof Error ||
    addNewUserListRecordResponse instanceof Error ||
    registerUserListEventResponse instanceof Error
  ) return false;
  sendNewTrialNotification({
    company: license.contactDetails.company,
    app: license.addonName
  });
  return true;
};

module.exports.sendTransaction = async ({transaction, eventName}) => {
  const addNewPayWellPaymentResponse = await addNewPayWellPayment(transaction);
  const updateUserListRecordResponse = await updateUserListRecord(transaction);
  const registerUserListEventResponse = await registerUserListEvent(eventName, transaction);
  if(
    addNewPayWellPaymentResponse instanceof Error ||
    updateUserListRecordResponse instanceof Error ||
    registerUserListEventResponse instanceof Error
  ) return false;
  if(transaction.purchaseDetails.saleType == 'New') {
    sendNewClientNotification({
      company: transaction.customerDetails.company,
      app: transaction.addonName
    });
  }
  return true;
};

module.exports.sendExpiredAndCancelledTrial = async ({license, eventName}) => {
  const churnPayWellSubscriptionResponse = await churnPayWellSubscription(license);
  const updateUserListRecordResponse = await updateUserListRecord(license);
  const registerUserListEventResponse = await registerUserListEvent(eventName, license);
  if(
    churnPayWellSubscriptionResponse instanceof Error ||
    updateUserListRecordResponse instanceof Error ||
    registerUserListEventResponse instanceof Error
  ) return false;
  sendCancelledNotification({
    company: license.contactDetails.company,
    app: license.addonName,
    status: license.status
  });
  return true;
};

module.exports.sendChurnedSubscription = async ({license, eventName}) => {
  const churnPayWellSubscriptionResponse = await churnPayWellSubscription(license);
  const updateUserListRecordResponse = await updateUserListRecord(license);
  const registerUserListEventResponse = await registerUserListEvent(eventName, license);
  if(
    churnPayWellSubscriptionResponse instanceof Error ||
    updateUserListRecordResponse instanceof Error ||
    registerUserListEventResponse instanceof Error
  ) return false;
  sendChurnedNotification({
    company: license.contactDetails.company,
    app: license.addonName
  });
  return true;
};
