const { find } = require('lodash');
const request = require('request-promise-native');
const { sendErrorNotification } = require('./Slack');
const PW_PATH = 'https://api.profitwell.com/v2';
const PROFITWELL_AUTH = process.env.PROFITWELL_AUTH;

module.exports.addNewPayWellTrial = async ({
  maintenanceStartDate,
  hostLicenseId,
  addonLicenseId,
  contactDetails,
  addonKey
}) => {
  const saleDate = (new Date(maintenanceStartDate).getTime()/1000);
  const json = {
    user_alias: hostLicenseId.toString(),
    subscription_alias: addonLicenseId.toString(),
    email: contactDetails.billingContact.email,
    plan_id: addonKey,
    plan_interval: 'month',
    plan_currency: "usd",
    status: "trialing",
    value: 0,
    effective_date: saleDate
  };
  try {
    const response = await request.post({
      url: `${PW_PATH}/subscriptions/`,
      json,
      headers: {
        'Content-Type': 'application/json',
        Authorization: PROFITWELL_AUTH
      },
    });
    return response;
  }
  catch(error) {
    console.error('ERROR: Cannot register PayWell Trial!', error);
    if([400,404].indexOf(error.statusCode) > -1) return {isDuplicate: true};
    sendErrorNotification(`ERROR: Cannot register PayWell Trial for ${contactDetails.company}!`);
    return new Error('Cannot register PayWell Trial!');
  }
};

const checkIfPayWellChurned = async ({
  hostLicenseId,
  addonKey,
  customerDetails,
  contactDetails
}) => {
  try {
    const response = await request.get({
      url: `${PW_PATH}/users/${hostLicenseId}/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: PROFITWELL_AUTH
      },
    });
    const history = JSON.parse(response);
    if(history && history.length > 0) {
      return find(history, {status: 'churned_voluntary', plan_id: addonKey});
    }
    return false;
  }
  catch(error) {
    let company;
    if(customerDetails) {
      company = customerDetails.company;
    }
    else if (contactDetails) {
      company = contactDetails.company;
    }
    console.log('ERROR: Failed checking for PayWell User churn!', error);
    if([400,404].indexOf(error.statusCode) > -1) return {isDuplicate: true};
    sendErrorNotification(`ERROR: Failed checking for PayWell User churn for ${company}!`);
    return new Error('Failed checking for PayWell User churn!');
  }
};

const unChurnPayWell = async ({
  addonLicenseId,
  customerDetails,
  contactDetails
}) => {
  try {
    const response = await request.put({
      url: `${PW_PATH}/unchurn/${addonLicenseId}/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: PROFITWELL_AUTH
      },
    });
    return response;
  }
  catch(error) {
    let company;
    if(customerDetails) {
      company = customerDetails.company;
    }
    else if (contactDetails) {
      company = contactDetails.company;
    }
    console.log('ERROR: Cannot unchurn PayWell Subscription!', error);
    if([400,404].indexOf(error.statusCode) > -1) return {isDuplicate: true};
    sendErrorNotification(`ERROR: Cannot unchurn PayWell Subscription for ${company}!`);
    return new Error('Cannot unchurn PayWell Subscription!');
  }
};

module.exports.churnPayWellSubscription = async ({
  addonLicenseId,
  customerDetails,
  contactDetails,
  maintenanceEndDate
}) => {
  try {
    const effective_date = (new Date(maintenanceEndDate).getTime()/1000);
    const response = await request.delete({
      url: `${PW_PATH}/subscriptions/${addonLicenseId}/?effective_date=${effective_date}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: PROFITWELL_AUTH
      },
    });
    return response;
  }
  catch(error) {
    let company;
    if(customerDetails) {
      company = customerDetails.company;
    }
    else if (contactDetails) {
      company = contactDetails.company;
    }
    console.log('ERROR: Cannot churn PayWell Subscription!', error);
    if([400,404].indexOf(error.statusCode) > -1) return {isDuplicate: true};
    sendErrorNotification(`ERROR: Cannot churn PayWell Subscription for ${company}!`);
    return new Error('Cannot churn PayWell Subscription!');
  }
};

module.exports.addNewPayWellPayment = async ({
  purchaseDetails: {
    saleDate,
    vendorAmount,
    billingPeriod
  },
  addonLicenseId,
  hostLicenseId,
  addonKey,
  customerDetails
}) => {
  const isChurned = await checkIfPayWellChurned({hostLicenseId, addonKey, customerDetails});
  if(isChurned) {
    await unChurnPayWell({addonLicenseId, customerDetails});
  }
  const effective_date = (new Date(saleDate).getTime()/1000);
  const value = Math.round(vendorAmount) * 100;
  const plan_interval = (billingPeriod == 'Annual')? 'year':'month';
  const json = {
    plan_id: addonKey,
    plan_interval,
    value,
    status: "active",
    effective_date
  };
  try {
    const response = await request.put({
      url: `${PW_PATH}/subscriptions/${addonLicenseId}/`,
      json,
      headers: {
        'Content-Type': 'application/json',
        Authorization: PROFITWELL_AUTH
      },
    });
    return response;
  }
  catch(error) {
    console.log('ERROR: Cannot register PayWell Payment!', error);
    if([400,404].indexOf(error.statusCode) > -1) return {isDuplicate: true};
    sendErrorNotification(`ERROR: Cannot register PayWell Payment for ${customerDetails.company}!`);
    return new Error('Cannot register PayWell Payment!');
  }
};
