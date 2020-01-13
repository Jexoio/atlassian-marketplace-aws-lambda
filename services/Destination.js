const {
  addNewPayWellTrial,
  addNewPayWellPayment,
  churnPayWellSubscription
} = require('./ProfitWell');
const {
  addNewUser,
  updateUser,
  registerEvent,
  addMarketingAttribution
} = require('./Segment');

module.exports.sendNewTrial = async ({license, eventName}) => {
  const addNewPayWellTrialResponse = await addNewPayWellTrial(license);
  const addNewUserRecordResponse = await addNewUser(license);
  const registerEventResponse = await registerEvent(eventName, license);
  if(
    addNewPayWellTrialResponse instanceof Error ||
    addNewUserRecordResponse instanceof Error ||
    registerEventResponse instanceof Error
  ) return false;
  return true;
};

module.exports.sendMarketingAttribution = async (license) => {
  const addMarketingAttributionResponse = await addMarketingAttribution(license);
  if( addMarketingAttributionResponse instanceof Error) return false;
  return true;
};

module.exports.sendTransaction = async ({transaction, eventName}) => {
  const addNewPayWellPaymentResponse = await addNewPayWellPayment(transaction);
  const updateUserResponse = await updateUser(transaction);
  const registerEventResponse = await registerEvent(eventName, transaction);
  if(
    addNewPayWellPaymentResponse instanceof Error ||
    updateUserResponse instanceof Error ||
    registerEventResponse instanceof Error
  ) return false;
  return true;
};

module.exports.sendExpiredAndCancelledTrial = async ({license, eventName}) => {
  const churnPayWellSubscriptionResponse = await churnPayWellSubscription(license);
  const updateUserResponse = await updateUser(license);
  const registerEventResponse = await registerEvent(eventName, license);
  if(
    churnPayWellSubscriptionResponse instanceof Error ||
    updateUserResponse instanceof Error ||
    registerEventResponse instanceof Error
  ) return false;
  return true;
};

module.exports.sendChurnedSubscription = async ({license, eventName}) => {
  const churnPayWellSubscriptionResponse = await churnPayWellSubscription(license);
  const updateUserResponse = await updateUser(license);
  const registerEventResponse = await registerEvent(eventName, license);
  if(
    churnPayWellSubscriptionResponse instanceof Error ||
    updateUserResponse instanceof Error ||
    registerEventResponse instanceof Error
  ) return false;
  return true;
};
