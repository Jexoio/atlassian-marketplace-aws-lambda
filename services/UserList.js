const request = require('request-promise-native');
const { sendErrorNotification } = require('./Slack');
const UL_PATH = 'https://push.userlist.io';
const USERLIST_AUTH = process.env.USERLIST_AUTH;

module.exports.addNewUserListRecord = async ({
  maintenanceStartDate,
  hostLicenseId,
  addonLicenseId,
  contactDetails,
  addonKey,
  addonName
}) => {
  const contact = contactDetails.billingContact || contactDetails.technicalContact;
  const contactName = contactDetails.billingContact.name || contactDetails.technicalContact.name;
  let first_name = contactName;
  let last_name = '';
  const signed_up_at = new Date(maintenanceStartDate).toISOString();
  const json = {
    identifier: hostLicenseId,
    email: contact.email,
    signed_up_at,
    properties: {
      first_name,
      last_name,
      company: contactDetails.company,
      country: contactDetails.country,
      [addonKey]: {
        addon_key: addonKey,
        addon_name: addonName,
        addon_licenseId: addonLicenseId,
        status: 'Trialling'
      }
    }
  };
  try {
    const response = await request.post({
      url: `${UL_PATH}/users`,
      json,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Push ${USERLIST_AUTH}`
      },
    });
    return response;
  }
  catch(error) {
    console.error('ERROR: Cannot create UserList User!', error);
    sendErrorNotification(`ERROR: Cannot rcreate UserList User for ${contactDetails.company}!`);
    return new Error('Cannot create UserList User!');
  }
};

module.exports.updateUserListRecord = async ({
  purchaseDetails,
  addonLicenseId,
  hostLicenseId,
  addonKey,
  addonName,
  customerDetails,
  contactDetails,
  status,
  licenseType
}) => {
  let setStatus = 'Trialling';
  if(purchaseDetails) {
    setStatus = 'Paying';
  }
  else if(status && licenseType) {
    if(status == 'inactive' && licenseType == 'EVALUATION') {
      setStatus = 'Expired';
    }
    else if(status == 'cancelled' && licenseType == 'EVALUATION') {
      setStatus = 'Cancelled';
    }
    else if(status == 'active' && licenseType == 'COMMERCIAL') {
      setStatus = 'Paying';
    }
    else if(status == 'cancelled' && licenseType == 'COMMERCIAL') {
      setStatus = 'Churned';
    }
    else if(status == 'inactive' && licenseType == 'COMMERCIAL') {
      setStatus = 'Churned';
    }
  }
  const json = {
    identifier: hostLicenseId,
    properties: {
      [addonKey]: {
        addon_key: addonKey,
        addon_name: addonName,
        addon_licenseId: addonLicenseId,
        status: setStatus
      }
    }
  };
  try {
    const response = await request.post({
      url: `${UL_PATH}/users`,
      json,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Push ${USERLIST_AUTH}`
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
    console.log('ERROR: Cannot update UserList Profile after payment!', error);
    sendErrorNotification(`ERROR: Cannot update UserList Profile after payment for ${company}!`);
    return new Error('Cannot update UserList Profile after payment!');
  }
};

module.exports.registerUserListEvent = async (eventName, {
  purchaseDetails,
  addonLicenseId,
  hostLicenseId,
  addonKey,
  addonName,
  customerDetails,
  contactDetails,
  lastUpdated
}) => {
  let occured_at = null;
  if(purchaseDetails) {
    occured_at = new Date(purchaseDetails.saleDate).toISOString();
  }
  else if (lastUpdated) {
    occured_at = new Date(lastUpdated).toISOString();
  }
  let properties = {
    addon_key: addonKey,
    addon_name: addonName,
    addon_licenseId: addonLicenseId
  };
  if(eventName == 'subscription_paid') {
    properties.amount = `$${purchaseDetails.vendorAmount}`;
  }
  let argsUserListEvent = {
    name: eventName,
    user: hostLicenseId,
    occured_at,
    properties
  };
  try {
    const response = await request.post({
      url: `${UL_PATH}/events`,
      json: argsUserListEvent,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Push ${USERLIST_AUTH}`
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
    console.log('ERROR: Cannot register UserList Event after payment!', error);
    sendErrorNotification(`ERROR: Cannot register UserList Event after payment for ${company}!`);
    return new Error('Cannot register UserList Event after payment!');
  }
};
